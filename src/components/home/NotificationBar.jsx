import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  X,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBar() {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const today = new Date();
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("isActive", "==", true),
      where("expiryDate", ">=", today),
      orderBy("priority", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationData);
      setCurrentIndex(0);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (notifications.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [notifications.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? notifications.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === notifications.length - 1 ? 0 : prev + 1
    );
  };

  const getIconAndColor = (type) => {
    switch (type) {
      case "warning":
        return {
          icon: AlertCircle,
          bgColor: "bg-yellow-500",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-600",
        };
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-500",
          textColor: "text-green-800",
          borderColor: "border-green-600",
        };
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-500",
          textColor: "text-red-800",
          borderColor: "border-red-600",
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-blue-500",
          textColor: "text-blue-800",
          borderColor: "border-blue-600",
        };
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentIndex];
  const {
    icon: Icon,
    bgColor,
    textColor,
    borderColor,
  } = getIconAndColor(currentNotification.type);

  return (
    <div
      className={`${bgColor} text-white py-2 px-4 relative overflow-hidden border-b ${borderColor}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Navigation arrows (only show if multiple notifications) */}
        {notifications.length > 1 && (
          <button
            onClick={handlePrev}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Previous notification"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Notification content with animation */}
        <div className="flex-1 mx-2 overflow-hidden relative h-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNotification.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center"
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentNotification.title}
                  </p>
                  {currentNotification.message && (
                    <p className="text-xs opacity-90 truncate">
                      {currentNotification.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators and close button */}
        <div className="flex items-center space-x-3">
          {notifications.length > 1 && (
            <div className="hidden sm:flex items-center space-x-1">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="p-1"
                  aria-label={`Go to notification ${index + 1}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Next arrow (only show if multiple notifications) */}
        {notifications.length > 1 && (
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Next notification"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}