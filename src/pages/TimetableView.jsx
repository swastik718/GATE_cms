import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";

const classOptions = [
 "BCA","BTECH","MCA","MSC","BSC","MBA"
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TimetableView = () => {
  const [classTimetables, setClassTimetables] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(4);

  // Fetch timetable data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const timetablesSnapshot = await getDocs(collection(db, "timetables"));
        const timetablesData = {};
        timetablesSnapshot.forEach((doc) => {
          timetablesData[doc.id] = doc.data();
        });
        setClassTimetables(timetablesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load timetable data");
      }
    };
    fetchData();
  }, []);

  // Render a single timetable
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                        slot.isBreak ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {slot.text}
                    </td>
                    {days.map((day) => {
                      const cellData = classTimetable[day]?.[slot.text];
                      const isBreak = slot.isBreak;

                      return (
                        <td
                          key={`${day}-${slot.text}`}
                          className={`px-4 py-2 text-center ${
                            isBreak
                              ? "bg-red-50"
                              : cellData
                              ? "bg-indigo-50"
                              : ""
                          }`}
                        >
                          {isBreak ? (
                            <span className="text-red-500 font-medium">
                              BREAK
                            </span>
                          ) : cellData ? (
                            <div className="py-1 px-2 rounded-lg bg-white shadow-xs border border-indigo-100">
                              <div className="font-medium text-indigo-800">
                                {cellData.subject}
                              </div>
                              {cellData.teacher && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {cellData.teacher}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="px-4 py-4 text-center text-gray-500"
                  >
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

  // Pagination logic
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = classOptions.slice(
    indexOfFirstClass,
    indexOfLastClass
  );
  const totalPages = Math.ceil(classOptions.length / classesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg mb-6">
          <h1 className="text-3xl font-bold">College Timetables</h1>
          <p className="text-indigo-100 opacity-90">
            View all class schedules
          </p>
        </div>

        {/* View All Timetables Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            All Class Timetables
          </h2>

          {currentClasses.map((className) => renderTimetable(className))}

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() =>
                  paginate(currentPage > 1 ? currentPage - 1 : 1)
                }
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-l-md border border-gray-300 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 border-t border-b border-gray-300 ${
                      currentPage === number
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  paginate(
                    currentPage < totalPages ? currentPage + 1 : totalPages
                  )
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-r-md border border-gray-300 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableView;