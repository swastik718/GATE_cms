import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc // Import setDoc to specify the ID manually
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import { createSystemUser } from '../../utils/adminAuth'; // Import the helper
import toast from 'react-hot-toast';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // Added password field
    phone: '',
    subjects: [],
    classes: [],
    qualification: '',
    experience: '',
    address: '',
    photo: '',
    employeeId: '',
    joiningDate: '',
    salary: '',
    department: '',
    role: 'teacher'
  });

  const subjects = [
    'Mathematics', 'English', 'Science',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Physical Education','Electronics', 'Programming',
    'Business studies'
  ];

  const classes = ["BCA","BTECH","MCA","MSC","BSC","MBA"];
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Business Administration'];

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
    setCurrentPage(1);
  }, [teachers, searchTerm]);

  const fetchTeachers = async () => {
    try {
      const teachersRef = collection(db, 'teachers');
      const q = query(teachersRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      const teacherData = [];
      snapshot.forEach((doc) => {
        teacherData.push({ id: doc.id, ...doc.data() });
      });
      
      setTeachers(teacherData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = teachers;

    if (searchTerm) {
      filtered = filtered.filter((teacher) => {
        return (
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (teacher.subjects && teacher.subjects.some((subject) => {
            return subject.toLowerCase().includes(searchTerm.toLowerCase());
          }))
        );
      });
    }

    setFilteredTeachers(filtered);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (e, field) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const photoUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        photo: photoUrl
      }));
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.employeeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Password Validation for New Users
    if (!editingTeacher && (!formData.password || formData.password.length < 6)) {
      toast.error('Password is required and must be at least 6 characters');
      return;
    }

    try {
      toast.loading(editingTeacher ? "Updating teacher..." : "Creating teacher account...");

      // Prepare Teacher Profile Data
      const teacherProfileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subjects: formData.subjects || [],
        classes: formData.classes || [],
        qualification: formData.qualification,
        experience: formData.experience,
        address: formData.address,
        photo: formData.photo,
        employeeId: formData.employeeId,
        joiningDate: formData.joiningDate,
        salary: formData.salary,
        department: formData.department,
        role: 'teacher',
        updatedAt: new Date()
      };

      if (editingTeacher) {
        // --- EDIT MODE ---
        // We only update the Firestore document. 
        // Changing email/password in Auth requires Admin SDK or user action, skipping for simplicity here.
        await updateDoc(doc(db, 'teachers', editingTeacher.id), teacherProfileData);
        // Also update the public 'users' record to keep name/role in sync
        await updateDoc(doc(db, 'users', editingTeacher.id), {
          name: formData.name,
          email: formData.email,
          role: 'teacher' 
        });
        toast.dismiss();
        toast.success('Teacher updated successfully');
      } else {
        // --- CREATE MODE ---
        
        // 1. Create the Authentication User & 'users' collection record
        // This helper function handles the "create user without logout" magic
        const newUserId = await createSystemUser(
          formData.email, 
          formData.password, 
          { name: formData.name, role: 'teacher' }
        );

        // 2. Create the Detailed Teacher Profile
        // We use setDoc with the SAME ID (newUserId) so Auth UID === Teacher Doc ID
        await setDoc(doc(db, 'teachers', newUserId), {
          ...teacherProfileData,
          uid: newUserId,
          createdAt: new Date()
        });

        toast.dismiss();
        toast.success('Teacher account created successfully!');
      }
      
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.dismiss();
      // Improved error messaging
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered.');
      } else {
        toast.error('Failed to save teacher: ' + error.message);
      }
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      ...teacher,
      password: '', // Don't populate password on edit
      subjects: teacher.subjects || [],
      classes: teacher.classes || []
    });
    setShowAddModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('Are you sure? This will delete the teacher profile AND revoke their login access immediately.')) return;
    
    try {
      toast.loading("Revoking access...");
      // 1. Delete from 'teachers' collection (The Profile)
      await deleteDoc(doc(db, 'teachers', teacherId));
      
      // 2. Delete from 'users' collection (The Login Access)
      // The AuthContext listener on the client side will detect this deletion and log the user out if they are active.
      await deleteDoc(doc(db, 'users', teacherId));
      
      toast.dismiss();
      toast.success('Teacher access revoked and profile deleted.');
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.dismiss();
      toast.error('Failed to delete teacher');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      subjects: [],
      classes: [],
      qualification: '',
      experience: '',
      address: '',
      photo: '',
      employeeId: '',
      joiningDate: '',
      salary: '',
      department: '',
      role: 'teacher'
    });
    setEditingTeacher(null);
    setShowAddModal(false);
    setShowPassword(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
            <p className="text-gray-600 mt-2">Manage teaching staff, assignments, and access control</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Teacher</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search teachers by name, email or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Total Teachers: <span className="font-semibold">{filteredTeachers.length}</span>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => requestSort('name')} className="flex items-center group">
                      Name
                      <span className="ml-1 text-gray-400 group-hover:text-gray-600">
                        {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ChevronUp size={14} className="opacity-0 group-hover:opacity-50"/>}
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            src={teacher.photo || 'https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={teacher.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                          <div className="text-xs text-gray-500">{teacher.department || 'General'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.slice(0, 3).map((sub, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {sub}
                          </span>
                        ))}
                        {teacher.subjects?.length > 3 && <span className="text-xs text-gray-400">+{teacher.subjects.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes?.slice(0, 3).map((cls, index) => (
                          <span key={index} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            {cls}
                          </span>
                        ))}
                        {teacher.classes?.length > 3 && <span className="text-xs text-gray-400">...</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Revoke Access & Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {currentItems.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No teachers found matching your search.
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredTeachers.length > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredTeachers.length)}</span> of{' '}
                <span className="font-medium">{filteredTeachers.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => goToPage(number)}
                      className={`px-3 py-1 text-sm rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                  {editingTeacher ? 'Edit Teacher Details' : 'Add New Teacher'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo Upload Section */}
                    <div className="md:col-span-2 flex justify-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          {formData.photo ? (
                            <img src={formData.photo} alt="Preview" className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md" />
                          ) : (
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                              <Upload className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {uploading ? 'Uploading...' : 'Change Photo'}
                        </label>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Sarah Wilson"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. TCH-2024-01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login ID) *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        // Disable email editing if not creating new
                        readOnly={!!editingTeacher} 
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${editingTeacher ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    {/* Password Field - Only visible when adding new teacher */}
                    {!editingTeacher && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Min. 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <select
                          multiple
                          name="subjects"
                          value={formData.subjects}
                          onChange={(e) => handleMultiSelectChange(e, 'subjects')}
                          className="w-full px-4 py-2 h-32 focus:outline-none"
                        >
                          {subjects.map(subject => (
                            <option key={subject} value={subject} className="p-1 hover:bg-blue-50">{subject}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Classes</label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <select
                          multiple
                          name="classes"
                          value={formData.classes}
                          onChange={(e) => handleMultiSelectChange(e, 'classes')}
                          className="w-full px-4 py-2 h-32 focus:outline-none"
                        >
                          {classes.map(cls => (
                            <option key={cls} value={cls} className="p-1 hover:bg-blue-50">Class {cls}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                      <input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {editingTeacher ? 'Update Teacher' : 'Create Account'}
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