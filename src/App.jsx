import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Public Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import TimetableView from "./pages/TimetableView";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// --- ADMIN IMPORTS ---
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import StudentManagement from "./components/admin/StudentManagement";
import TeacherManagement from "./components/admin/TeacherManagement";
import DataEntryManagement from "./components/admin/DataEntryManagement"; 
import NotificationManagement from "./components/admin/NotificationManagement";
import PhotoGallery from "./components/admin/PhotoGallery";
import StudentFeeManager from "./components/admin/StudentFeeManager";
import PaymentReceipt from "./pages/PaymentReceipt"; // NEW IMPORT

// --- TEACHER IMPORTS ---
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import LeaveManagement from "./components/teacher/LeaveManagement"; // Added from previous steps

// --- DATA ENTRY IMPORTS ---
import DataEntryLayout from "./components/dataEntry/DataEntryLayout";

// --- SHARED / FEATURE PAGES ---
import Timetable from "./pages/Timetable";     
import HomeworkPage from "./pages/HomeworkPage"; 
import AttendancePage from "./pages/AttendancePage"; 
import FeeManagement from "./pages/FeeManagement"; 
import ResultsPage from "./pages/ResultsPage";   

// --- STUDENT IMPORTS ---
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./components/student/StudentDashboard";
import ReportCardView from "./pages/ReportCardView";
import StudentFeeView from "./components/student/StudentFeeView";
import StudentLeave from "./components/student/LeaveApplication"; // Added from previous steps
import AdminLeave from "./components/admin/LeaveApproval"; // Added from previous steps

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route
            path="/"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <About />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Contact />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/gallery"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Gallery />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/timetable"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <TimetableView />
                </main>
                <Footer />
              </div>
            }
          />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="teachers" element={<TeacherManagement />} />
              <Route path="data-entry-admins" element={<DataEntryManagement />} />
              <Route path="notifications" element={<NotificationManagement />} />
              <Route path="gallery" element={<PhotoGallery />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="homework" element={<HomeworkPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="leaves" element={<AdminLeave />} />
              <Route path="fees" element={<FeeManagement />} />
              <Route path="student-fees" element={<StudentFeeManager />} />
              <Route path="results" element={<ResultsPage />} />
              {/* NEW ROUTE FOR RECEIPT */}
              <Route path="payment-receipt" element={<PaymentReceipt />} />
            </Route>
          </Route>

          {/* ================= TEACHER ROUTES ================= */}
          <Route element={<ProtectedRoute requiredRole="teacher" />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="homework" element={<HomeworkPage />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="gallery" element={<PhotoGallery />} />
              <Route path="leaves" element={<LeaveManagement />} />
            </Route>
          </Route>

          {/* ================= DATA ENTRY ROUTES ================= */}
          <Route element={<ProtectedRoute requiredRole="data_entry" />}>
            <Route path="/data-entry" element={<DataEntryLayout />}>
              <Route index element={<Navigate to="results" replace />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="notices" element={<HomeworkPage />} /> 
              <Route path="gallery" element={<PhotoGallery />} />
            </Route>
          </Route>

          {/* ================= STUDENT ROUTES ================= */}
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="report-card" element={<ReportCardView />} />
              <Route path="fees" element={<StudentFeeView />} />
              <Route path="leaves" element={<StudentLeave />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;