import React, { useState } from "react";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Printer, ArrowLeft, Search, FileText, Calendar, CreditCard, User } from "lucide-react";

const PaymentReceipt = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    
    receiptNumber: "",
  });
  const [error, setError] = useState("");
  const [viewState, setViewState] = useState("search"); // 'search', 'list', 'receipt'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const searchPayments = async (e) => {
    e.preventDefault();
    if (!searchParams.rollNo && !searchParams.receiptNumber) {
      setError("Please enter either a Roll Number or Receipt Number");
      return;
    }

    setLoading(true);
    setError("");
    setPayments([]);

    try {
      let q;
      const paymentsRef = collection(db, "feePayments");

      if (searchParams.receiptNumber) {
        // Search by Receipt Number (Exact match)
        q = query(paymentsRef, where("receiptNumber", "==", searchParams.receiptNumber.trim()));
      } else {
        // Search by Roll Number (Fetch history)
        q = query(
          paymentsRef, 
          where("rollNumber", "==", searchParams.rollNo.trim()),
          orderBy("paymentDate", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Handle Firestore Timestamp conversion safely
        paymentDate: doc.data().paymentDate?.toDate ? doc.data().paymentDate.toDate() : new Date(doc.data().paymentDate)
      }));

      if (results.length === 0) {
        setError("No payment records found with these details.");
        setViewState("search");
      } else if (results.length === 1 && searchParams.receiptNumber) {
        // If searching by receipt number, show receipt directly
        setSelectedPayment(results[0]);
        setViewState("receipt");
      } else {
        // Show list of payments
        setPayments(results);
        setViewState("list");
      }
    } catch (err) {
      console.error("Error searching payments:", err);
      // Fallback for missing index error on RollNo + Sort
      if (err.code === 'failed-precondition') {
        setError("System is indexing data. Please try again later.");
      } else {
        setError("Failed to fetch payment records. Please check the details.");
      }
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setSearchParams({ rollNo: "", receiptNumber: "" });
    setPayments([]);
    setSelectedPayment(null);
    setViewState("search");
    setError("");
  };

  const selectPayment = (payment) => {
    setSelectedPayment(payment);
    setViewState("receipt");
  };

  const backToList = () => {
    setSelectedPayment(null);
    setViewState("list");
  };

  // --- RENDER: SEARCH FORM ---
  if (viewState === "search") {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Receipts</h2>
            <p className="text-gray-500 mt-2">Download or print student fee receipts</p>
          </div>

          <form onSubmit={searchPayments} className="space-y-6">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Roll Number</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="rollNo"
                  value={searchParams.rollNo}
                  onChange={handleInputChange}
                  placeholder="e.g. 101"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div> */}
{/* 
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-sm text-gray-500 font-medium absolute">OR</span>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Receipt Number</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="receiptNumber"
                  value={searchParams.receiptNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. REC-2023-001"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" /> Find Receipts
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: LIST VIEW ---
  if (viewState === "list") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={handleReset} className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-500">
                  Found {payments.length} records for Roll No: <span className="font-medium text-gray-900">{searchParams.rollNo}</span>
                </p>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <div key={payment.id} className="p-5 hover:bg-blue-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">₹{payment.amount}</h4>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {payment.paymentDate.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Ref: {payment.receiptNumber || payment.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {payment.paymentMode}
                    </span>
                    <button 
                      onClick={() => selectPayment(payment)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: RECEIPT TEMPLATE ---
  if (viewState === "receipt" && selectedPayment) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0">
        <div className="max-w-3xl mx-auto">
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6 print:hidden">
            <button 
              onClick={payments.length > 1 ? backToList : handleReset}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <button 
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 flex items-center font-medium"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Receipt
            </button>
          </div>

          {/* RECEIPT CONTENT */}
          <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg print:shadow-none print:p-0 border border-gray-200 print:border-none" id="receipt-content">
            
            {/* Header */}
            <div className="border-b-2 border-blue-800 pb-6 mb-8 text-center">
              <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Gandhi Academy of technology and engineering(GATE) </h1>
              <p className="text-gray-500 mt-1 text-sm font-medium tracking-wide uppercase">123 Education Street, Knowledge City</p>
              <p className="text-gray-500 text-sm">Ph: +91 987** **210 | Email: accounts@Gandhi Academy of technology and engineering(GATE).com</p>
            </div>

            {/* Title & Date */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">Payment Receipt</h2>
                <p className="text-sm text-gray-500 mt-1">Computer Generated Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Receipt No:</p>
                <p className="text-lg font-mono font-bold text-gray-900">{selectedPayment.receiptNumber || selectedPayment.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-2">Date:</p>
                <p className="font-medium text-gray-900">{selectedPayment.paymentDate.toLocaleDateString()}</p>
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100 print:bg-gray-50 print:border-gray-300">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Student Name</p>
                  <p className="text-base font-bold text-gray-900">{selectedPayment.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Roll Number</p>
                  <p className="text-base font-bold text-gray-900">{selectedPayment.rollNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Class / Section</p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedPayment.class} {selectedPayment.section && `- ${selectedPayment.section}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Payment Mode</p>
                  <p className="text-base font-bold text-gray-900 capitalize">{selectedPayment.paymentMode}</p>
                </div>
              </div>
            </div>

            {/* Payment Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-blue-900">
                    <th className="py-3 px-4 text-left font-semibold border-b border-blue-100">Description</th>
                    <th className="py-3 px-4 text-right font-semibold border-b border-blue-100">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-4 px-4 border-b border-gray-100 text-gray-800">
                      {selectedPayment.remarks || "College Fee Payment"}
                    </td>
                    <td className="py-4 px-4 border-b border-gray-100 text-right font-mono font-medium text-gray-900">
                      {selectedPayment.amount.toFixed(2)}
                    </td>
                  </tr>
                  {/* Optional: Add extra rows if you have breakdowns, currently using generic row */}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-4 px-4 text-right font-bold text-gray-700">Total Amount</td>
                    <td className="py-4 px-4 text-right font-bold text-2xl text-blue-900">
                      ₹{selectedPayment.amount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="h-16 flex items-end justify-center">
                    {/* Placeholder for digital stamp if needed */}
                  </div>
                  <div className="border-t border-gray-400 w-32 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2 font-medium uppercase">Accountant Signature</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Received by</p>
                  <p className="font-bold text-gray-900 text-lg tracking-widest font-serif">Gandhi Academy of technology and engineering(GATE)</p>
                  <div className="border-t border-gray-400 w-32 mx-auto mt-2"></div>
                  <p className="text-xs text-gray-500 mt-2 font-medium uppercase">Authorized Signatory</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                 <p className="text-xs text-gray-400">Thank you for the payment. This is a computer-generated receipt.</p>
              </div>
            </div>

          </div>
        </div>

        {/* PRINT STYLES */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-content, #receipt-content * {
              visibility: visible;
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              box-shadow: none;
              border: none;
            }
            /* Ensure background colors print */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default PaymentReceipt;