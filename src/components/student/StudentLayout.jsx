import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import StudentHeader from "./StudentHeader";
import LoadingSpinner from "../common/LoadingSpinner";
import { Home, FileText, CreditCard, LogOut, Menu, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { currentUser, userData, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // SECURITY CHECK
  useEffect(() => {
    // CRITICAL: Wait for loading to finish
    if (!loading) {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      
      // Strict Role Check
      if (userData?.role !== "student") {
        navigate("/"); // Redirect unauthorized users
      } else {
        setIsAuthorized(true);
      }
    }
  }, [currentUser, userData, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Show spinner while AuthContext loads or while we verify role
  if (loading || !isAuthorized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm lg:hidden h-16 flex items-center justify-between px-4 z-20">
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
           <span className="font-bold text-lg text-indigo-700">My College</span>
        </div>
        <div className="w-8"></div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-center border-b px-4 bg-indigo-700">
              <h1 className="text-xl font-bold text-white">Student Portal</h1>
            </div>

            {/* User Profile Summary */}
            <div className="p-6 text-center border-b bg-indigo-50">
              <div className="w-20 h-20 mx-auto bg-indigo-200 rounded-full flex items-center justify-center mb-3 shadow-inner">
                {userData?.photo ? (
                   <img src={userData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                   <User className="h-10 w-10 text-indigo-600" />
                )}
              </div>
              <h2 className="font-bold text-gray-800">{userData?.name || "Student"}</h2>
              <p className="text-sm text-gray-500">Class {userData?.class}-{userData?.section}</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link to="/student" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive('/student') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Home className="h-5 w-5 mr-3" /> Dashboard
              </Link>
              <Link to="/student/report-card" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive('/student/report-card') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FileText className="h-5 w-5 mr-3" /> Report Card
              </Link>
              <Link to="/student/fees" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive('/student/fees') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                <CreditCard className="h-5 w-5 mr-3" /> Fee Status
              </Link>
              <Link to="/student/leaves" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive('/student/leaves') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Calendar className="h-5 w-5 mr-3" /> Leave Application
              </Link>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut className="h-5 w-5 mr-3" /> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}