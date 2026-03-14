import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
// import logo from "../../image/mom-College.png";

// ChevronDown component for the dropdown arrow
const ChevronDown = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
  </svg>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isAcademicDropdownOpen, setIsAcademicDropdownOpen] = useState(false);
  const [isMobileAcademicOpen, setIsMobileAcademicOpen] = useState(false);
  const [screenSize, setScreenSize] = useState("lg");
  const { currentUser, logout, userRole } = useAuth(); // Assuming userRole is available from AuthContext
  const location = useLocation();

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) setScreenSize("xs");
      else if (width < 640) setScreenSize("sm");
      else if (width < 768) setScreenSize("md");
      else if (width < 1024) setScreenSize("lg");
      else if (width < 1280) setScreenSize("xl");
      else setScreenSize("2xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    if (screenSize !== "xs" && screenSize !== "sm") {
      setIsMenuOpen(false);
    }
  }, [screenSize]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Academic", path: null },
    { name: "Gallery", path: "/gallery" },
    { name: "Staff", path: "/staff" },
    { name: "HelpDesk", path: "/contact" },
  ];

  const dropdownItems = [
    { name: "Admission", path: "/admission" },
    { name: "Result", path: "/result" },
    { name: "Syllabus", path: "/syllabus" },
    { name: "College Timing", path: "/schooltiming" },
    { name: "Book List", path: "/booklist" },
    { name: "Uniform", path: "/uniform" },
  ];

  const isActivePath = (path) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isAcademicActive = () => {
    return dropdownItems.some((item) => location.pathname === item.path);
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  const mobileDropdownVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, delay: 0.1 },
      },
    },
  };

  const AdminIcon = ({ isOpen = false }) => (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1.5"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </motion.svg>
  );

  const GlassBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200/50 to-transparent"></div>
    </div>
  );

  // Dynamic header height based on screen size
  const getHeaderHeight = () => {
    switch (screenSize) {
      case "xs":
        return "h-14";
      case "sm":
        return "h-16";
      default:
        return "h-16 lg:h-18";
    }
  };

  // Dynamic logo size
  const getLogoSize = () => {
    switch (screenSize) {
      case "xs":
        return "h-8";
      case "sm":
        return "h-9";
      case "md":
        return "h-10";
      default:
        return "h-10 sm:h-12";
    }
  };

  // Dynamic text size for college name
  const getSchoolNameSize = () => {
    switch (screenSize) {
      case "xs":
        return "text-xs";
      case "sm":
        return "text-sm";
      case "md":
        return "text-base";
      case "lg":
        return "text-lg";
      default:
        return "text-lg xl:text-xl";
    }
  };

  // Determine if user is admin or student
  const isAdmin = userRole === "admin";
  const isStudent = userRole === "student";

  return (
    <header className="glass sticky top-0 z-50 relative">
      <GlassBackground />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div
          className={`flex justify-between items-center ${getHeaderHeight()}`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 min-w-0">
            <motion.div
              className="flex items-center min-w-0"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative flex-shrink-0">
                {/* <img
                  src={logo}
                  alt="Gandhi Academy of technology and engineering(GATE)"
                  className={`${getLogoSize()} object-contain`}
                /> */}
              </div>

              {/* College name - responsive visibility */}
              <div
                className={`${
                  screenSize === "xs" ? "hidden" : "block"
                } relative ml-2 sm:ml-3 text-center sm:text-left min-w-0`}
              >
                <motion.h1
                  className={`font-bold ${getSchoolNameSize()} tracking-tight truncate font-sans`}
                >
                  <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                    {screenSize === "sm"
                      ? "Gandhi Academy of technology and engineering(GATE)"
                      : "Gandhi Academy of technology and engineering(GATE)"}
                  </span>
                </motion.h1>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation - hidden on tablet and mobile */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.name === "Academic" ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsAcademicDropdownOpen(true)}
                    onMouseLeave={() => setIsAcademicDropdownOpen(false)}
                  >
                    <div
                      className={`flex items-center px-2 xl:px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer relative ${
                        isAcademicActive()
                          ? "text-brand-600"
                          : "text-gray-700 hover:text-brand-600"
                      }`}
                    >
                      <span className="whitespace-nowrap">{item.name}</span>
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          isAcademicDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                      {isAcademicActive() && (
                        <span className="absolute bottom-0 left-2 xl:left-3 right-2 xl:right-3 h-[3px] rounded-t-lg bg-brand-600"></span>
                      )}
                    </div>

                    {/* Academic Dropdown Menu */}
                    <AnimatePresence>
                      {isAcademicDropdownOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={menuVariants}
                          className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden"
                        >
                          <div className="py-1">
                            {dropdownItems.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.name}
                                to={dropdownItem.path}
                                className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                  isActivePath(dropdownItem.path)
                                    ? "bg-brand-50 text-brand-600 border-r-2 border-brand-600"
                                    : "text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                                }`}
                                onClick={() => setIsAcademicDropdownOpen(false)}
                              >
                                {dropdownItem.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`block px-2 xl:px-3 py-2 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${
                      isActivePath(item.path)
                        ? "text-brand-600"
                        : "text-gray-700 hover:text-brand-600"
                    }`}
                  >
                    {item.name}
                    {isActivePath(item.path) && (
                      <span className="absolute bottom-0 left-2 xl:left-3 right-2 xl:right-3 h-[3px] rounded-t-lg bg-brand-600"></span>
                    )}
                  </Link>
                )}
              </div>
            ))}

            {/* User Section */}
            {currentUser ? (
              <div className="relative ml-2 xl:ml-4">
                <motion.button
                  className="px-3 xl:px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-all"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                >
                  <span className="relative z-10 flex items-center text-gray-800">
                    <span className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center mr-2 text-brand-600">
                      👤
                    </span>
                    <span className="hidden xl:inline">
                      {isAdmin ? "Admin" : "Student"}
                    </span>
                    <AdminIcon isOpen={isAdminDropdownOpen} />
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isAdminDropdownOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={menuVariants}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      onMouseLeave={() => setIsAdminDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500">Logged in as</p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {currentUser.email}
                        </p>
                        <p className="text-xs text-brand-600 mt-1">
                          {isAdmin ? "Administrator" : "Student"}
                        </p>
                      </div>

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            className="block px-4 py-3 text-gray-700 hover:bg-brand-50 transition-all flex items-center text-sm border-b border-gray-100"
                            onClick={() => setIsAdminDropdownOpen(false)}
                          >
                            <span className="w-5 mr-3 text-brand-500">📊</span>
                            Admin Panel
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsAdminDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-all flex items-center text-sm"
                      >
                        <span className="w-5 mr-3">🔓</span>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                className="ml-2 xl:ml-4 relative"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/login"
                  className="btn-primary"
                >
                  <span className="mr-2">🔑</span>
                  <span className="hidden xl:inline">Login</span>
                  <span className="xl:hidden">Login</span>
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Mobile/Tablet menu button - shown on lg and smaller */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md relative group touch-manipulation"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-between items-center relative">
                <motion.span
                  className="h-[2px] w-full bg-gray-600 rounded-full origin-center"
                  animate={{
                    y: isMenuOpen ? 8 : 0,
                    rotate: isMenuOpen ? 45 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="h-[2px] bg-gray-600 rounded-full"
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                    width: isMenuOpen ? "0%" : "80%",
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="h-[2px] w-full bg-gray-600 rounded-full origin-center"
                  animate={{
                    y: isMenuOpen ? -8 : 0,
                    rotate: isMenuOpen ? -45 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div
                className={`px-2 py-3 space-y-1 bg-white/95 backdrop-blur-lg border-t border-gray-200/30 rounded-b-lg shadow-lg ${
                  screenSize === "xs" ? "max-h-[70vh] overflow-y-auto" : ""
                }`}
              >
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.2,
                    }}
                  >
                    {item.name === "Academic" ? (
                      <div>
                        <button
                          onClick={() =>
                            setIsMobileAcademicOpen(!isMobileAcademicOpen)
                          }
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition-all text-sm font-medium touch-manipulation ${
                            isAcademicActive()
                              ? "bg-brand-50 text-brand-600"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isMobileAcademicOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isMobileAcademicOpen && (
                            <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileDropdownVariants}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 mt-2 space-y-1 border-l-2 border-blue-100 ml-4">
                                {dropdownItems.map((dropdownItem) => (
                                  <Link
                                    key={dropdownItem.name}
                                    to={dropdownItem.path}
                                    className={`block px-4 py-2.5 rounded-md transition-all text-sm touch-manipulation ${
                                      location.pathname === dropdownItem.path
                                        ? "bg-brand-50 text-brand-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                                    }`}
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setIsMobileAcademicOpen(false);
                                    }}
                                  >
                                    {dropdownItem.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`block px-4 py-2.5 rounded-md transition-all text-sm font-medium touch-manipulation ${
                          location.pathname === item.path
                            ? "bg-brand-50 text-brand-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Mobile User Section */}
                {currentUser ? (
                  <div className="pt-2 mt-2 border-t border-gray-200/30">
                    <div className="px-4 py-2.5 text-xs text-gray-500 font-medium">
                      {isAdmin ? "Admin Panel" : "Student Account"}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2.5 rounded-md text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-all text-sm flex items-center touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="w-5 mr-3 text-brand-500">📊</span>
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 rounded-md text-red-600 hover:bg-red-50 transition-all text-sm flex items-center touch-manipulation"
                    >
                      <span className="w-5 mr-3">🔓</span>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 mt-2 border-t border-gray-200/30">
                    <Link
                      to="/login"
                      className="btn-primary flex justify-center w-full block text-center touch-manipulation"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Login
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
