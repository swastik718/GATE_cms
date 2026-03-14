import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, User, GraduationCap, Calendar, MessageSquare } from 'lucide-react';

export default function LeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // FIX: Query without orderBy
      const q = query(
        collection(db, "leaves"),
        where("status", "==", "pending_admin")
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // FIX: Sort Client-Side
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRequests(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch requests");
    }
    setLoading(false);
  };

  const handleDecision = async (id, decision, remark) => {
    try {
      const leaveRef = doc(db, "leaves", id);
      await updateDoc(leaveRef, {
        status: decision, // 'approved' or 'rejected'
        adminRemark: remark || (decision === 'approved' ? 'Approved' : 'Rejected'),
        updatedAt: new Date().toISOString()
      });
      toast.success(`Leave request ${decision}`);
      fetchRequests(); // Refresh
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>
          <p className="text-gray-600 mt-2">Final review for Teacher and forwarded Student leaves.</p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
             {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl shadow-sm"></div>)}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900">All Caught Up!</h3>
            <p className="text-gray-500 mt-1">No pending leave requests requiring your approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl shadow-lg border-l-4 border-purple-500 overflow-hidden transform transition-all hover:-translate-y-1">
                <div className="p-6">
                  {/* Header: User Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${req.userRole === 'teacher' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {req.userRole === 'teacher' ? <GraduationCap size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{req.userName}</h3>
                        <div className="flex items-center text-xs text-gray-500 uppercase font-semibold tracking-wide">
                          {req.userRole} {req.userRole === 'student' && `• Class ${req.class || 'N/A'}`}
                        </div>
                      </div>
                    </div>
                    {/* Badge showing origin */}
                    {req.teacherRemark && (
                      <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded border border-yellow-100">
                        Forwarded
                      </span>
                    )}
                  </div>

                  {/* Body: Details */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-5">
                    <div className="flex items-center text-gray-700 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">{req.startDate}</span>
                      <span className="mx-2">to</span>
                      <span className="font-medium">{req.endDate}</span>
                    </div>
                    <div className="flex items-start text-gray-700 text-sm">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                      <p className="italic">"{req.reason}"</p>
                    </div>
                    {req.teacherRemark && (
                      <div className="text-sm border-t border-gray-200 pt-2 mt-2">
                        <span className="text-indigo-600 font-semibold text-xs uppercase">Teacher's Note:</span>
                        <p className="text-gray-600">{req.teacherRemark}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      id={`admin-remark-${req.id}`}
                      placeholder="Optional remark..."
                      className="w-full text-sm border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-colors"
                    />
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleDecision(req.id, 'rejected', document.getElementById(`admin-remark-${req.id}`).value)}
                        className="flex-1 flex items-center justify-center py-2.5 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                      <button 
                        onClick={() => handleDecision(req.id, 'approved', document.getElementById(`admin-remark-${req.id}`).value)}
                        className="flex-1 flex items-center justify-center py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md transition-all active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}