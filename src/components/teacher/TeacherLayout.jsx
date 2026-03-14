import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  FileText,
  Calendar,
  Camera,
  UserCheck,
  LogOut,
  Menu,
  X,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const getTeacherMenuItems = () => [
  {
    name: "Dashboard",
    path: "/teacher",
    icon: LayoutDashboard,
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:from-blue-600 hover:to-blue-700",
    iconColor: "text-blue-100",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    name: "Mark Attendance",
    path: "/teacher/attendance",
    icon: UserCheck,
    color: "from-green-500 to-green-600",
    hoverColor: "hover:from-green-600 hover:to-green-700",
    iconColor: "text-green-100",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    name: "Homework & Notices",
    path: "/teacher/homework",
    icon: FileText,
    color: "from-purple-500 to-purple-600",
    hoverColor: "hover:from-purple-600 hover:to-purple-700",
    iconColor: "text-purple-100",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    name: "My Timetable",
    path: "/teacher/timetable",
    icon: Calendar,
    color: "from-amber-500 to-amber-600",
    hoverColor: "hover:from-amber-600 hover:to-amber-700",
    iconColor: "text-amber-100",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  {
    name: "Photo Gallery",
    path: "/teacher/gallery",
    icon: Camera,
    color: "from-rose-500 to-rose-600",
    hoverColor: "hover:from-rose-600 hover:to-rose-700",
    iconColor: "text-rose-100",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
  },
  {
    name: "Leave Application",
    path: "/teacher/leaves",
    icon: Clock,
    color: "from-indigo-500 to-indigo-600",
    hoverColor: "hover:from-indigo-600 hover:to-indigo-700",
    iconColor: "text-indigo-100",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
];

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const { currentUser, userData, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const teacherMenuItems = useMemo(() => getTeacherMenuItems(), []);

  // SECURITY CHECK
  useEffect(() => {
    // CRITICAL: Wait for loading to finish
    if (!loading) {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      
      // Strict Role Check
      if (userData?.role !== "teacher") {
        navigate("/"); // Redirect unauthorized users to Home
      } else {
        setIsAuthorized(true);
      }
    }
  }, [currentUser, userData, loading, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }, [logout, navigate]);

  const isActive = useCallback(
    (path) => {
      if (path === "/teacher") {
        return location.pathname === "/teacher";
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  // Show spinner while AuthContext loads or while we verify role
  if (loading || !isAuthorized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      {/* Sidebar - Same structure as before */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-20 lg:w-64 bg-gradient-to-b from-indigo-800 to-indigo-900 shadow-xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-indigo-700 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white rounded-lg">
              <GraduationCap className="h-6 w-6 text-indigo-700" />
            </div>
            <span className="hidden lg:block text-xl font-bold text-white">
              Teacher Portal
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-indigo-700 bg-indigo-900/50 hidden lg:block">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {userData?.name?.charAt(0) || "T"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userData?.name}</p>
              <p className="text-xs text-indigo-300 truncate">Class Teacher</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 px-2 lg:px-3 py-6 overflow-y-auto">
            <div className="space-y-1">
              {teacherMenuItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center p-3 lg:px-4 lg:py-3 rounded-xl transition-all group ${
                      active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : `text-indigo-100 hover:bg-gradient-to-r ${item.color} hover:text-white hover:shadow-md`
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        active
                          ? "bg-white/20"
                          : "bg-indigo-700/50 group-hover:bg-white/20"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mx-auto lg:mr-3 lg:ml-0" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium ml-2">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="px-2 lg:px-3 pb-6 border-t border-indigo-700 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 lg:px-4 lg:py-3 text-red-100 rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all group mt-4"
            >
              <div className="p-2 rounded-lg bg-indigo-700/50 group-hover:bg-white/20">
                <LogOut className="h-5 w-5 mx-auto lg:mr-3 lg:ml-0" />
              </div>
              <span className="hidden lg:block text-sm font-medium ml-2">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:ml-0">
        <div className="lg:hidden bg-white shadow-md border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-indigo-700" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Teacher Portal</span>
            </div>
            <div className="w-9"></div>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 min-h-[calc(100vh-120px)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}