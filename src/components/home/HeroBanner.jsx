import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import banner1 from "../../image/banner1.jpg";
import banner2 from "../../image/banner2.jpg";
import banner3 from "../../image/banner3.jpg";

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [birthdayStudents, setBirthdayStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultBanners = [
    {
      id: "banner1",
      title: "A College with Heart & Vision",
      subtitle: "Excellence in Education",
      image: banner1,
      type: "banner",
    },
    {
      id: "banner2",
      title: "Every Child a Star, Every Dream a Journey",
      subtitle: "Building Tomorrow's Leaders",
      image: banner2,
      type: "banner",
    },
    {
      id: "banner3",
      title: "Innovation in Learning",
      subtitle: "Know Meditation, Know Life. No meditation, No Life.",
      image: banner3,
      type: "banner",
    },
  ];

  useEffect(() => {
    fetchTodaysBirthdays();
  }, []);

  useEffect(() => {
    const allSlides = [...defaultBanners];

    // Create a separate slide for each birthday student
    if (birthdayStudents.length > 0) {
      birthdayStudents.forEach((student) => {
        allSlides.push({
          id: `birthday-${student.id}`,
          type: "birthday",
          student: student, // Single student instead of array
        });
      });
    }

    setSlides(allSlides);
    setLoading(false);
  }, [birthdayStudents]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const fetchTodaysBirthdays = async () => {
    try {
      const today = new Date();
      const todayMonth = today.getMonth() + 1; // Months are 0-indexed
      const todayDay = today.getDate();

      // Format to match Firestore (assuming birthDate is stored as "YYYY-MM-DD")
      const todayFormatted = `${today.getFullYear()}-${todayMonth
        .toString()
        .padStart(2, "0")}-${todayDay.toString().padStart(2, "0")}`;

      console.log("Looking for birthdays on:", todayFormatted);

      const studentsRef = collection(db, "students");
      const q = query(studentsRef);

      const querySnapshot = await getDocs(q);
      const students = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Student data:", data.name, data.birthDate);
        // Check if the birthDate matches today's date
        if (data.birthDate === todayFormatted) {
          students.push({ id: doc.id, ...data });
        }
      });

      console.log("Found birthday students:", students);
      setBirthdayStudents(students);
    } catch (error) {
      console.error("Error fetching birthdays:", error);
      setBirthdayStudents([]);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="h-96 bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading banner...</div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
      <style>
        {`
          @keyframes floatUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}
      </style>

      {/* Banner Slide */}
      {currentSlideData.type === "banner" && (
        <div className="relative w-full h-full">
          <img
            src={currentSlideData.image}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-24">
            <div className="text-center text-white max-w-3xl px-4 w-full">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="relative inline-block">
                  {currentSlideData.title.split(" ").map((word, i) => (
                    <span
                      key={i}
                      className="inline-block mr-2 relative group"
                      style={{
                        animation: `floatUp 0.8s ${i * 0.1}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-200 relative z-10">
                        {word}
                      </span>
                      <span className="absolute inset-0 bg-yellow-300 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300"></span>
                    </span>
                  ))}
                </span>
              </h1>
              <p className="text-lg md:text-xl mt-4">
                <span className="inline-block px-5 py-2 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm border-l-4 border-yellow-400 relative overflow-hidden group">
                  <span className="relative z-10">
                    {currentSlideData.subtitle}
                  </span>
                  <span className="absolute inset-y-0 left-0 w-1 bg-yellow-400 group-hover:w-full transition-all duration-500"></span>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Slide - Individual Student */}
      {currentSlideData.type === "birthday" && (
        <div className="relative w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4 w-full">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 relative inline-block">
                    <span className="relative z-10">Happy Birthday!</span>
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full"></span>
                  </span>
                </h1>
                <div className="flex justify-center space-x-4 mt-5">
                  {["🎂", "🎁", "🎈", "✨"].map((emoji, i) => (
                    <span
                      key={i}
                      className="text-2xl inline-block animate-bounce"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        textShadow: "0 0 8px rgba(255,255,255,0.5)",
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-500 border-2 border-white border-opacity-30 hover:border-opacity-50 relative overflow-hidden group w-full max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Student Photo */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-300 shadow-2xl relative z-10">
                    <img
                      src={
                        currentSlideData.student.photo ||
                        "https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=200"
                      }
                      alt={currentSlideData.student.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Student Name */}
                  <h2 className="text-2xl font-bold mb-2 relative z-10">
                    <span className="bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent relative inline-block">
                      {currentSlideData.student.name}
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </span>
                  </h2>

                  {/* Class Information */}
                  <p className="text-lg text-gray-200 mb-4 relative z-10">
                    <span className="inline-block px-3 py-1 bg-black/30 rounded-full border border-white/20">
                      Class {currentSlideData.student.class}
                    </span>
                  </p>

                  {/* Birthday Message */}
                  <p className="text-sm text-gray-200 italic relative z-10">
                    <span className="inline-block transform hover:skew-x-3 transition-transform duration-300">
                      "Wishing you a day filled with joy and laughter!"
                    </span>
                  </p>

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-300 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-pink-300 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                </div>
              </div>

              {/* Birthday Counter */}
              <p className="mt-6 text-base text-white">
                <span className="inline-block px-4 py-2 bg-black/40 rounded-full border border-white/20 hover:border-yellow-300 transition-all duration-300 relative overflow-hidden">
                  <span className="relative z-10">
                    {birthdayStudents.length}{" "}
                    {birthdayStudents.length === 1 ? "student" : "students"}{" "}
                    celebrating today!
                  </span>
                  <span className="absolute inset-0 bg-yellow-300 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all backdrop-blur-sm z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all backdrop-blur-sm z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-yellow-300 shadow-md animate-pulse"
                  : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
