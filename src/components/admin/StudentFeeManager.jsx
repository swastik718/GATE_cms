import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const StudentFeeManager = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
    receiptNumber: "",
    remarks: "",
  });

  // Debug function to identify data mismatches
  const debugDataMismatch = async () => {
    try {
      // Get all students
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const allStudents = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get all fees
      const feesSnapshot = await getDocs(collection(db, "fees"));
      const allFees = feesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check class values
      const studentClasses = [...new Set(allStudents.map((s) => s.class))];
      const feeClasses = [...new Set(allFees.map((f) => f.class))];

      const debugMessage = `
        Students with classes: ${studentClasses.join(", ")}
        Fees with classes: ${feeClasses.join(", ")}
        Student Class Types: ${studentClasses.map((c) => typeof c).join(", ")}
        Fee Class Types: ${feeClasses.map((c) => typeof c).join(", ")}
      `;

      setDebugInfo(debugMessage);
      console.log("DEBUG:", debugMessage);
    } catch (error) {
      console.error("Debug error:", error);
      setDebugInfo(`Debug error: ${error.message}`);
    }
  };

  // Fetch all students from student management
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const studentsQuery = query(
          collection(db, "students"),
          orderBy("name")
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  // Enhanced class matching function
  const normalizeClass = (classValue) => {
    if (!classValue) return "";

    // Convert to string and remove any "Class" prefix and whitespace
    const strClass = classValue.toString().trim();

    // Extract just the numeric part if it starts with "Class"
    if (strClass.toLowerCase().startsWith("class")) {
      return strClass.replace(/class\s*/i, "").trim();
    }

    return strClass;
  };

  // Enhanced fee structure fetching
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchStudentFeeData = async () => {
      setLoading(true);
      setDebugInfo("");
      try {
        const studentClass = selectedStudent.class?.toString().trim();
        const normalizedStudentClass = normalizeClass(studentClass);

        let feeStructuresData = [];
        let foundWithMethod = "";

        // Method 1: Try exact match first
        try {
          const q1 = query(collection(db, "fees"), where("class", "==", studentClass));
          const snap1 = await getDocs(q1);

          if (!snap1.empty) {
            feeStructuresData = snap1.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            foundWithMethod = "exact string match";
          }
        } catch (error) {
          console.log("Exact match queries failed", error);
        }

        // Method 2: Try number match
        if (feeStructuresData.length === 0 && !isNaN(studentClass)) {
            try {
                const q2 = query(collection(db, "fees"), where("class", "==", Number(studentClass)));
                const snap2 = await getDocs(q2);
                if (!snap2.empty) {
                    feeStructuresData = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    foundWithMethod = "exact number match";
                }
            } catch(e) { console.log(e); }
        }

        // Method 3: Try normalized match
        if (feeStructuresData.length === 0 && normalizedStudentClass) {
          try {
            const q3 = query(
              collection(db, "fees"),
              where("class", "==", normalizedStudentClass)
            );
            const snap3 = await getDocs(q3);

            if (!snap3.empty) {
              feeStructuresData = snap3.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              foundWithMethod = "normalized match";
            }
          } catch (error) {
            console.log("Normalized match query failed");
          }
        }

        // Method 4: Client-side fallback
        if (feeStructuresData.length === 0) {
          try {
            const allFeesSnapshot = await getDocs(collection(db, "fees"));
            const allFees = allFeesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            feeStructuresData = allFees.filter((fee) => {
              const feeClass = normalizeClass(fee.class);
              return (
                feeClass.toString().trim() === normalizedStudentClass.toString().trim() ||
                Number(feeClass) === Number(normalizedStudentClass)
              );
            });

            if (feeStructuresData.length > 0) {
              foundWithMethod = "loose normalized match";
            }
          } catch (error) {
            console.log("Client-side filtering failed");
          }
        }

        setFeeStructures(feeStructuresData);
        setDebugInfo(
          `Found ${feeStructuresData.length} fees using: ${foundWithMethod || "no method worked"}`
        );

        // Fetch fee payments for the student
        const feePaymentsQuery = query(
          collection(db, "feePayments"),
          where("studentId", "==", selectedStudent.id),
          orderBy("paymentDate", "desc")
        );
        const feePaymentsSnapshot = await getDocs(feePaymentsQuery);
        const feePaymentsData = feePaymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          paymentDate: doc.data().paymentDate?.toDate() || null,
          dueDate: doc.data().dueDate?.toDate() || null,
        }));
        setFeePayments(feePaymentsData);
      } catch (error) {
        console.error("Error fetching student fee data:", error);
        setFeeStructures([]);
        setFeePayments([]);
        setDebugInfo(`Error: ${error.message}`);
      }
      setLoading(false);
    };

    fetchStudentFeeData();
  }, [selectedStudent]);

  // Calculate fee summary
  const calculateFeeSummary = () => {
    if (!selectedStudent || feeStructures.length === 0) return null;

    const totalFee = feeStructures.reduce(
      (sum, fee) => sum + parseFloat(fee.amount || 0),
      0
    );

    const paidAmount = feePayments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

    const dueAmount = totalFee - paidAmount;

    return {
      totalFee,
      paidAmount,
      dueAmount,
      paymentStatus: dueAmount <= 0 ? "Paid" : "Pending",
    };
  };

  const feeSummary = calculateFeeSummary();

  // Handle payment submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
        toast.error("No student selected");
        return;
    }

    try {
      // FIX: Use `rollNo` from selectedStudent, fallback to empty string if undefined
      const rollNumber = selectedStudent.rollNo || selectedStudent.rollNumber || "";

      // Create a new payment record
      const newPayment = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name || "",
        rollNumber: rollNumber, // Corrected field mapping
        class: selectedStudent.class || "",
        section: selectedStudent.section || "",
        amount: parseFloat(paymentData.amount) || 0,
        paymentDate: new Date(paymentData.paymentDate),
        paymentMode: paymentData.paymentMode || "cash",
        receiptNumber: paymentData.receiptNumber || `REC-${Date.now()}`,
        remarks: paymentData.remarks || "",
        status: "paid",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "feePayments"), newPayment);

      // Close modal and reset form
      setShowPaymentModal(false);
      setPaymentData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "cash",
        receiptNumber: "",
        remarks: "",
      });

      toast.success("Payment recorded successfully!");

      // Navigate to Payment Receipt page
      navigate("/admin/payment-receipt", { 
        state: { 
            payment: { ...newPayment, id: docRef.id },
            view: 'receipt'
        } 
      });

    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error(`Error recording payment: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Debug Section */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-yellow-800">
              Debug Info
            </h3>
            <button
              onClick={debugDataMismatch}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              Check Data Mismatch
            </button>
          </div>
          {debugInfo && (
            <div className="mt-2 p-2 bg-white rounded border text-xs">
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Student Fee Manager
        </h1>

        {/* Student Selection */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Select Student
          </h2>
          <select
            value={selectedStudent?.id || ""}
            onChange={(e) => {
              const studentId = e.target.value;
              const student = students.find((s) => s.id === studentId);
              setSelectedStudent(student || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={students.length === 0}
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.rollNo || student.rollNumber} - {student.name} - Class {student.class}
                {student.section ? ` (Section ${student.section})` : ""}
              </option>
            ))}
          </select>
          {students.length === 0 && !loading && (
            <p className="text-red-500 mt-2">
              No students found. Please add students in the Student Management
              section.
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        )}

        {selectedStudent && (
          <div className="mb-6">
            {/* Student Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Student Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Roll Number</p>
                  <p className="font-medium">{selectedStudent.rollNo || selectedStudent.rollNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium">
                    Class {selectedStudent.class}
                    {selectedStudent.section
                      ? ` (Section ${selectedStudent.section})`
                      : ""}
                  </p>
                </div>
                {selectedStudent.academicYear && (
                  <div>
                    <p className="text-sm text-gray-600">Academic Year</p>
                    <p className="font-medium">
                      {selectedStudent.academicYear}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {feeStructures.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      No fee structure found for Class {selectedStudent.class}.
                      Please add fee structures in the Fees Management section.
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Debug: {debugInfo}
                    </p>
                  </div>
                </div>
              </div>
            ) : feeSummary ? (
              <>
                {/* Fee Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600">Total Fee</p>
                    <p className="text-2xl font-bold text-blue-800">
                      ₹{feeSummary.totalFee.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-800">
                      ₹{feeSummary.paidAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-yellow-600">Due Amount</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      ₹{feeSummary.dueAmount.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-4 text-center ${feeSummary.paymentStatus === "Paid"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                      }`}
                  >
                    <p className="text-sm">Payment Status</p>
                    <p className="text-2xl font-bold">
                      {feeSummary.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Record Payment Button */}
                <div className="mb-6 text-right">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                </div>

                {/* Fee Structure */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Fee Structure for Class {selectedStudent.class}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Fee Type
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Amount
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Frequency
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-left">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeStructures.map((fee) => (
                          <tr key={fee.id}>
                            <td className="border border-gray-300 px-4 py-2">
                              {fee.feeType}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              ₹{fee.amount}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 capitalize">
                              {fee.frequency}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {fee.description || "-"}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="border border-gray-300 px-4 py-2">
                            Total
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            ₹{feeSummary.totalFee.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            -
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            -
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Payment History
                  </h2>
                  {feePayments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Date
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Amount
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Payment Mode
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Receipt Number
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Status
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {feePayments.map((payment) => {
                            const paymentDate = payment.paymentDate
                              ? payment.paymentDate.toLocaleDateString()
                              : "N/A";

                            return (
                              <tr key={payment.id}>
                                <td className="border border-gray-300 px-4 py-2">
                                  {paymentDate}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  ₹{payment.amount}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 capitalize">
                                  {payment.paymentMode}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {payment.receiptNumber || "-"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 capitalize">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${payment.status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : payment.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                  >
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {payment.remarks || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      No payment history found.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentData.paymentMode}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentMode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentData.receiptNumber}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        receiptNumber: e.target.value,
                      })
                    }
                    placeholder="Leave empty to auto-generate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={paymentData.remarks}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        remarks: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="2"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Record & View Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeeManager;