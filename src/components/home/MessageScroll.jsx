import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Bell, X, Eye, Calendar, Download, Sparkles } from "lucide-react";

const MessageScroll = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveNotifications = async () => {
      try {
        const notificationsRef = collection(db, "notifications");
        const q = query(
          notificationsRef,
          where("isActive", "==", true),
          orderBy("priority", "desc"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const notificationData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchActiveNotifications();
  }, []);

  useEffect(() => {
    if (!loading && notifications.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, notifications.length]);

  useEffect(() => {
    if (isVisible && !showAll && notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVisible, showAll, notifications.length]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleViewAll = () => {
    setShowAll(true);
  };

  const handleBackToRotation = () => {
    setShowAll(false);
    setCurrentIndex(0);
  };

  if (loading || notifications.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 lg:bottom-6 lg:right-6 z-50 w-[calc(100vw-24px)] max-w-xs sm:max-w-sm lg:max-w-md">
      <div
        className={`transform transition-all duration-700 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full opacity-0 scale-95"
        }`}
      >
        <div className="bg-gradient-to-br from-white via-violet-50/50 to-rose-50/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-violet-200/50 overflow-hidden relative">
          <div className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-200/20 to-rose-200/20"></div>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-200/20 to-cyan-200/20"></div>

          <div className="bg-gradient-to-r from-violet-600 via-rose-500 to-emerald-500 text-white px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] opacity-20"></div>
            <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
              <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg backdrop-blur-sm">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm lg:text-base tracking-wide">
                NOTICE BOARD
              </h3>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 p-1 sm:p-1.5 rounded-lg relative z-10"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="p-3 sm:p-4 lg:p-5 relative z-10">
            {!showAll ? (
              <div className="space-y-2 sm:space-y-3">
                <div
                  key={notifications[currentIndex].id}
                  className="animate-fade-in"
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 shadow-sm"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 leading-tight mb-1 sm:mb-2">
                        {notifications[currentIndex].message ||
                          notifications[currentIndex].title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="text-xs">
                            {notifications[currentIndex].date ||
                              (notifications[currentIndex].createdAt?.toDate
                                ? notifications[currentIndex].createdAt
                                    .toDate()
                                    .toLocaleDateString()
                                : "Recent")}
                          </span>
                        </div>
                        {notifications[currentIndex].downloadUrl && (
                          <a
                            href={notifications[currentIndex].downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:text-violet-800 flex items-center gap-1 bg-violet-50 px-1.5 py-0.5 rounded-md transition-all duration-300 hover:bg-violet-100"
                          >
                            <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-xs font-medium">
                              Download
                            </span>
                          </a>
                        )}
                        {notifications[currentIndex].isNew && (
                          <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 text-xs rounded-full font-bold shadow-sm animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {notifications.length > 1 && (
                  <div className="flex gap-1 justify-center mt-2 sm:mt-3">
                    {notifications.map((_, index) => (
                      <button
                        key={index}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${
                          index === currentIndex
                            ? "bg-gradient-to-r from-violet-500 to-rose-500 shadow-lg"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                      />
                    ))}
                  </div>
                )}

                {notifications.length > 1 && (
                  <button
                    onClick={handleViewAll}
                    className="w-full bg-gradient-to-r from-violet-600 via-rose-500 to-emerald-500 text-white py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                    <span className="relative z-10">
                      VIEW ALL ({notifications.length})
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-2 sm:mb-3 sticky top-0 bg-gradient-to-r from-white via-violet-50/50 to-rose-50/30 backdrop-blur-sm py-1 rounded-lg">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full"></div>
                    All Notifications ({notifications.length})
                  </h4>
                  <button
                    onClick={handleBackToRotation}
                    className="text-violet-600 hover:text-violet-800 text-xs font-medium bg-violet-100 px-2 py-1 rounded-md transition-all duration-300 hover:bg-violet-200"
                  >
                    Back
                  </button>
                </div>

                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="bg-gradient-to-r from-white to-violet-50/30 border-l-3 border-gradient-to-b from-violet-400 to-rose-400 pl-2 sm:pl-3 py-2 sm:py-2.5 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight mb-1">
                          {notification.message || notification.title}
                        </h5>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-600 mb-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>
                              {notification.date ||
                                (notification.createdAt?.toDate
                                  ? notification.createdAt
                                      .toDate()
                                      .toLocaleDateString()
                                  : "Recent")}
                            </span>
                          </div>
                          {notification.downloadUrl && (
                            <a
                              href={notification.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-violet-600 hover:text-violet-800 flex items-center gap-1 bg-violet-50 px-1.5 py-0.5 rounded transition-all duration-300 hover:bg-violet-100"
                            >
                              <Download className="w-2.5 h-2.5" />
                              <span className="font-medium">Download</span>
                            </a>
                          )}
                          {notification.isNew && (
                            <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-1.5 py-0.5 text-xs rounded-full font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        {notification.priority && (
                          <div className="mt-1">
                            <span
                              className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                                notification.priority === "high"
                                  ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"
                                  : notification.priority === "medium"
                                  ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300"
                                  : "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300"
                              }`}
                            >
                              {notification.priority} priority
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #8b5cf6, #ec4899);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #7c3aed, #db2777);
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #8b5cf6 #f3f4f6;
          }

          @media (max-width: 640px) {
            .custom-scrollbar {
              -webkit-overflow-scrolling: touch;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-fade-in,
            .animate-pulse {
              animation: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MessageScroll;
