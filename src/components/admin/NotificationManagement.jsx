import { useState, useEffect } from 'react';
import { 
  Bell, Plus, Edit, Trash2, Eye, EyeOff, 
  AlertCircle, Info, CheckCircle, XCircle 
} from 'lucide-react';
import { 
  collection, getDocs, addDoc, updateDoc, 
  deleteDoc, doc, query, orderBy 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    isActive: true,
    expiryDate: '',
    targetAudience: 'all'
  });

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: Info, color: 'blue' },
    { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'yellow' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'green' },
    { value: 'error', label: 'Error', icon: XCircle, color: 'red' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const audiences = [
    { value: 'all', label: 'Everyone' },
    { value: 'students', label: 'Students Only' },
    { value: 'teachers', label: 'Teachers Only' },
    { value: 'parents', label: 'Parents Only' },
    { value: 'admin', label: 'Admin Only' }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const notificationData = [];
      snapshot.forEach((doc) => {
        notificationData.push({ id: doc.id, ...doc.data() });
      });
      
      setNotifications(notificationData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const notificationData = {
        ...formData,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        updatedAt: new Date()
      };

      if (editingNotification) {
        await updateDoc(doc(db, 'notifications', editingNotification.id), notificationData);
        toast.success('Notification updated successfully');
      } else {
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          createdAt: new Date()
        });
        toast.success('Notification created successfully');
      }
      
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error('Failed to save notification');
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      ...notification,
      expiryDate: notification.expiryDate ? 
        format(notification.expiryDate.toDate(), 'yyyy-MM-dd') : ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const toggleActive = async (notification) => {
    try {
      await updateDoc(doc(db, 'notifications', notification.id), {
        isActive: !notification.isActive,
        updatedAt: new Date()
      });
      toast.success(`Notification ${!notification.isActive ? 'activated' : 'deactivated'}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      isActive: true,
      expiryDate: '',
      targetAudience: 'all'
    });
    setEditingNotification(null);
    setShowAddModal(false);
  };

  const getTypeConfig = (type) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="bg-white rounded-lg p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
            <p className="text-gray-600 mt-2">Create and manage college announcements</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Notification</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => {
            const typeConfig = getTypeConfig(notification.type);
            const Icon = typeConfig.icon;
            
            return (
              <div key={notification.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg bg-${typeConfig.color}-100`}>
                      <Icon className={`h-5 w-5 text-${typeConfig.color}-600`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {audiences.find(a => a.value === notification.targetAudience)?.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Created: {format(notification.createdAt.toDate(), 'MMM dd, yyyy')}
                        </span>
                        {notification.expiryDate && (
                          <span>
                            Expires: {format(notification.expiryDate.toDate(), 'MMM dd, yyyy')}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          notification.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActive(notification)}
                      className={`p-2 rounded-lg transition-colors ${
                        notification.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={notification.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {notification.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(notification)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {notifications.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">Create your first notification to get started.</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingNotification ? 'Edit Notification' : 'Create New Notification'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter notification title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter notification message"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {notificationTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <select
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {audiences.map(audience => (
                          <option key={audience.value} value={audience.value}>
                            {audience.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date (Optional)
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Active (visible to users)
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingNotification ? 'Update Notification' : 'Create Notification'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}