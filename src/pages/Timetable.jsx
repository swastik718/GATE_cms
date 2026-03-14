import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const classOptions = [
  "BCA","BTECH","MCA","MSC","BSC","MBA"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Timetable = () => {
  const { currentUser, userData } = useAuth();

  // State management
  const [classTimetables, setClassTimetables] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(4);
  const [viewMode, setViewMode] = useState("viewAll"); // Default to viewAll
  const [selectedClass, setSelectedClass] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [timetable, setTimetable] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [editingSubject, setEditingSubject] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    start: "",
    end: "",
    period: "",
    isBreak: false,
  });
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [editingTimeSlotIndex, setEditingTimeSlotIndex] = useState(null);

  // Set initial view mode based on role
  useEffect(() => {
    if (userData?.role === 'admin') {
      setViewMode("edit");
    } else {
      setViewMode("viewAll");
    }
  }, [userData]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        setTeachers(teachersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const timetablesSnapshot = await getDocs(collection(db, "timetables"));
        const timetablesData = {};
        timetablesSnapshot.forEach((doc) => {
          timetablesData[doc.id] = doc.data();
        });
        setClassTimetables(timetablesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  // Load timetable when class changes
  useEffect(() => {
    if (selectedClass && classTimetables[selectedClass]) {
      setTimetable(classTimetables[selectedClass]);
      setTimeSlots(classTimetables[selectedClass].timeSlots || []);
    } else {
      setTimetable({});
      setTimeSlots([]);
    }
    setSelectedCell(null);
    setEditingSubject("");
    setTeacherName("");
  }, [selectedClass, classTimetables]);

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const saveTimetable = async (updatedData) => {
    try {
      await setDoc(doc(db, "timetables", selectedClass), updatedData);
      setClassTimetables((prev) => ({
        ...prev,
        [selectedClass]: updatedData,
      }));
      return true;
    } catch (error) {
      console.error("Error saving timetable:", error);
      toast.error("Failed to save timetable");
      return false;
    }
  };

  const handleCellClick = (day, period, cellData) => {
    // SECURITY: Disable editing for non-admins
    if (userData?.role !== 'admin') return;

    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }
    if (cellData?.isBreak) return;

    setSelectedCell({ day, period });
    setEditingSubject(cellData?.subject || "");
    setTeacherName(cellData?.teacher || "");
  };

  // ... (Keep handleSave, handleClearCell, handleSaveTimeSlot, handleEditTimeSlot, handleRemoveTimeSlot, handleClearAll same as original, they are guarded by UI visibility)

  const handleSave = async () => {
    if (!selectedClass || !editingSubject || !selectedCell) return;
    const { day, period } = selectedCell;
    const value = {
      class: selectedClass,
      subject: editingSubject,
      teacher: teacherName,
      displayText: `${selectedClass} - ${editingSubject}${teacherName ? ` (${teacherName})` : ""}`,
    };
    const updatedTimetable = {
      ...timetable,
      [day]: { ...timetable[day], [period]: value },
      timeSlots,
    };
    if (await saveTimetable(updatedTimetable)) {
      setTimetable(updatedTimetable);
      toast.success("Timetable saved successfully");
      setSelectedCell(null);
      setEditingSubject("");
      setTeacherName("");
    }
  };

  const handleClearCell = async (day, period) => {
    if (userData?.role !== 'admin') return; // Security Guard
    const cellData = timetable[day]?.[period];
    if (cellData?.isBreak) return toast.error("Cannot clear break periods");
    const updatedTimetable = { ...timetable };
    if (updatedTimetable[day]) {
      delete updatedTimetable[day][period];
      if (Object.keys(updatedTimetable[day]).length === 0) delete updatedTimetable[day];
    }
    updatedTimetable.timeSlots = timeSlots;
    if (await saveTimetable(updatedTimetable)) {
      setTimetable(updatedTimetable);
      toast.success("Period cleared successfully");
    }
  };

  // ... other handlers (omitted for brevity, they function identical to original but only accessible by admin)
  
  // Pagination logic
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = classOptions.slice(indexOfFirstClass, indexOfLastClass);
  const totalPages = Math.ceil(classOptions.length / classesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderTimetable = (className) => {
    const classTimetable = classTimetables[className] || {};
    const timeSlots = classTimetable.timeSlots || [];

    return (
      <div key={className} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Timetable for {className}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${slot.isBreak ? "text-red-600" : "text-gray-900"}`}>
                      {slot.text}
                    </td>
                    {days.map((day) => {
                      const cellData = classTimetable[day]?.[slot.text];
                      const isBreak = slot.isBreak;
                      return (
                        <td key={`${day}-${slot.text}`} className={`px-4 py-2 text-center ${isBreak ? "bg-red-50" : cellData ? "bg-indigo-50" : ""}`}>
                          {isBreak ? (
                            <span className="text-red-500 font-medium">BREAK</span>
                          ) : cellData ? (
                            <div className="py-1 px-2 rounded-lg bg-white shadow-xs border border-indigo-100">
                              <div className="font-medium text-indigo-800">{cellData.subject}</div>
                              {cellData.teacher && <div className="text-xs text-gray-500 mt-1">{cellData.teacher}</div>}
                            </div>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={days.length + 1} className="px-4 py-4 text-center text-gray-500">
                    No timetable data available for {className}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg mb-6">
          <h1 className="text-3xl font-bold">College Timetable Manager</h1>
          <p className="text-indigo-100 opacity-90">View and manage class schedules</p>
        </div>

        {/* ROLE BASED CONTROLS: Only show toggle for Admin */}
        {userData?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => setViewMode("edit")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewMode === "edit" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                Edit Mode
              </button>
              <button
                onClick={() => setViewMode("viewAll")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewMode === "viewAll" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                View All Timetables
              </button>
            </div>
          </div>
        )}

        {viewMode === "edit" && userData?.role === 'admin' ? (
          <>
            {/* Controls Section - HIDDEN FOR TEACHERS AUTOMATICALLY BY VIEWMODE */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
               {/* ... (Existing Edit Controls: Class Select, Time Slot Form, etc.) ... */}
               {/* Note: I'm abbreviating here, but in the actual file, paste the exact Edit Mode JSX from your original file. 
                   The critical part is wrapping the `handleCellClick` and `handleClearCell` with role checks as done above. */}
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* ... Class and Teacher Selectors ... */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class *</label>
                    <div className="relative">
                      <button onClick={() => setIsClassOpen(!isClassOpen)} className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400 transition-all">
                        {selectedClass || "Select a class"}
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {isClassOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                          {classOptions.map((option) => (
                            <div key={option} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors" onClick={() => { setSelectedClass(option); setIsClassOpen(false); }}>
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* ... Teacher Selector ... */}
               </div>

               {/* Time Slot Buttons */}
               <div className="flex gap-2 mb-6">
                 <button onClick={() => setShowTimeSlotForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Time Slot</button>
               </div>
               
               {/* Time Slot Form... */}
               {showTimeSlotForm && (
                 <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    {/* ... Form inputs ... */}
                    <button onClick={() => {/* handle save */}} className="bg-green-600 text-white px-4 py-2 rounded-lg">Add</button>
                 </div>
               )}

               {/* EDIT TABLE */}
               <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                          {days.map((day) => (<th key={day} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</th>))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timeSlots.map((slot, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{slot.text}</td>
                            {days.map((day) => {
                               const cellData = timetable[day]?.[slot.text];
                               return (
                                 <td 
                                    key={`${day}-${slot.text}`} 
                                    className="px-4 py-3 text-center cursor-pointer border hover:bg-indigo-50"
                                    onClick={() => !slot.isBreak && handleCellClick(day, slot.text, cellData)}
                                 >
                                    {/* Render Cell Data or + sign */}
                                    {cellData ? cellData.subject : '+'}
                                 </td>
                               )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>
          </>
        ) : (
          <>
            {/* View All Timetables Section - Default for Teacher/Student */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {userData?.role === 'teacher' ? `Timetable View` : 'All Class Timetables'}
              </h2>
              {currentClasses.map((className) => renderTimetable(className))}
              
              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <nav className="inline-flex rounded-md shadow">
                  <button onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100">Previous</button>
                  <button onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-r-md border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100">Next</button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Timetable;