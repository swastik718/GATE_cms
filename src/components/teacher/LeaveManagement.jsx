import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { UserCheck, Briefcase, Check, X } from 'lucide-react';

export default function LeaveManagement() {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState("student-requests");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Personal Leave Form
  const [personalForm, setPersonalForm] = useState({ startDate: "", endDate: "", reason: "" });

  useEffect(() => {
    fetchLeaves();
  }, [activeTab, currentUser]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const leavesRef = collection(db, "leaves");
      let q;

      if (activeTab === "my-leaves") {
        // Fetch MY personal leaves - FIX: No orderBy
        q = query(leavesRef, where("userId", "==", currentUser.uid));
      } else {
        // Fetch STUDENT leaves - FIX: No orderBy
        q = query(
          leavesRef, 
          where("userRole", "==", "student"),
          where("status", "==", "pending_teacher")
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // FIX: Sort Client-Side
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setLeaves(data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const handleApplyPersonalLeave = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "leaves"), {
        userId: currentUser.uid,
        userName: userData.name || "Teacher",
        userRole: "teacher",
        ...personalForm,
        status: "pending_admin", 
        createdAt: new Date().toISOString()
      });
      toast.success("Application sent to Admin!");
      setPersonalForm({ startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (error) {
      toast.error("Submission failed");
    }
  };

  const processStudentLeave = async (leaveId, action, remark) => {
    if (!remark && action === 'rejected') return toast.error("Remark is required for rejection");
    
    try {
      const leaveRef = doc(db, "leaves", leaveId);
      await updateDoc(leaveRef, {
        status: action === 'forward' ? "pending_admin" : "rejected",
        teacherRemark: remark || "Forwarded by Class Teacher",
        updatedAt: new Date().toISOString()
      });
      toast.success(action === 'forward' ? "Forwarded to Admin" : "Request Rejected");
      fetchLeaves();
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-500">Manage student requests or apply for personal leave.</p>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("student-requests")}
          className={`pb-3 px-4 flex items-center font-medium transition-colors ${
            activeTab === "student-requests"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCheck className="w-5 h-5 mr-2" />
          Student Requests
          {activeTab === "student-requests" && leaves.length > 0 && (
            <span className="ml-2 bg-purple-100 text-purple-600 py-0.5 px-2 rounded-full text-xs">
              {leaves.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("my-leaves")}
          className={`pb-3 px-4 flex items-center font-medium transition-colors ${
            activeTab === "my-leaves"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase className="w-5 h-5 mr-2" />
          My Applications
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div></div>
      ) : (
        <>
          {activeTab === "student-requests" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaves.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending student requests.</p>
                </div>
              ) : (
                leaves.map((leave) => (
                  <div key={leave.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{leave.userName}</h3>
                          <p className="text-sm text-gray-500">Class {leave.class || 'N/A'}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-medium">
                          Review Needed
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Dates:</span>
                          <span className="font-medium text-gray-900">{leave.startDate} to {leave.endDate}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600 italic">"{leave.reason}"</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <input
                          id={`remark-${leave.id}`}
                          type="text"
                          placeholder="Add remark (optional)..."
                          className="w-full text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => processStudentLeave(leave.id, 'rejected', document.getElementById(`remark-${leave.id}`).value)}
                            className="flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                          >
                            <X className="w-4 h-4 mr-2" /> Reject
                          </button>
                          <button
                            onClick={() => processStudentLeave(leave.id, 'forward', document.getElementById(`remark-${leave.id}`).value)}
                            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm"
                          >
                            <Check className="w-4 h-4 mr-2" /> Forward
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "my-leaves" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                <h3 className="font-bold text-gray-900 mb-4">Apply for Personal Leave</h3>
                <form onSubmit={handleApplyPersonalLeave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">From</label>
                      <input type="date" required className="w-full mt-1 border-gray-300 rounded-lg text-sm"
                        value={personalForm.startDate} onChange={e => setPersonalForm({...personalForm, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">To</label>
                      <input type="date" required className="w-full mt-1 border-gray-300 rounded-lg text-sm"
                        value={personalForm.endDate} onChange={e => setPersonalForm({...personalForm, endDate: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Reason</label>
                    <textarea required rows="3" className="w-full mt-1 border-gray-300 rounded-lg text-sm" placeholder="Reason..."
                      value={personalForm.reason} onChange={e => setPersonalForm({...personalForm, reason: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    Submit to Admin
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-gray-900">Application History</h3>
                {leaves.length === 0 && <p className="text-gray-500">No applications history.</p>}
                {leaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{leave.reason}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {leave.status === 'pending_admin' ? 'Under Review' : leave.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{leave.startDate} — {leave.endDate}</p>
                    </div>
                    {leave.adminRemark && (
                      <div className="text-xs bg-gray-50 px-3 py-2 rounded text-gray-600 max-w-xs">
                        <span className="font-bold">Admin:</span> {leave.adminRemark}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}