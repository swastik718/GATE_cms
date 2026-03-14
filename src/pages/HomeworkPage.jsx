import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../config/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { uploadToCloudinary } from "../config/cloudinary";
import toast from "react-hot-toast";

// Icons
const PencilIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const PaperClipIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function Homework() {
  const [type, setType] = useState("homework");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const q = query(collection(db, type), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date?.toDate() 
      }));
      setData(docs);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      toast.error("Failed to load data");
    }
  }, [type]);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setUser(user);
        if (user) {
          fetchData();
        } else {
          setError("Please sign in to view content");
        }
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchData]);

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return false;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (loading || !user || !validateForm()) return;
    
    setLoading(true);
    setFileUploadProgress(0);
    const toastId = toast.loading(editingId ? "Updating..." : "Uploading...");

    try {
      let fileData = null;
      if (file) {
        try {
          const progressInterval = setInterval(() => {
            setFileUploadProgress(prev => Math.min(prev + 10, 90));
          }, 300);

          fileData = await uploadToCloudinary(file);
          clearInterval(progressInterval);
          setFileUploadProgress(100);
        } catch (uploadErr) {
          console.error("File upload failed:", uploadErr);
          throw new Error("File upload failed. Please try again.");
        }
      }

      const docData = {
        title: title.trim(),
        description: description.trim(),
        date: Timestamp.now(),
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
      };

      if (file && fileData) {
        docData.fileUrl = fileData.url;
        docData.filePublicId = fileData.publicId;
        docData.fileName = file.name;
        docData.fileSize = file.size;
        docData.fileType = file.type;
      }

      if (editingId) {
        await updateDoc(doc(db, type, editingId), docData);
        toast.success("Updated successfully!", { id: toastId });
      } else {
        await addDoc(collection(db, type), docData);
        toast.success("Uploaded successfully!", { id: toastId });
      }
      
      resetForm();
      await fetchData();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
      toast.error(err.message || "Upload failed!", { id: toastId });
    } finally {
      setLoading(false);
      setFileUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = [
      'image/jpeg', 
      'image/png', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Only JPG, PNG, PDF, or DOC files are allowed");
      return;
    }

    setFile(selectedFile);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Deleting...");
    
    try {
      await deleteDoc(doc(db, type, id));
      toast.success("Deleted successfully!", { id: toastId });
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete. Please try again.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="mb-6 text-gray-600">Please sign in to access the homework and notices management system.</p>
          <button 
            onClick={() => auth.signInWithPopup(new auth.GoogleAuthProvider())}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.786-1.664-4.149-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.496 10-10 0-0.67-0.069-1.325-0.189-1.955h-9.811z" />
            </svg>
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {type === "homework" ? "Homework" : "Notices"} Manager
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {type === "homework" 
                  ? "Manage class assignments and materials" 
                  : "Share important announcements"}
              </p>
            </div>
            
            {/* Type toggle */}
            <div className="inline-flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => {
                  setType("homework");
                  resetForm();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  type === "homework" 
                    ? "bg-blue-600 text-white shadow" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Homework
              </button>
              <button
                onClick={() => {
                  setType("notices");
                  resetForm();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  type === "notices" 
                    ? "bg-blue-600 text-white shadow" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Notices
              </button>
            </div>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 sticky top-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {editingId ? (
                    <>
                      <PencilIcon className="h-5 w-5 text-blue-500 mr-2" />
                      Edit {type}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 text-blue-500 mr-2" />
                      Add New {type === "homework" ? "Homework" : "Notice"}
                    </>
                  )}
                </h2>
                
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter detailed description"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachment
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 flex items-center">
                        <PaperClipIcon className="h-5 w-5 text-gray-500 mr-2" />
                        Choose File
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                      {file && (
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {file.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Supports: PDF, DOC, JPG, PNG (Max 5MB)
                    </p>
                    {fileUploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${fileUploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center ${
                        loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Spinner className="mr-2" />
                          {editingId ? 'Updating...' : 'Uploading...'}
                        </>
                      ) : (
                        editingId ? 'Update' : 'Upload'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* List section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {type === "homework" ? "Recent Homework" : "Latest Notices"}
              </h2>
              <span className="text-sm text-gray-500">
                {data.length} {type === "homework" ? "assignments" : "notices"} found
              </span>
            </div>

            {data.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <DocumentTextIcon />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No {type === "homework" ? "homework" : "notices"} yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {type === "homework" 
                    ? "Get started by adding your first homework assignment" 
                    : "Create your first notice to share with the class"}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add {type === "homework" ? "Homework" : "Notice"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            {item.fileUrl && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Attachment
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 whitespace-pre-line mb-3">
                            {item.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-2">
                            <span className="flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {item.createdByName || "Unknown"}
                            </span>
                            <span className="flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {item.date?.toLocaleDateString()} at {item.date?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {item.fileSize && (
                              <span className="flex items-center">
                                <DocumentIcon className="h-3 w-3 mr-1" />
                                {Math.round(item.fileSize / 1024)}KB
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {item.fileUrl && (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <ArrowDownIcon className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          )}
                          
                          {item.createdBy === user?.uid && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}