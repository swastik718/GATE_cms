// components/student/StudentFeeView.jsx
import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const StudentFeeView = () => {
  const { currentUser, userData } = useAuth();
  const [feePayments, setFeePayments] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
    receiptNumber: "",
    remarks: "",
  });

  useEffect(() => {
    if (currentUser && userData) {
      fetchFeeData();
    }
  }, [currentUser, userData]);

  // Function to normalize class values (same as in admin component)
  const normalizeClass = (classValue) => {
    if (!classValue) return "";
    const strClass = classValue.toString().trim();
    if (strClass.toLowerCase().startsWith("class")) {
      return strClass.replace(/class\s*/i, "").trim();
    }
    return strClass;
  };

  const fetchFeeData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch student's fee payments
      const paymentsQuery = query(
        collection(db, "feePayments"),
        where("studentId", "==", currentUser.uid),
        orderBy("paymentDate", "desc")
      );

      const paymentsSnapshot = await getDocs(paymentsQuery);
      let paymentsData = [];

      if (!paymentsSnapshot.empty) {
        paymentsData = paymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          paymentDate: doc.data().paymentDate?.toDate() || null,
          dueDate: doc.data().dueDate?.toDate() || null,
        }));
      }

      setFeePayments(paymentsData);

      // Fetch fee structure for student's class
      if (userData.class) {
        const studentClass = userData.class;
        const normalizedStudentClass = normalizeClass(studentClass);
        let feeStructuresData = [];

        // Try multiple methods to find matching fee structure
        try {
          // Method 1: Exact match
          const feeQuery = query(
            collection(db, "fees"),
            where("class", "==", studentClass)
          );
          const feeSnapshot = await getDocs(feeQuery);

          if (!feeSnapshot.empty) {
            feeStructuresData = feeSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          } else {
            // Method 2: Normalized match
            const normalizedFeeQuery = query(
              collection(db, "fees"),
              where("class", "==", normalizedStudentClass)
            );
            const normalizedFeeSnapshot = await getDocs(normalizedFeeQuery);

            if (!normalizedFeeSnapshot.empty) {
              feeStructuresData = normalizedFeeSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
            } else {
              // Method 3: Client-side filtering
              const allFeesQuery = query(collection(db, "fees"));
              const allFeesSnapshot = await getDocs(allFeesQuery);
              const allFees = allFeesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              feeStructuresData = allFees.filter((fee) => {
                const feeClass = normalizeClass(fee.class);
                return feeClass === normalizedStudentClass;
              });
            }
          }
        } catch (err) {
          console.error("Error fetching fee structure:", err);
        }

        setFeeStructures(feeStructuresData);

        // Calculate totals
        const totalFeeAmount = feeStructuresData.reduce(
          (sum, fee) => sum + parseFloat(fee.amount || 0),
          0
        );

        const paidAmount = paymentsData
          .filter((payment) => payment.status === "paid")
          .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

        const dueAmount = totalFeeAmount - paidAmount;

        setTotalFee(totalFeeAmount);
        setTotalPaid(paidAmount);
        setTotalDue(dueAmount);
      }
    } catch (err) {
      console.error("Error fetching fee data:", err);
      setError("Error fetching fee data. Please try again.");
    }
    setLoading(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create a new payment record
      await addDoc(collection(db, "feePayments"), {
        studentId: currentUser.uid,
        studentName: userData.name,
        rollNumber: userData.rollNumber,
        class: userData.class,
        section: userData.section || "",
        amount: parseFloat(paymentData.amount),
        paymentDate: new Date(paymentData.paymentDate),
        paymentMode: paymentData.paymentMode,
        receiptNumber: paymentData.receiptNumber,
        remarks: paymentData.remarks,
        status: "paid",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Refresh data
      await fetchFeeData();

      // Reset form and close modal
      setPaymentData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "cash",
        receiptNumber: "",
        remarks: "",
      });
      setShowPaymentModal(false);

      alert("Payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Error recording payment. Please try again.");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case "overdue":
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-2">
            View your fee payments and status
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fee</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalFee.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalPaid.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalDue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Payment Status
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDue <= 0 ? "Paid" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Make Payment Button */}
        <div className="mb-6 text-right">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Make Payment
          </button>
        </div>

        {/* Fee Structure */}
        {feeStructures.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Fee Structure for Class {userData.class}
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
                    <td className="border border-gray-300 px-4 py-2">Total</td>
                    <td className="border border-gray-300 px-4 py-2">
                      ₹{totalFee.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">-</td>
                    <td className="border border-gray-300 px-4 py-2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fee Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Payment History
            </h2>
          </div>

          <div className="p-6">
            {feePayments.length === 0 ? (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payment records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feePayments.map((payment) => {
                      const paymentDate = payment.paymentDate
                        ? payment.paymentDate.toLocaleDateString()
                        : "N/A";

                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paymentDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.paymentMode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.receiptNumber || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {getStatusIcon(payment.status)}
                              <span className="ml-1">
                                {getStatusText(payment.status)}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.remarks || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Payment Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium">Bank Transfer:</p>
              <p>Account Name: Gandhi Academy of technology and engineering(GATE)</p>
              <p>Account Number: 1234567890</p>
              <p>IFSC Code: SBIN0000123</p>
              <p>Bank: State Bank of India</p>
            </div>
            <div>
              <p className="font-medium">UPI Payment:</p>
              <p>UPI ID: college.excellence@oksbi</p>
              <p>QR Code: Available at college office</p>
              <br />
              <p className="font-medium">Cash Payment:</p>
              <p>College Office: 9:00 AM - 4:00 PM</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> After making payment, please submit the
              receipt to the college office or upload it through the parent
              portal. Payments are processed within 24-48 hours.
            </p>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
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
                    max={totalDue}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum amount: ₹{totalDue.toFixed(2)}
                  </p>
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
                    Record Payment
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

export default StudentFeeView;
