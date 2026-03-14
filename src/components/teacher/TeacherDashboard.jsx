import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { 
  Users, 
  FileText, 
  Clock, 
  Calendar,
  UserCheck,
  Bell,
  Camera
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherDashboard() {
  const { userData, currentUser } = useAuth();
  const [stats, setStats] = useState({
    myStudents: 0,
    attendanceToday: 0,
    homeworkSent: 0,
    leavesPending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData && currentUser) {
      fetchTeacherStats();
    }
  }, [userData, currentUser]);

  const fetchTeacherStats = async () => {
    try {
      const assignedClass = userData?.assignedClass || userData?.class;
      
      // 1. Fetch Students in Teacher's assigned class
      let myStudents = 0;
      if (assignedClass) {
        const studentsQuery = query(
          collection(db, 'students'), 
          where('class', '==', assignedClass)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        myStudents = studentsSnapshot.size;
      }

      // 2. Fetch Attendance Count for Today
      // Counts documents in 'attendance' where date is today, class matches, and status is present
      const todayStr = new Date().toISOString().split('T')[0];
      let attendanceToday = 0;
      
      if (assignedClass) {
        try {
          const attendanceQuery = query(
            collection(db, 'attendance'),
            where('class', '==', assignedClass),
            where('date', '==', todayStr),
            where('status', '==', 'Present')
          );
          const attSnapshot = await getDocs(attendanceQuery);
          attendanceToday = attSnapshot.size;
        } catch (err) {
          console.log("Attendance collection might be empty or structured differently", err);
        }
      }

      // 3. Fetch Homework uploaded by this teacher
      const homeworkQuery = query(
        collection(db, 'homework'), 
        where('teacherId', '==', currentUser.uid)
      );
      const homeworkSnapshot = await getDocs(homeworkQuery);
      const homeworkSent = homeworkSnapshot.size;

      // 4. Fetch Pending Leave Requests
      // Counts leaves where status is 'pending_teacher'
      const leavesQuery = query(
        collection(db, 'leaves'), 
        where('status', '==', 'pending_teacher')
      );
      const leavesSnapshot = await getDocs(leavesQuery);
      // Optional: Filter client-side if you want only leaves from the teacher's specific class
      const leavesPending = leavesSnapshot.size;

      setStats({
        myStudents,
        attendanceToday,
        homeworkSent,
        leavesPending
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'My Class Students',
      value: stats.myStudents,
      icon: Users,
      cardBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
      subText: userData?.assignedClass || userData?.class ? `Class ${userData.assignedClass || userData.class}` : 'No Class Assigned'
    },
    {
      title: 'Present Today',
      value: stats.attendanceToday,
      icon: UserCheck,
      cardBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-white',
      subText: `${stats.myStudents > 0 ? ((stats.attendanceToday / stats.myStudents) * 100).toFixed(0) : 0}% Attendance`
    },
    {
      title: 'Homework Sent',
      value: stats.homeworkSent,
      icon: FileText,
      cardBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
      subText: 'Total Uploads'
    },
    {
      title: 'Leave Requests',
      value: stats.leavesPending,
      icon: Clock,
      cardBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      textColor: 'text-white',
      subText: 'Pending Review'
    }
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-4">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 h-32 shadow-sm"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {userData?.name || 'Teacher'}
          </h1>
          <p className="text-gray-600">
            Here's an overview of your class activity today.
          </p>
        </div>
        <div className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.cardBg} rounded-xl shadow-lg p-6 text-white transform transition-all hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                <p className="text-sm opacity-75 mt-1">{card.subText}</p>
              </div>
              <div className="p-3 rounded-xl bg-white bg-opacity-20">
                <card.icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-indigo-600" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/teacher/attendance" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 group">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="font-semibold text-blue-900 block">Mark Attendance</span>
                <span className="text-xs text-blue-600">Update today's class register</span>
              </div>
            </Link>

            <Link to="/teacher/homework" className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100 group">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <span className="font-semibold text-purple-900 block">Upload Homework</span>
                <span className="text-xs text-purple-600">Send assignments to students</span>
              </div>
            </Link>

            <Link to="/teacher/gallery" className="flex items-center p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 group">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <Camera className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <span className="font-semibold text-rose-900 block">Upload Photos</span>
                <span className="text-xs text-rose-600">Add to college gallery</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Timetable / Schedule Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-600" />
              Today's Schedule
            </h2>
            <Link to="/teacher/timetable" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View Full Timetable
            </Link>
          </div>

          <div className="space-y-4">
            {/* Note: This is still mock data for the preview list as real timetable parsing is complex for a preview widget. 
                Ideally, this should query the 'timetables' collection for today's day. */}
            {[
              { time: "09:00 AM", subject: "Period 1", class: userData?.assignedClass || "N/A", status: "Active" },
              { time: "10:00 AM", subject: "Period 2", class: userData?.assignedClass || "N/A", status: "Upcoming" },
              { time: "11:00 AM", subject: "Period 3", class: userData?.assignedClass || "N/A", status: "Upcoming" },
            ].map((slot, index) => (
              <div key={index} className="flex items-center p-4 border rounded-xl hover:border-indigo-200 transition-colors bg-gray-50 hover:bg-white">
                <div className="w-24 flex-shrink-0 text-center border-r pr-4 mr-4">
                  <span className="block font-bold text-gray-800">{slot.time}</span>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${index === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {slot.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900">{slot.subject}</h3>
                  <p className="text-sm text-gray-600">{slot.class}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}