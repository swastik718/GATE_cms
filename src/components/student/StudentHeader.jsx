import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Bell, Menu, X, BookOpen } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function StudentHeader() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    name: "",
    id: "",
    program: "",
    semester: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [todayClasses, setTodayClasses] = useState(0);

  useEffect(() => {
    // Fetch student data
    const fetchStudentData = async () => {
      if (currentUser?.uid) {
        try {
          const studentDoc = await getDoc(doc(db, "students", currentUser.uid));
          if (studentDoc.exists()) {
            setStudentData({
              name: studentDoc.data().name || "Student",
              id: studentDoc.data().studentId || "N/A",
              program: studentDoc.data().program || "Not specified",
              semester: studentDoc.data().semester || "Not specified",
            });
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    };

    // Fetch notifications
   // Fetch notifications from both notifications collection and notices
const fetchNotifications = () => {
  if (currentUser?.uid) {
    // Query notices collection for general announcements
    const noticesQuery = query(
      collection(db, "notices"),
      where("date", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    );

    const unsubscribe = onSnapshot(noticesQuery, (querySnapshot) => {
      const notifs = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
          id: doc.id,
          message: `${data.title}: ${data.description}`,
          date: data.date,
          read: false,
          type: 'notice'
        });
      });
      // Sort by date descending
      notifs.sort((a, b) => b.date?.toDate() - a.date?.toDate());
      setNotifications(notifs);
    });

    return unsubscribe;
  }
};

    // Get today's classes count
    const getTodaysClasses = () => {
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      // This would typically come from a schedule in your database
      const classCount = [0, 3, 2, 4, 1, 0, 0][today]; // Example schedule
      setTodayClasses(classCount);
    };

    fetchStudentData();
    const unsubscribe = fetchNotifications();
    getTodaysClasses();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const diffInMs = now - timestamp.toDate();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and student info */}
          <div className="flex items-center">
            <Link
              to="/student"
              className="text-xl font-bold text-blue-600 flex items-center"
            >
              <BookOpen className="h-6 w-6 mr-2" />
              Student Portal
            </Link>

            <div className="hidden md:block border-l border-gray-300 h-6 mx-4"></div>

            <div className="hidden md:flex flex-col">
              <span className="text-sm text-gray-700 font-medium">
                {studentData.name}
              </span>
              {/* Commented out the Student ID */}
              {/* <span className="text-xs text-gray-500">
                ID: {studentData.id}
              </span> */} 
             
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Today's classes indicator */}
            {/* {todayClasses > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                {todayClasses} class{todayClasses > 1 ? "es" : ""} today
              </div>
            )} */}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">
                      Notifications
                    </h3>
                    {unreadNotifications > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                  <div className="py-1 max-h-96 overflow-y-auto" role="menu">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 text-sm border-b border-gray-100 ${
                            notification.read
                              ? "text-gray-600"
                              : "text-gray-900 bg-blue-50"
                          }`}
                        >
                          <p>{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatNotificationTime(notification.date)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-600">
                        No notifications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-blue-600 flex items-center text-sm"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Student info */}
            <div className="px-3 py-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3">
                  {studentData.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {studentData.name}
                  </p>
                  <p className="text-xs text-gray-500">ID: {studentData.id}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            {/* Program info */}
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500">Program</p>
              <p className="text-sm font-medium">{studentData.program}</p>
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            {/* Today's classes */}
            {todayClasses > 0 && (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-blue-700">
                    {todayClasses} class{todayClasses > 1 ? "es" : ""} today
                  </p>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
              </>
            )}

            {/* Notifications */}
            <div className="px-3 py-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Notifications
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-md text-sm ${
                        notification.read
                          ? "text-gray-600"
                          : "text-gray-900 bg-blue-50"
                      }`}
                    >
                      <p>{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatNotificationTime(notification.date)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No notifications</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            {/* Logout */}
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Overlay for closing dropdowns when clicking outside */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationsOpen(false)}
        ></div>
      )}
    </header>
  );
}
