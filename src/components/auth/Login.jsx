import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { 
  UserCircle, 
  Lock, 
  GraduationCap, 
  School, 
  Calendar,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function Login() {
  const [loginType, setLoginType] = useState("staff");
  const [loading, setLoading] = useState(false);
  const { login, studentLogin, currentUser, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    dob: "",
  });

  // --- FIX: AUTO-REDIRECT IF ALREADY LOGGED IN ---
  useEffect(() => {
    if (!authLoading && currentUser && userData?.role) {
      // User is already logged in, redirect them immediately
      const role = userData.role;
      switch (role) {
        case "admin": navigate("/admin", { replace: true }); break;
        case "teacher": navigate("/teacher", { replace: true }); break;
        case "data_entry": navigate("/data-entry/results", { replace: true }); break;
        case "student": navigate("/student", { replace: true }); break;
        default: navigate("/", { replace: true });
      }
    }
  }, [currentUser, userData, authLoading, navigate]);
  // ------------------------------------------------

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginType === "staff") {
        // STAFF LOGIN
        const { role } = await login(formData.email, formData.password);
        toast.success(`Welcome back!`);
        
        // Navigation is handled by the useEffect above or manually here
        switch (role) {
          case "admin": navigate("/admin"); break;
          case "teacher": navigate("/teacher"); break;
          case "data_entry": navigate("/data-entry/results"); break;
          default: navigate("/");
        }
      } else {
        // STUDENT LOGIN
        await studentLogin(formData.dob, formData.password);
        toast.success("Welcome, Student!");
        navigate("/student");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
           <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <School className="h-8 w-8 text-indigo-600" />
          </div> 
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your college portal</p>
        </div>

        <div className="bg-gray-100 p-1 rounded-xl flex">
          <button
            type="button"
            onClick={() => setLoginType("staff")}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
              loginType === "staff" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCircle className="w-4 h-4 mr-2" /> Staff & Admin
          </button>
          <button
            type="button"
            onClick={() => setLoginType("student")}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
              loginType === "student" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Student
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {loginType === "staff" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Sign In <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}