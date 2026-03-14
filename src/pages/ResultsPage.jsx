import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResultPage = () => {
  // State for form inputs
  const [studentData, setStudentData] = useState({
    name: "",
    rollNo: "",
    studentClass: "",
    subjects: [
      { name: "", totalMarks: "", obtainedMarks: "", percentage: "0.00" },
    ],
  });

  // State for all students
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [classFilter, setClassFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Class options for dropdown - defined as a constant
  const classOptions = [
    "BCA","BTECH","MCA","MSC","BSC","MBA"
  ];

  // Fetch students from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const studentsData = [];
        snapshot.forEach((doc) => {
          if (doc.exists()) {
            studentsData.push({ id: doc.id, ...doc.data() });
          }
        });
        setStudents(studentsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching students: ", error);
        toast.error("Failed to load student records");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData({
      ...studentData,
      [name]: value,
    });
  };

  // Handle subject changes
  const handleSubjectChange = (index, e) => {
    const { name, value } = e.target;
    const subjects = [...studentData.subjects];
    subjects[index][name] = value;

    // Auto-calculate percentage if both marks are provided
    if (name === "obtainedMarks" || name === "totalMarks") {
      const obtained = parseFloat(subjects[index].obtainedMarks) || 0;
      const total = parseFloat(subjects[index].totalMarks) || 0;
      subjects[index].percentage =
        total > 0 ? ((obtained / total) * 100).toFixed(2) : "0.00";
    }

    setStudentData({
      ...studentData,
      subjects,
    });
  };

  // Add a new subject field
  const addSubject = () => {
    setStudentData({
      ...studentData,
      subjects: [
        ...studentData.subjects,
        { name: "", totalMarks: "", obtainedMarks: "", percentage: "0.00" },
      ],
    });
  };

  // Remove a subject field
  const removeSubject = (index) => {
    const subjects = [...studentData.subjects];
    if (subjects.length > 1) {
      subjects.splice(index, 1);
      setStudentData({
        ...studentData,
        subjects,
      });
    }
  };

  // Calculate total marks
  const calculateTotalMarks = () => {
    return studentData.subjects.reduce((total, subject) => {
      return total + (parseFloat(subject.obtainedMarks) || 0);
    }, 0);
  };

  // Calculate maximum possible marks
  const calculateMaxMarks = () => {
    return studentData.subjects.reduce((total, subject) => {
      return total + (parseFloat(subject.totalMarks) || 0);
    }, 0);
  };

  // Calculate overall percentage
  const calculatePercentage = () => {
    const total = calculateTotalMarks();
    const max = calculateMaxMarks();
    return max > 0 ? ((total / max) * 100).toFixed(2) : "0.00";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalMarks = calculateTotalMarks();
    const maxMarks = calculateMaxMarks();
    const percentage = calculatePercentage();

    const studentRecord = {
      ...studentData,
      totalMarks,
      maxMarks,
      percentage,
      createdAt: new Date(),
    };

    try {
      if (editingId !== null) {
        // Update existing student in Firestore
        const studentRef = doc(db, "students", editingId);
        await updateDoc(studentRef, studentRecord);
        setEditingId(null);
        toast.success("Student record updated successfully!");
      } else {
        // Add new student to Firestore
        await addDoc(collection(db, "students"), studentRecord);
        toast.success("Student record added successfully!");
      }

      // Reset form
      setStudentData({
        name: "",
        rollNo: "",
        studentClass: "",
        subjects: [
          { name: "", totalMarks: "", obtainedMarks: "", percentage: "0.00" },
        ],
      });
    } catch (error) {
      console.error("Error saving student: ", error);
      toast.error("Error saving student data. Please try again.");
    }
  };

  // Edit a student record
  const handleEdit = (id) => {
    const student = students.find((s) => s.id === id);
    if (student) {
      setStudentData({
        name: student.name || "",
        rollNo: student.rollNo || "",
        studentClass: student.studentClass || "",
        subjects: student.subjects
          ? student.subjects.map((sub) => ({
              name: sub.name || "",
              totalMarks: sub.totalMarks || "",
              obtainedMarks: sub.obtainedMarks || "",
              percentage: sub.percentage || "0.00",
            }))
          : [
              {
                name: "",
                totalMarks: "",
                obtainedMarks: "",
                percentage: "0.00",
              },
            ],
      });
      setEditingId(id);
      toast.info("Editing student record");
    }
  };

  // Delete a student record
  const handleDelete = async (student) => {
    if (!student || !student.id) {
      console.error("Cannot delete student: Invalid student object or ID");
      toast.error("Cannot delete student: Invalid data");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${student.name}'s record?`
      )
    ) {
      try {
        await deleteDoc(doc(db, "students", student.id));
        toast.success("Student record deleted successfully!");
      } catch (error) {
        console.error("Error deleting student: ", error);
        toast.error("Error deleting student record. Please try again.");
      }
    }
  };

  // Filter students by class
  const filteredStudents =
    classFilter === "all"
      ? students.filter((student) => student && student.id)
      : students.filter(
          (student) => student && student.studentClass === classFilter
        );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Student Report Card System
        </h1>

        {/* Student Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-blue-50 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            {editingId !== null ? "Edit Student Record" : "Add New Student"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                name="name"
                value={studentData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNo"
                value={studentData.rollNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                name="studentClass"
                value={studentData.studentClass}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Class</option>
                {classOptions &&
                  classOptions.map((cls, index) => (
                    <option key={index} value={cls}>
                      Class {cls}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-700">
                Subjects & Marks
              </h3>
              <button
                type="button"
                onClick={addSubject}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                Add Subject
              </button>
            </div>

            {studentData.subjects &&
              studentData.subjects.map((subject, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 items-end"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={subject.totalMarks}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Obtained Marks
                    </label>
                    <input
                      type="number"
                      name="obtainedMarks"
                      value={subject.obtainedMarks}
                      onChange={(e) => handleSubjectChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={subject.totalMarks || ""}
                      required
                    />
                  </div>

                  <div>
                    {studentData.subjects &&
                      studentData.subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubject(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full"
                        >
                          Remove
                        </button>
                      )}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">
                Total Marks: {calculateTotalMarks()}
              </span>{" "}
              / {calculateMaxMarks()}
              <span className="ml-4 font-medium">
                Percentage: {calculatePercentage()}%
              </span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId !== null
                ? "Update Record"
                : "Add Student"}
            </button>
          </div>
        </form>

        {/* Filter and Student List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Student Records
            </h2>

            <div className="flex items-center">
              <label className="mr-2 text-gray-700">Filter by Class:</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                {classOptions &&
                  classOptions.map((cls, index) => (
                    <option key={index} value={cls}>
                      Class {cls}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-4">
              Loading student records...
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No student records found.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-800">
                        {student.name}
                      </h3>
                      <p className="text-gray-600">
                        Roll No: {student.rollNo} | Class:{" "}
                        {student.studentClass}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(student.id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Subjects:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {student.subjects &&
                        student.subjects.map((subject, subIndex) => (
                          <div
                            key={`${student.id}-${subIndex}`}
                            className="bg-gray-50 p-3 rounded-md"
                          >
                            <p className="font-medium">{subject.name}</p>
                            <p>
                              Marks: {subject.obtainedMarks} /{" "}
                              {subject.totalMarks}
                            </p>
                            <p>Percentage: {subject.percentage}%</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-3">
                    <div>
                      <p className="font-semibold">
                        Total: {student.totalMarks} / {student.maxMarks}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        Overall Percentage: {student.percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;