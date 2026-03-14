import React, { useState, useEffect } from "react";
import {
  CreditCardIcon,
  TableCellsIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  AcademicCapIcon as AcademicCapSolid,
  UserGroupIcon,
  CalendarIcon,
  CakeIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { format, isToday, isAfter, endOfDay } from "date-fns";

const StudentDashboard = () => {
  const { userData, currentUser } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeStatus, setFeeStatus] = useState({});
  const [results, setResults] = useState({});
  const [isBirthday, setIsBirthday] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (userData && currentUser) {
      const actualStudentData = {
        id: currentUser.uid,
        name: userData.name,
        rollNumber: userData.rollNumber || userData.rollNo || "N/A",
        class: userData.class || userData.studentClass || "N/A",
        section: userData.section || "N/A",
        email: userData.email,
        academicYear: userData.academicYear || "N/A",
        birthDate: userData.birthDate || null,
      };

      setStudentData(actualStudentData);

      // Check if today is the student's birthday and set up countdown
      if (actualStudentData.birthDate) {
        checkBirthday(actualStudentData.birthDate);
      }

      fetchStudentData(actualStudentData);
    }
  }, [userData, currentUser]);

  const checkBirthday = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();

    // Check if today is the birthday
    if (isToday(birthDate)) {
      setIsBirthday(true);

      // Calculate time remaining until end of day
      const endOfToday = endOfDay(today);
      const updateCountdown = () => {
        const now = new Date();
        const diff = endOfToday - now;

        if (diff <= 0) {
          setIsBirthday(false);
          clearInterval(interval);
          return;
        }

        // Calculate hours and minutes remaining
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeRemaining(`${hours}h ${minutes}m`);
      };

      // Initial update
      updateCountdown();

      // Update every minute
      const interval = setInterval(updateCountdown, 60000);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    } else {
      setIsBirthday(false);
    }
  };

  const fetchStudentData = async (student) => {
    try {
      const [feeSnapshot, resultsSnapshot] = await Promise.allSettled([
        getDocs(
          query(
            collection(db, "feePayments"),
            where("studentId", "==", student.id),
            orderBy("dueDate", "desc"),
            limit(1)
          )
        ),
        getDocs(
          query(
            collection(db, "students"),
            where("rollNo", "==", student.rollNumber),
            limit(1)
          )
        ),
      ]);

      if (feeSnapshot.status === "fulfilled" && !feeSnapshot.value.empty) {
        setFeeStatus(feeSnapshot.value.docs[0].data());
      }

      if (
        resultsSnapshot.status === "fulfilled" &&
        !resultsSnapshot.value.empty
      ) {
        setResults(resultsSnapshot.value.docs[0].data());
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Student Not Found
          </h2>
          <p className="text-gray-600">No student data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Birthday Banner - Show only if it's the student's birthday */}
      {isBirthday && (
        <div className="mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          {/* Confetti effect */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl opacity-70"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 5}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                {['🎉', '🎊', '🎁', '🎈', '🥳'][i % 5]}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                <CakeIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Happy Birthday, {studentData.name.split(' ')[0]}!</h2>
                <p className="opacity-90">Wishing you a wonderful day filled with joy and happiness!</p>
                <p className="text-sm opacity-80 mt-1">- From your college family</p>
              </div>
            </div>
            <div className="flex items-center bg-white bg-opacity-20 px-3 py-2 rounded-lg">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">{timeRemaining} left</span>
            </div>
          </div>

          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-10px) rotate(10deg); }
            }
          `}</style>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {studentData.name}!
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Roll No: {studentData.rollNumber}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Class: {studentData.class}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Section: {studentData.section}
          </span>
          {isBirthday && (
            <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <CakeIcon className="h-3 w-3 mr-1" />
              Birthday!
            </span>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fee Status</p>
              <p className="text-xl font-bold text-gray-900">
                {feeStatus.status === "paid" || feeStatus.paid
                  ? "Paid"
                  : "Pending"}
              </p>
              {feeStatus.dueDate && (
                <p className="text-xs text-gray-500">
                  Due:{" "}
                  {new Date(
                    feeStatus.dueDate.seconds * 1000
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-lg">
              <TableCellsIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-xl font-bold text-gray-900">
                {results.percentage || "N/A"}{results.percentage ? "%" : ""}
              </p>
              <p className="text-xs text-gray-500">
                {results.percentage
                  ? `Based on ${results.subjects?.length || 0} subjects`
                  : "No results available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Access</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/timetable"
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-indigo-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <CalendarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Class Timetable
                    </h3>
                    <p className="text-sm text-gray-600">View your schedule</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </Link>

            <Link
              to="/student/fees"
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-green-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Fee Management
                    </h3>
                    <p className="text-sm text-gray-600">View and pay fees</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </Link>

            <Link
              to="/student/report-card"
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-purple-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <TableCellsIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Report Card</h3>
                    <p className="text-sm text-gray-600">
                      View academic results
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </Link>

            <Link
              to="/profile"
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-blue-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Student Profile
                    </h3>
                    <p className="text-sm text-gray-600">Update your details</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Student Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <AcademicCapSolid className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium text-gray-900">
                    {studentData.class}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Section</p>
                  <p className="font-medium text-gray-900">
                    {studentData.section}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium text-gray-900">
                    {studentData.academicYear}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {studentData.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Roll Number</p>
                <p className="font-medium text-gray-900">
                  {studentData.rollNumber}
                </p>
              </div>

              {studentData.birthDate && (
                <div>
                  <p className="text-sm text-gray-500">Birth Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(studentData.birthDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;