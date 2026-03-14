import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, FileText, AlertCircle } from 'lucide-react';

export default function LeaveApplication() {
  const { currentUser, userData } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Sick Leave'
  });

  // Real-time listener for student's leave history
  useEffect(() => {
    if (!currentUser) return;

    // FIX: Removed orderBy to prevent "Missing Index" error
    const q = query(
      collection(db, 'leaves'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // FIX: Sort client-side instead
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setLeaves(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaves:", error);
      toast.error("Could not load history");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      return toast.error("End date cannot be before start date");
    }

    try {
      await addDoc(collection(db, 'leaves'), {
        userId: currentUser.uid,
        userName: userData.name || "Student",
        userRole: 'student',
        class: userData.class || 'N/A', 
        section: userData.section || 'N/A',
        ...formData,
        status: 'pending_teacher', // Step 1: Goes to Teacher
        createdAt: new Date().toISOString()
      });
      
      toast.success("Leave application submitted!");
      setFormData({ startDate: '', endDate: '', reason: '', type: 'Sick Leave' });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit application");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // pending_teacher
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Application</h1>
          <p className="text-gray-500">Manage your leave requests and view status.</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg flex items-center text-blue-700 text-sm">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Approvals depend on your Class Teacher & Admin.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            New Application
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select 
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option>Sick Leave</option>
                <option>Casual Leave</option>
                <option>Emergency</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input 
                  type="date" 
                  required
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input 
                  type="date" 
                  required
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea 
                required
                rows="4"
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Please describe why you need leave..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transform transition-all active:scale-95"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Application History
          </h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No leave applications found.</p>
            </div>
          ) : (
            leaves.map((leave) => (
              <div key={leave.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{leave.type}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                          {leave.status === 'pending_teacher' ? 'Waiting for Teacher' :
                           leave.status === 'pending_admin' ? 'Waiting for Admin' : 
                           leave.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(leave.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm mt-2 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {leave.startDate} — {leave.endDate}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-3 text-sm bg-gray-50 p-3 rounded-lg">
                      "{leave.reason}"
                    </p>
                    {/* Remarks Section */}
                    {(leave.teacherRemark || leave.adminRemark) && (
                      <div className="mt-3 text-xs space-y-1 bg-white border p-2 rounded">
                        {leave.teacherRemark && <p className="text-indigo-600"><span className="font-bold">Teacher:</span> {leave.teacherRemark}</p>}
                        {leave.adminRemark && <p className="text-purple-600"><span className="font-bold">Admin:</span> {leave.adminRemark}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}