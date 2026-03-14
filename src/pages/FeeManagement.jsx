// FeeManagement.jsx
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FeeManagement = () => {
  // State for form inputs
  const [feeData, setFeeData] = useState({
    class: "",
    feeType: "",
    amount: "",
    frequency: "monthly",
    description: "",
  });

  // State for all fees
  const [fees, setFees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [classFilter, setClassFilter] = useState("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Class options for dropdown
  const classOptions = [
   "BCA","BTECH","MCA","MSC","BSC","MBA"
  ];

  // Fee type options
  const feeTypeOptions = [
    "Admission Fee",
    "Monthly Fee",
    "Quarterly Fee",
    "Annual Fee",
    "Uniform Fee",
    "Transport Fee",
    "Examination Fee",
    "Activity Fee",
    "Computer Fee",
    "Development Fee",
  ];

  // Frequency options
  const frequencyOptions = [
    "one-time",
    "monthly",
    "quarterly",
    "half-yearly",
    "annual",
  ];

  // Fetch fees from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "fees"),
      (snapshot) => {
        const feesData = [];
        snapshot.forEach((doc) => {
          if (doc.exists()) {
            feesData.push({ id: doc.id, ...doc.data() });
          }
        });
        setFees(feesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching fees: ", error);
        toast.error("Failed to load fee records");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeeData({
      ...feeData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId !== null) {
        // Update existing fee in Firestore
        const feeRef = doc(db, "fees", editingId);
        await updateDoc(feeRef, {
          ...feeData,
          updatedAt: new Date(),
        });
        setEditingId(null);
        toast.success("Fee record updated successfully");
      } else {
        // Add new fee to Firestore
        await addDoc(collection(db, "fees"), {
          ...feeData,
          createdAt: new Date(),
        });
        toast.success("Fee record added successfully");
      }

      // Reset form
      setFeeData({
        class: "",
        feeType: "",
        amount: "",
        frequency: "monthly",
        description: "",
      });
    } catch (error) {
      console.error("Error saving fee: ", error);
      toast.error("Error saving fee data. Please try again.");
    }
  };

  // Edit a fee record
  const handleEdit = (id) => {
    const fee = fees.find((f) => f.id === id);
    if (fee) {
      setFeeData({
        class: fee.class || "",
        feeType: fee.feeType || "",
        amount: fee.amount || "",
        frequency: fee.frequency || "monthly",
        description: fee.description || "",
      });
      setEditingId(id);
      toast.info("Editing fee record");
    }
  };

  // Delete a fee record
  const handleDelete = async (fee) => {
    if (!fee || !fee.id) {
      console.error("Cannot delete fee: Invalid fee object or ID");
      toast.error("Cannot delete fee: Invalid record");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the fee record for ${fee.class} - ${fee.feeType}?`
      )
    ) {
      try {
        await deleteDoc(doc(db, "fees", fee.id));
        toast.success("Fee record deleted successfully");
      } catch (error) {
        console.error("Error deleting fee: ", error);
        toast.error("Error deleting fee record. Please try again.");
      }
    }
  };

  // Filter fees by class and fee type
  const filteredFees = fees.filter((fee) => {
    const classMatch = classFilter === "all" || fee.class === classFilter;
    const feeTypeMatch =
      feeTypeFilter === "all" || fee.feeType === feeTypeFilter;
    return classMatch && feeTypeMatch;
  });

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
          Fee Management System
        </h1>

        {/* Fee Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-blue-50 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            {editingId !== null ? "Edit Fee Record" : "Add New Fee"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                name="class"
                value={feeData.class}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Class</option>
                {classOptions.map((cls, index) => (
                  <option key={index} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Type
              </label>
              <select
                name="feeType"
                value={feeData.feeType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Fee Type</option>
                {feeTypeOptions.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={feeData.amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={feeData.frequency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {frequencyOptions.map((freq, index) => (
                  <option key={index} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={feeData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId !== null
                ? "Update Fee"
                : "Add Fee"}
            </button>
          </div>
        </form>

        {/* Filters and Fee List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Fee Records
            </h2>

            <div className="flex items-center space-x-4">
              <div>
                <label className="mr-2 text-gray-700">Filter by Class:</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Classes</option>
                  {classOptions.map((cls, index) => (
                    <option key={index} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mr-2 text-gray-700">Filter by Type:</label>
                <select
                  value={feeTypeFilter}
                  onChange={(e) => setFeeTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {feeTypeOptions.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-4">
              Loading fee records...
            </p>
          ) : filteredFees.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No fee records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Class
                    </th>
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
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {fee.class}
                      </td>
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
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(fee.id)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(fee)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;