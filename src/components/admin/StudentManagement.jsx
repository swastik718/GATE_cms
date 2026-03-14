import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  Download,
  Filter,
  UserPlus,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Copy
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
  where,
  limit,
  startAfter,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // New State for UI Toggles
  const [sameAddress, setSameAddress] = useState(false);
  const [showSiblings, setShowSiblings] = useState(false);
  const [siblings, setSiblings] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);

  // Academic years from 2024-25 to 2030-31
  const academicYears = [
    '2024-25',
    '2025-26', 
    '2026-27',
    '2027-28',
    '2028-29',
    '2029-30',
    '2030-31'
  ];

  const classes = ["BCA","BTECH","MCA","MSC","BSC","MBA"];
  const sections = ['A', 'B', 'C', 'D'];
  const castes = ['GEN', 'SC', 'ST', 'OBC', 'SEBC'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', 
    class: '', 
    section: '',
    rollNo: '', 
    birthDate: '',
    photo: '',
    academicYear: academicYears[0],
    admissionDate: '',
    bloodGroup: '',
    password: '',
    confirmPassword: '',
    
    // New Fields
    height: '',
    weight: '',
    caste: '',
    aadharNo: '',
    transportMode: '',
    
    // Permanent Address
    permAt: '',
    permPost: '',
    permVia: '',
    permDist: '',
    permMobile: '',
    
    // Correspondence Address
    corrAt: '',
    corrPost: '',
    corrVia: '',
    corrDist: '',
    corrMobile: '',
    
    // Father Info
    fatherName: '',
    fatherAge: '',
    fatherDesignation: '',
    fatherOfficeAddress: '',
    fatherAnnualIncome: '',
    fatherMobile: '',
    
    // Mother Info
    motherName: '',
    motherAge: '',
    motherDesignation: '',
    motherOfficeAddress: '',
    motherAnnualIncome: '',
    motherMobile: '',
  });

  const [formErrors, setFormErrors] = useState({
    phone: '',
    birthDate: '',
    fatherName: '', // Updated from parentName
    fatherMobile: '', // Updated from parentPhone
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchTotalStudents();
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
    setCurrentPage(1); 
  }, [students, searchTerm, filterClass]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);
  const pageNumbers = [];
  
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const getDisplayedPageNumbers = () => {
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) return pageNumbers;
    
    const half = Math.floor(maxVisiblePages / 2);
    let start = currentPage - half;
    let end = currentPage + half;
    
    if (start < 1) {
      start = 1;
      end = maxVisiblePages;
    }
    
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const fetchTotalStudents = async () => {
    try {
      const coll = collection(db, 'students');
      const snapshot = await getCountFromServer(coll);
      setTotalStudents(snapshot.data().count);
    } catch (error) {
      console.error('Error fetching total students:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, orderBy('name'));
      
      const snapshot = await getDocs(q);
      const studentData = [];
      
      snapshot.forEach((doc) => {
        studentData.push({ id: doc.id, ...doc.data() });
      });
      
      setStudents(studentData);
      setFilteredStudents(studentData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterClass) {
      filtered = filtered.filter(student => student.class === filterClass);
    }

    setFilteredStudents(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If same address is checked and we edit permanent address, update correspondence
      if (sameAddress) {
        if (name === 'permAt') newData.corrAt = value;
        if (name === 'permPost') newData.corrPost = value;
        if (name === 'permVia') newData.corrVia = value;
        if (name === 'permDist') newData.corrDist = value;
        if (name === 'permMobile') newData.corrMobile = value;
      }
      return newData;
    });

    // Clear errors
    if (name === 'password' || name === 'confirmPassword' || 
        name === 'phone' || name === 'birthDate' || 
        name === 'fatherName' || name === 'fatherMobile') {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSameAddressChange = (e) => {
    const isChecked = e.target.checked;
    setSameAddress(isChecked);
    
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        corrAt: prev.permAt,
        corrPost: prev.permPost,
        corrVia: prev.permVia,
        corrDist: prev.permDist,
        corrMobile: prev.permMobile,
      }));
    } else {
      // Optional: Clear correspondence when unchecked? 
      // Usually user expects it to stay until they edit it. Keeping as is.
    }
  };

  // Sibling Logic
  const addSibling = () => {
    setSiblings([...siblings, { name: '', age: '', institute: '', standard: '' }]);
  };

  const removeSibling = (index) => {
    const newSiblings = siblings.filter((_, i) => i !== index);
    setSiblings(newSiblings);
  };

  const handleSiblingChange = (index, field, value) => {
    const newSiblings = [...siblings];
    newSiblings[index][field] = value;
    setSiblings(newSiblings);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.birthDate) errors.birthDate = 'Birth date is required';
    if (!formData.fatherName.trim()) errors.fatherName = 'Father name is required';
    if (!formData.fatherMobile.trim()) errors.fatherMobile = 'Father mobile is required';
    
    if (!editingStudent) {
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await uploadToCloudinary(file);
      const photoUrl = uploadResult.url;
      
      if (photoUrl && photoUrl.trim() !== '') {
        setFormData(prev => ({ ...prev, photo: photoUrl }));
        toast.success('Photo uploaded successfully');
      } else {
        throw new Error('Invalid photo URL returned');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
        toast.success('Photo loaded (local preview only)');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    try {
      const studentData = { 
        ...formData,
        siblings: siblings // Include siblings array
      };
      
      if (editingStudent) {
        delete studentData.password;
        delete studentData.confirmPassword;
        
        await updateDoc(doc(db, 'students', editingStudent.id), {
          ...studentData,
          updatedAt: new Date()
        });
        toast.success('Student updated successfully');
      } else {
        delete studentData.confirmPassword;
        
        await addDoc(collection(db, 'students'), {
          ...studentData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast.success('Student added successfully');
      }
      
      resetForm();
      fetchStudents();
      fetchTotalStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      ...student,
      password: '',
      confirmPassword: ''
    });
    setSiblings(student.siblings || []); // Load siblings or empty array
    
    // Check if addresses are same to toggle box
    if (student.permAt === student.corrAt && student.permAt !== '' && student.permAt !== undefined) {
        setSameAddress(true);
    } else {
        setSameAddress(false);
    }

    setShowAddModal(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await deleteDoc(doc(db, 'students', studentId));
      toast.success('Student deleted successfully');
      fetchStudents();
      fetchTotalStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', class: '', section: '', rollNo: '', 
      birthDate: '', photo: '', academicYear: academicYears[0], 
      admissionDate: '', bloodGroup: '', password: '', confirmPassword: '',
      height: '', weight: '', caste: '', aadharNo: '', transportMode: '',
      permAt: '', permPost: '', permVia: '', permDist: '', permMobile: '',
      corrAt: '', corrPost: '', corrVia: '', corrDist: '', corrMobile: '',
      fatherName: '', fatherAge: '', fatherDesignation: '', fatherOfficeAddress: '', fatherAnnualIncome: '', fatherMobile: '',
      motherName: '', motherAge: '', motherDesignation: '', motherOfficeAddress: '', motherAnnualIncome: '', motherMobile: '',
    });
    setSiblings([]);
    setSameAddress(false);
    setFormErrors({
      phone: '', birthDate: '', fatherName: '', fatherMobile: '', password: '', confirmPassword: ''
    });
    setEditingStudent(null);
    setShowAddModal(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const promoteStudents = async () => {
    if (!window.confirm('Are you sure you want to promote all students to the next class and academic year?')) return;
    
    try {
      const batch = [];
      students.forEach(student => {
        const classIndex = classes.indexOf(student.class);
        let nextClass = null;

        if (classIndex !== -1 && classIndex < classes.length - 1) {
          nextClass = classes[classIndex + 1];
        } else {
          const currentNum = parseInt(student.class);
          if (!isNaN(currentNum) && currentNum < 12) {
            nextClass = (currentNum + 1).toString();
          }
        }

        const studentYearIndex = academicYears.indexOf(student.academicYear);
        const updates = {
          updatedAt: new Date()
        };
        
        if (nextClass) {
          updates.class = nextClass;
        }
        
        if (studentYearIndex < academicYears.length - 1) {
          updates.academicYear = academicYears[studentYearIndex + 1];
        }
        
        if (Object.keys(updates).length > 1) {
          batch.push(
            updateDoc(doc(db, 'students', student.id), updates)
          );
        }
      });
      
      await Promise.all(batch);
      toast.success('Students promoted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error promoting students:', error);
      toast.error('Failed to promote students');
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg w-64"></div>
            <div className="bg-white rounded-xl p-6 h-96 shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-indigo-600" />
              Student Management
            </h1>
            <p className="text-gray-600 mt-2">Manage student records and information</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={promoteStudents}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:shadow-md transition-all flex items-center space-x-2 shadow-sm"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Promote All</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:shadow-md transition-all flex items-center space-x-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl shadow-lg text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">Total Students</h3>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl shadow-lg text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">This Year</h3>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.academicYear === academicYears[0]).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-5 rounded-xl shadow-lg text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Filter className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">Filtered</h3>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent (Father)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                              src={student.photo || 'https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=100'}
                              alt={student.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                           {student.class}
                        </span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Sec {student.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.academicYear}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.fatherName || student.parentName}</div>
                        <div className="text-sm text-gray-500">{student.fatherMobile || student.parentPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit student"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-lg font-medium">No students found</p>
                        <p className="text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add New Student</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {filteredStudents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
              </div>
              
              <div className="flex items-center space-x-1">
                <button onClick={goToFirstPage} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {getDisplayedPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-10 h-10 rounded-lg border transition-colors ${
                      currentPage === pageNum ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={goToLastPage} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                  {editingStudent ? <><Edit className="h-6 w-6 text-blue-600" /> Edit Student</> : <><UserPlus className="h-6 w-6 text-blue-600" /> Add New Student</>}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Section 1: Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500"/> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Photo Upload - spans row on small, 1 col on large */}
                        <div className="md:col-span-2 lg:col-span-4 flex justify-center mb-4">
                             <div className="flex flex-col items-center space-y-4">
                                {formData.photo && (
                                <img src={formData.photo} alt="Student" className="h-24 w-24 rounded-full object-cover border-2 border-blue-100 shadow-md" />
                                )}
                                <label htmlFor="photo-upload" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium">
                                    <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Photo'}
                                </label>
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date *</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar No.</label>
                            <input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="XXXX-XXXX-XXXX" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                            <select name="caste" value={formData.caste} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors">
                                <option value="">Select Caste</option>
                                {castes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors">
                                <option value="">Select</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                    </div>
                  </div>

                  {/* Section 2: Academic Details */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-500"/> Academic Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                            <select name="class" value={formData.class} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors">
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c} value={c}> {c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                            <select name="section" value={formData.section} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors">
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Roll No *</label>
                            <input type="text" name="rollNo" value={formData.rollNo} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                            <select name="academicYear" value={formData.academicYear} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors">
                                {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Transport</label>
                             <select name="transportMode" value={formData.transportMode} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors">
                                <option value="">Select Mode</option>
                                <option value="College Bus">College Bus</option>
                                <option value="Parent">Parent</option>
                             </select>
                        </div>
                    </div>
                  </div>

                  {/* Section 3: Contact & Address */}
                  <div className="pt-4 border-t">
                     <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-indigo-500"/> Contact & Address
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Permanent Address */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h4 className="font-semibold text-gray-700 mb-3">Permanent Address</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">At (Village/Locality)</label>
                                    <input type="text" name="permAt" value={formData.permAt} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Post</label>
                                    <input type="text" name="permPost" value={formData.permPost} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Via</label>
                                    <input type="text" name="permVia" value={formData.permVia} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Dist</label>
                                    <input type="text" name="permDist" value={formData.permDist} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Mobile No.</label>
                                    <input type="tel" name="permMobile" value={formData.permMobile} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Correspondence Address */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                            <h4 className="font-semibold text-gray-700 mb-3">Correspondence Address</h4>
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <input type="checkbox" id="sameAddress" checked={sameAddress} onChange={handleSameAddressChange} className="rounded text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="sameAddress" className="text-xs text-gray-600 cursor-pointer select-none">Same as Permanent</label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">At (Village/Locality)</label>
                                    <input type="text" name="corrAt" value={formData.corrAt} onChange={handleInputChange} disabled={sameAddress} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${sameAddress ? 'bg-gray-100' : ''}`} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Post</label>
                                    <input type="text" name="corrPost" value={formData.corrPost} onChange={handleInputChange} disabled={sameAddress} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${sameAddress ? 'bg-gray-100' : ''}`} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Via</label>
                                    <input type="text" name="corrVia" value={formData.corrVia} onChange={handleInputChange} disabled={sameAddress} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${sameAddress ? 'bg-gray-100' : ''}`} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Dist</label>
                                    <input type="text" name="corrDist" value={formData.corrDist} onChange={handleInputChange} disabled={sameAddress} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${sameAddress ? 'bg-gray-100' : ''}`} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Mobile No.</label>
                                    <input type="tel" name="corrMobile" value={formData.corrMobile} onChange={handleInputChange} disabled={sameAddress} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${sameAddress ? 'bg-gray-100' : ''}`} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Phone Number */}
                        <div className="col-span-1 lg:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1"> Phone (for Login/Alerts) *</label>
                             <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors" />
                             {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                        </div>
                    </div>
                  </div>

                  {/* Section 4: Family Information */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500"/> Family Information
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Father */}
                        <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                             <h4 className="font-semibold text-blue-800 border-b border-blue-200 pb-2">Father's Details</h4>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Name *</label>
                                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">Age</label>
                                    <input type="number" name="fatherAge" value={formData.fatherAge} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">Mobile No *</label>
                                    <input type="tel" name="fatherMobile" value={formData.fatherMobile} onChange={handleInputChange} required className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Designation</label>
                                <input type="text" name="fatherDesignation" value={formData.fatherDesignation} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Office Address</label>
                                <input type="text" name="fatherOfficeAddress" value={formData.fatherOfficeAddress} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Annual Income</label>
                                <input type="text" name="fatherAnnualIncome" value={formData.fatherAnnualIncome} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                        </div>

                        {/* Mother */}
                         <div className="space-y-3 bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                             <h4 className="font-semibold text-pink-800 border-b border-pink-200 pb-2">Mother's Details</h4>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Name</label>
                                <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">Age</label>
                                    <input type="number" name="motherAge" value={formData.motherAge} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">Mobile No</label>
                                    <input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Designation</label>
                                <input type="text" name="motherDesignation" value={formData.motherDesignation} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Office Address</label>
                                <input type="text" name="motherOfficeAddress" value={formData.motherOfficeAddress} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Annual Income</label>
                                <input type="text" name="motherAnnualIncome" value={formData.motherAnnualIncome} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                        </div>
                    </div>
                  </div>

                  {/* Section 5: Sibling Details (Collapsible) */}
                  <div className="pt-4 border-t">
                      <button type="button" onClick={() => setShowSiblings(!showSiblings)} className="flex items-center justify-between w-full text-lg font-semibold text-gray-800 mb-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-indigo-500"/> Brother/Sister Details
                          </div>
                          {showSiblings ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                      
                      {showSiblings && (
                          <div className="space-y-4 pl-2 pr-2 animate-fadeIn">
                              {siblings.map((sibling, index) => (
                                  <div key={index} className="flex flex-wrap gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                                      <div className="flex-1 min-w-[150px]">
                                          <label className="block text-xs text-gray-500">Name</label>
                                          <input type="text" value={sibling.name} onChange={(e) => handleSiblingChange(index, 'name', e.target.value)} className="w-full px-3 py-1.5 border rounded-md text-sm" />
                                      </div>
                                      <div className="w-20">
                                          <label className="block text-xs text-gray-500">Age</label>
                                          <input type="number" value={sibling.age} onChange={(e) => handleSiblingChange(index, 'age', e.target.value)} className="w-full px-3 py-1.5 border rounded-md text-sm" />
                                      </div>
                                      <div className="flex-1 min-w-[150px]">
                                          <label className="block text-xs text-gray-500">Institute Name</label>
                                          <input type="text" value={sibling.institute} onChange={(e) => handleSiblingChange(index, 'institute', e.target.value)} className="w-full px-3 py-1.5 border rounded-md text-sm" />
                                      </div>
                                      <div className="w-24">
                                          <label className="block text-xs text-gray-500">Standard</label>
                                          <input type="text" value={sibling.standard} onChange={(e) => handleSiblingChange(index, 'standard', e.target.value)} className="w-full px-3 py-1.5 border rounded-md text-sm" />
                                      </div>
                                      <button type="button" onClick={() => removeSibling(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                                          <Trash2 className="h-4 w-4" />
                                      </button>
                                  </div>
                              ))}
                              <button type="button" onClick={addSibling} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                  <Plus className="h-4 w-4" /> Add Sibling
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Section 6: Password (Only for New) */}
                  {!editingStudent && (
                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <LockIcon className="h-5 w-5 text-indigo-500"/> Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 pr-10" />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                    </button>
                                </div>
                                {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 pr-10" />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                    </button>
                                </div>
                                {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>}
                            </div>
                        </div>
                      </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 sticky bottom-0 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-md transition-all shadow-sm"
                    >
                      {editingStudent ? 'Update Student' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// Helper icon component for the Security section
function LockIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    )
}