import React, { useState } from "react";
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const ReportCardView = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    rollNo: "",
    class: "",
  });
  const [error, setError] = useState("");

  // Class options for dropdown - matching StudentManagement format
  const classOptions = [
  "BCA","BTECH","MCA","MSC","BSC","MBA"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const fetchStudent = async () => {
    if (!searchParams.rollNo || !searchParams.class) {
      setError("Please enter both Roll Number and Class");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Try both class formats: "7" and "Class 7"
      const classFormats = [
        searchParams.class.trim(),
        `Class ${searchParams.class.trim()}`,
      ];

      let studentFound = null;

      // Try each class format until we find the student
      for (const classFormat of classFormats) {
        const q = query(
          collection(db, "students"),
          where("rollNo", "==", searchParams.rollNo.trim()),
          where("class", "==", classFormat)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            studentFound = { id: doc.id, ...doc.data() };
          });
          break; // Exit loop if student found
        }
      }

      if (studentFound) {
        setStudent(studentFound);
      } else {
        setError("No student found with these details");
        setStudent(null);
      }
    } catch (err) {
      console.error("Error fetching student: ", err);
      setError("Error fetching student data");
      setStudent(null);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setStudent(null);
    setSearchParams({ rollNo: "", class: "" });
    setError("");
  };

  // Function to format class for display
  const formatClassForDisplay = (cls) => {
    if (cls === "Nursery" || cls === "LKG" || cls === "UKG") return cls;
      return `Class ${cls}`;

  };

  if (student) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 print:py-0 print:px-0">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 print:shadow-none">
          {/* Action buttons */}
          <div className="flex justify-between mb-6 print:hidden">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Back to Search
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Print Report Card
            </button>
          </div>

          {/* Report Card */}
          <div className="border-2 border-blue-800 p-8 rounded-lg bg-white">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-800">
                Gandhi Academy of technology and engineering(GATE)
              </h1>
              <p className="text-gray-600">
                123 Education Street, Knowledge City
              </p>
              <h2 className="text-2xl font-semibold mt-4 text-blue-700">
                STUDENT REPORT CARD
              </h2>
              <p className="text-gray-600">Academic Year 2026-2027</p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p>
                  <span className="font-semibold">Student Name:</span>{" "}
                  {student.name}
                </p>
                <p>
                  <span className="font-semibold">Roll Number:</span>{" "}
                  {student.rollNo}
                </p>
                <p>
                  <span className="font-semibold">Class:</span>{" "}
                  {formatClassForDisplay(student.studentClass)}
                </p>
              </div>
              <div className="text-right">
                <p>
                  <span className="font-semibold">Date Issued:</span>{" "}
                  {new Date().toLocaleDateString()}
                </p>
                {student.createdAt && (
                  <p>
                    <span className="font-semibold">Date Created:</span>{" "}
                    {student.createdAt.toDate().toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Marks Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Subject
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Total Marks
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Obtained Marks
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Percentage
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {student.subjects &&
                    student.subjects.map((subject, index) => {
                      const percentage = parseFloat(subject.percentage);
                      let grade = "";

                      if (percentage >= 90) grade = "A+";
                      else if (percentage >= 80) grade = "A";
                      else if (percentage >= 70) grade = "B";
                      else if (percentage >= 60) grade = "C";
                      else if (percentage >= 50) grade = "D";
                      else grade = "F";

                      return (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-gray-50" : ""}
                        >
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {subject.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {subject.totalMarks}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {subject.obtainedMarks}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {subject.percentage}%
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            {grade}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="font-semibold">Remarks:</p>
                <div className="border border-gray-300 p-2 h-24">
                  {student.percentage >= 90 &&
                    "Outstanding performance! Exceptional work in all subjects."}
                  {student.percentage >= 80 &&
                    student.percentage < 90 &&
                    "Excellent performance! Consistent effort across all subjects."}
                  {student.percentage >= 70 &&
                    student.percentage < 80 &&
                    "Very good performance. Maintain this level of dedication."}
                  {student.percentage >= 60 &&
                    student.percentage < 70 &&
                    "Good effort. Shows understanding of most concepts."}
                  {student.percentage >= 50 &&
                    student.percentage < 60 &&
                    "Satisfactory performance. Room for improvement in some areas."}
                  {student.percentage >= 40 &&
                    student.percentage < 50 &&
                    "Needs improvement. Please focus on weak subjects."}
                  {student.percentage < 40 &&
                    "Unsatisfactory performance. Requires immediate attention and remedial classes."}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-semibold text-lg">Overall Performance</p>
                <div className="mt-2">
                  <p>
                    Total Marks: {student.totalMarks} / {student.maxMarks}
                  </p>
                  <p className="text-xl font-bold mt-2">
                    Percentage: {student.percentage}%
                  </p>
                  <p className="mt-2">
                    Overall Grade:{" "}
                    {student.percentage >= 90
                      ? "A+ (Excellent)"
                      : student.percentage >= 80
                      ? "A (Very Good)"
                      : student.percentage >= 70
                      ? "B (Good)"
                      : student.percentage >= 60
                      ? "C (Average)"
                      : student.percentage >= 50
                      ? "D (Below Average)"
                      : "F (Fail)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-1 mx-auto w-32"></div>
                <p>Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-1 mx-auto w-32"></div>
                <p>Principal</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-1 mx-auto w-32"></div>
                <p>Parent's Signature</p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .max-w-4xl, .max-w-4xl * {
              visibility: visible;
            }
            .max-w-4xl {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
            }
            .bg-white {
              background-color: white !important;
            }
            button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          View Your Report Card
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roll Number
          </label>
          <input
            type="text"
            name="rollNo"
            value={searchParams.rollNo}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your roll number"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            name="class"
            value={searchParams.class}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Class</option>
            {classOptions.map((cls, index) => (
              <option key={index} value={cls}>
                {formatClassForDisplay(cls)}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={fetchStudent}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Loading..." : "View Report Card"}
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Enter the exact Roll Number and Class as
            registered in the system. For example: Roll Number "101" and Class
            "7" (not "Class 7").
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportCardView;
