import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  Calendar,
  UserCheck,
  Bell,
  Heart,
  Clock,
  Cake
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, isAfter, endOfDay } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalFees: 0,
    birthdaysToday: 0
  });

  const [loading, setLoading] = useState(true);
  const [birthdayStudents, setBirthdayStudents] = useState([]);
  const [showBirthdaySection, setShowBirthdaySection] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Check if we should show birthday section (only for 24 hours)
    const checkBirthdayVisibility = () => {
      const now = new Date();
      const endOfToday = endOfDay(now);
      setShowBirthdaySection(isAfter(endOfToday, now));
    };
    
    checkBirthdayVisibility();
    const interval = setInterval(checkBirthdayVisibility, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const totalStudents = studentsSnapshot.size;

      // 2. Calculate Birthdays
      const today = format(new Date(), 'MM-dd');
      const todaysBirthdays = [];
      studentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.birthDate) {
          const birthDate = new Date(data.birthDate);
          const birthMonthDay = format(birthDate, 'MM-dd');
          
          if (birthMonthDay === today) {
            todaysBirthdays.push({
              id: doc.id,
              name: data.name,
              class: data.class,
              section: data.section,
              photo: data.photo || 'https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=100'
            });
          }
        }
      });

      // 3. Fetch Teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      const totalTeachers = teachersSnapshot.size;

      // 4. Calculate Total Fees Collected (Real Data)
      let totalFees = 0;
      try {
        const paymentsSnapshot = await getDocs(collection(db, 'feePayments'));
        paymentsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'paid' && data.amount) {
            totalFees += Number(data.amount);
          }
        });
      } catch (err) {
        console.error("Error fetching fees:", err);
      }

      setStats({
        totalStudents,
        totalTeachers,
        totalFees,
        birthdaysToday: todaysBirthdays.length
      });

      setBirthdayStudents(todaysBirthdays);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      cardBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
      change: 'Active',
      changeColor: 'text-blue-200'
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers,
      icon: GraduationCap,
      cardBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-white',
      change: 'Staff',
      changeColor: 'text-emerald-200'
    },
    {
      title: 'Total Fees Collected',
      value: `₹${stats.totalFees.toLocaleString('en-IN')}`,
      icon: DollarSign,
      cardBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      textColor: 'text-white',
      change: 'Revenue',
      changeColor: 'text-amber-200'
    },
    {
      title: 'Birthdays Today',
      value: stats.birthdaysToday,
      icon: Calendar,
      cardBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
      change: stats.birthdaysToday > 0 ? '🎉' : '—',
      changeColor: 'text-purple-200'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 h-32 shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening at your college today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className={`${card.cardBg} rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                  <p className={`text-sm ${card.changeColor} mt-1`}>{card.change}</p>
                </div>
                <div className="p-3 rounded-xl bg-white bg-opacity-20">
                  <card.icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column layout for Quick Actions and Birthday Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
                <Link to="students" className="font-medium text-blue-600">Add Student</Link>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100">
                <GraduationCap className="h-6 w-6 text-emerald-600" />
                <Link to="teachers" className="font-medium text-emerald-600">Add Teacher</Link>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100">
                <UserCheck className="h-6 w-6 text-amber-600" />
                <Link to="attendance" className="font-medium text-amber-600">Mark Attendance</Link>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100">
                <Bell className="h-6 w-6 text-purple-600" />
                <Link to="homework" className="font-medium text-purple-600">Send Notice</Link>
              </button>
            </div>
          </div>

          {/* Birthday Section */}
          <div className="lg:col-span-2 space-y-8">
            {showBirthdaySection && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                    Today's Birthdays
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 mr-1" />
                    Until midnight
                  </div>
                </div>
                
                {birthdayStudents.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-5 text-white text-center mb-6">
                      <Cake className="h-10 w-10 mx-auto mb-2" />
                      <h3 className="text-xl font-bold mb-1">Happy Birthday!</h3>
                      <p className="text-lg">
                        Today we celebrate {birthdayStudents.length} student{birthdayStudents.length !== 1 ? 's' : ''} birthday!
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {birthdayStudents.map((student) => (
                        <div key={student.id} className="flex flex-col p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                          <div className="flex items-center space-x-3 mb-3">
                            <img
                              src={student.photo}
                              alt={student.name}
                              className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div className="flex-1">
                              <p className="text-lg font-bold text-gray-900">{student.name}</p>
                              <p className="text-sm font-medium text-gray-600">
                                Class {student.class} - Section {student.section}
                              </p>
                            </div>
                            <div className="bg-purple-100 p-2 rounded-full">
                              <span className="text-purple-600 text-sm">🎂</span>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-purple-700">Birthday Wish</span>
                              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                            </div>
                            <p className="text-sm text-gray-800 italic">
                              "Happy Birthday {student.name.split(' ')[0]}! May your day be filled with joy and laughter. Wishing you a wonderful year ahead!"
                            </p>
                            <div className="flex justify-end mt-2">
                              <span className="text-xs text-gray-500">- From College Family</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No birthdays today</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}