import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bell,
  Camera,
  Settings,
  Menu,
  X,
  LogOut,
  Calendar,
  DollarSign,
  FileText,
  Award,
  Clock,
  Database,
  ClipboardCheck
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

// Memoize menu items
const getAdminMenuItems = () => [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:from-blue-600 hover:to-blue-700",
    iconColor: "text-blue-100",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    name: "Students",
    path: "/admin/students",
    icon: Users,
    color: "from-green-500 to-green-600",
    hoverColor: "hover:from-green-600 hover:to-green-700",
    iconColor: "text-green-100",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    name: "Teachers",
    path: "/admin/teachers",
    icon: GraduationCap,
    color: "from-purple-500 to-purple-600",
    hoverColor: "hover:from-purple-600 hover:to-purple-700",
    iconColor: "text-purple-100",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  
  {
    name: "Attendance",
    path: "/admin/attendance",
    icon: Clock,
    color: "from-rose-500 to-rose-600",
    hoverColor: "hover:from-rose-600 hover:to-rose-700",
    iconColor: "text-rose-100",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
  },

  {
    name: "Exams & Results",
    path: "/admin/results",
    icon: Award,
    color: "from-indigo-500 to-indigo-600",
    hoverColor: "hover:from-indigo-600 hover:to-indigo-700",
    iconColor: "text-indigo-100",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  {
    name: "Fee Management",
    path: "/admin/fees",
    icon: DollarSign,
    color: "from-emerald-500 to-emerald-600",
    hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
    iconColor: "text-emerald-100",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    name: "Student Fees", 
    path: "/admin/student-fees",
    icon: DollarSign, 
    color: "from-teal-500 to-teal-600",
    hoverColor: "hover:from-teal-600 hover:to-teal-700",
    iconColor: "text-teal-100",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
  },
  {
    name: "Timetable",
    path: "/admin/timetable",
    icon: Calendar,
    color: "from-pink-500 to-pink-600",
    hoverColor: "hover:from-pink-600 hover:to-pink-700",
    iconColor: "text-pink-100",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
  },
  
  {
    name: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
    color: "from-orange-500 to-orange-600",
    hoverColor: "hover:from-orange-600 hover:to-orange-700",
    iconColor: "text-orange-100",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    name: "Photo Gallery",
    path: "/admin/gallery",
    icon: Camera,
    color: "from-violet-500 to-violet-600",
    hoverColor: "hover:from-violet-600 hover:to-violet-700",
    iconColor: "text-violet-100",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
  },
  // Setting page is yet to be implemented
  // {
  //   name: "Settings",
  //   path: "/admin/settings",
  //   icon: Settings,
  //   color: "from-gray-500 to-gray-600",
  //   hoverColor: "hover:from-gray-600 hover:to-gray-700",
  //   iconColor: "text-gray-100",
  //   bgColor: "bg-gray-50",
  //   textColor: "text-gray-700",
  // },
  
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { currentUser, userData, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminMenuItems = useMemo(() => getAdminMenuItems(), []);

  // Strict Security Check
  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      if (userData?.role !== "admin") {
        navigate("/"); 
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
      if (path === "/admin") {
        return location.pathname === "/admin";
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  if (loading || !isAuthorized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      {/* Sidebar - Desktop */}
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
              Admin Panel
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-indigo-700 bg-indigo-900/50 hidden lg:block">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {userData?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userData?.name || "Administrator"}</p>
              <p className="text-xs text-indigo-300 truncate">{userData?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 px-2 lg:px-3 py-6 overflow-y-auto">
            <div className="space-y-1">
              {adminMenuItems.map((item) => {
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
                    title={item.name}
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

      {/* Main Content */}
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
              <span className="text-lg font-semibold text-gray-900">Admin</span>
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