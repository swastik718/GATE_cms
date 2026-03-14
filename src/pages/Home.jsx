import HeroBanner from "../components/home/HeroBanner";
import NotificationBar from "../components/home/NotificationBar";
import MessageScroll from "../components/home/MessageScroll";
import { Link } from "react-router-dom";
import principalImg from "../image/Principal.jpg";
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  Clock,
  Bell,
  CalendarDays,
  FileText,
  CheckCircle,
  GraduationCap,
  // Globe, // Not used
  // Activity, // Not used
  // Smile, // Not used
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
// import SchoolNavigation from "./SchoolNavigation"; // Not used

// Premium Animation variants with custom easing
const premiumEasing = [0.22, 1, 0.36, 1]; // Apple-like smooth spring ease

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      ease: premiumEasing,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: premiumEasing }
  },
};

export default function Home() {
  // const features = [ ... ] // Not used
  // const quickLinks = [ ... ] // Not used
  // const academicResources = [ ... ] // Not used

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Hero Banner */}
      {/* <HeroBanner /> */}

      {/* Message Scroll */}
      <MessageScroll />

      {/* Notification Bar - Desktop: order 1, Mobile: order 2 */}
      <div className="order-2 lg:order-1 bg-white border-b border-zinc-200/60 z-50 sticky top-0 backdrop-blur-md bg-white/80">
        <NotificationBar />
      </div>

      {/* Welcome Section - Desktop: order 2, Mobile: order 1 */}
      <section className="py-20 sm:py-32 lg:py-40 px-4 lg:px-8 bg-zinc-950 relative overflow-hidden order-1 lg:order-2 flex items-center justify-center min-h-[70vh]">
        {/* Premium Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-zinc-500/10 to-transparent blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: premiumEasing }}
            viewport={{ once: true }}
            className="text-center max-w-5xl mx-auto flex flex-col items-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: premiumEasing }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-zinc-300 text-xs sm:text-sm font-medium tracking-wide uppercase letter-spacing">Excellence in Education</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 tracking-tighter leading-[1.1]">
              Welcome to <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 block mt-2 pb-2">
                Gandhi Academy of technology and engineering(GATE)
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Where traditional values meet innovative education to shape
              tomorrow's leaders through a transformative learning experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Academic Session Section - Desktop: order 3, Mobile: order 3 */}
      <section className="relative pb-24 lg:pb-32 bg-[#fafafa] order-3 z-20 -mt-8 sm:-mt-16 lg:-mt-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Resources Grid - First Row (3 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Time Table */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: premiumEasing }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full"
            >
              <div className="flex items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mr-5 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 text-zinc-600 transition-all duration-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">
                    Time Table
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">
                    View class schedules and academic timings
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-zinc-100">
                <Link
                  to="/timetable"
                  className="inline-flex items-center text-zinc-900 font-medium text-sm tracking-wide group-hover:text-zinc-600 transition-colors duration-300"
                >
                  <span className="border-b border-transparent group-hover:border-zinc-900 transition-all">View Schedule</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            {/* Notices */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: premiumEasing }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full"
            >
              <div className="flex items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mr-5 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 text-zinc-600 transition-all duration-500">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">
                    Notices
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">
                    Important announcements and updates
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-zinc-100">
                <Link
                  to="/notices"
                  className="inline-flex items-center text-zinc-900 font-medium text-sm tracking-wide group-hover:text-zinc-600 transition-colors duration-300"
                >
                  <span className="border-b border-transparent group-hover:border-zinc-900 transition-all">View Notices</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: premiumEasing }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full md:col-span-2 lg:col-span-1"
            >
              <div className="flex items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mr-5 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 text-zinc-600 transition-all duration-500">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">
                    Calendar
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">
                    Academic events and holidays
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-zinc-100">
                <Link
                  to="/calendar"
                  className="inline-flex items-center text-zinc-900 font-medium text-sm tracking-wide group-hover:text-zinc-600 transition-colors duration-300"
                >
                  <span className="border-b border-transparent group-hover:border-zinc-900 transition-all">View Calendar</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Resources Grid - Second Row (2 centered cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: premiumEasing }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full"
            >
              <div className="flex items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mr-5 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 text-zinc-600 transition-all duration-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">
                    Solutions
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">
                    Study materials and resources
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-zinc-100">
                <Link
                  to="/resources"
                  className="inline-flex items-center text-zinc-900 font-medium text-sm tracking-wide group-hover:text-zinc-600 transition-colors duration-300"
                >
                  <span className="border-b border-transparent group-hover:border-zinc-900 transition-all">Access Resources</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            {/* TC Verify / Result */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: premiumEasing }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full"
            >
              <div className="flex items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mr-5 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 text-zinc-600 transition-all duration-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">
                    Result
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">
                    View Result
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-6 border-t border-zinc-100">
                <Link
                  to="/tc-verify"
                  className="inline-flex items-center text-zinc-900 font-medium text-sm tracking-wide group-hover:text-zinc-600 transition-colors duration-300"
                >
                  <span className="border-b border-transparent group-hover:border-zinc-900 transition-all">View Result</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Principal's Message Section - Desktop: order 4, Mobile: order 4 */}
      <section className="py-24 lg:py-32 bg-white order-4 border-y border-zinc-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            {/* Principal's Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: premiumEasing }}
              viewport={{ once: true }}
              className="w-full lg:w-5/12 flex justify-center lg:justify-start"
            >
              <div className="relative w-full max-w-md group">
                <div className="absolute inset-0 bg-zinc-100 rounded-3xl translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white aspect-[4/5] z-10">
                  <img
                    src={principalImg}
                    alt="Principal Miss. Pratima Kumari Patra"
                    className="w-full h-full object-cover object-top filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 inset-x-0 p-8">
                    <h4 className="text-2xl font-semibold text-white tracking-tight mb-1">
                      Mr. John Doe
                    </h4>
                    <p className="text-zinc-300 font-light text-sm uppercase tracking-widest">Principal</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Message Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: premiumEasing, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full lg:w-7/12"
            >
              <div className="mb-12">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 tracking-tighter leading-tight">
                  Message from the <br/><span className="text-zinc-400">Principal</span>
                </h2>
              </div>

              <div className="prose prose-lg prose-zinc max-w-none">
                <blockquote className="text-2xl sm:text-3xl font-light text-zinc-900 leading-tight mb-10 relative">
                  <span className="absolute -left-8 -top-6 text-6xl text-zinc-200 font-serif leading-none">"</span>
                  It is my privilege to serve as the principal of our vibrant
                  and dedicated learning community. At our Gandhi Academy of technology and engineering(GATE),
                  we believe that education is not just about
                  academic achievement—it is about inspiring curiosity,
                  building character, and preparing our students to thrive in
                  an ever-changing world.
                </blockquote>
                <p className="mb-6 font-light text-zinc-600 leading-relaxed text-lg">
                  Our talented staff works tirelessly to create an environment
                  where every child feels valued, challenged, and supported.
                  We encourage our students to dream big, work hard, and
                  develop a lifelong love of learning. We also recognize the
                  importance of strong partnerships between college, home, and
                  community. Together, we can ensure that each student
                  receives the guidance, opportunities, and encouragement they
                  need to reach their fullest potential.
                </p>
                <p className="mb-12 font-light text-zinc-600 leading-relaxed text-lg">
                  Thank you for visiting our website and taking the time to
                  learn more about our college. We are proud of our students,
                  our staff, and our shared commitment to excellence.
                </p>
              </div>

              <div className="flex items-center pt-8 border-t border-zinc-100">
                <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-white text-lg font-medium mr-5">
                  JD
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 text-lg tracking-tight">
                    Mr. John Doe
                  </h4>
                  <p className="text-zinc-500 font-light text-sm">
                    Principal, Gandhi Academy of technology and engineering(GATE)
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Desktop: order 5, Mobile: order 5 */}
      <section className="py-24 lg:py-32 bg-zinc-950 relative order-5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: premiumEasing }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tighter">
              Our Achievements
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light tracking-wide">
              Celebrating excellence in education through numbers that tell our
              story
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16"
          >
            {[
              { number: "500+", label: "Students Enrolled", icon: GraduationCap },
              { number: "50+", label: "Expert Faculty", icon: Users },
              { number: "15+", label: "Years of Excellence", icon: Calendar },
              { number: "95%", label: "Success Rate", icon: Award },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={item}
                className="text-center flex flex-col items-center group"
              >
                <div className="mb-6 text-zinc-500 group-hover:text-white transition-colors duration-500">
                  <stat.icon strokeWidth={1.5} className="w-10 h-10" />
                </div>
                <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tighter">
                  {stat.number}
                </div>
                <div className="text-zinc-400 font-light tracking-widest uppercase text-xs sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section - Desktop: order 6, Mobile: order 6 */}
      <section className="py-24 lg:py-32 bg-[#fafafa] relative order-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: premiumEasing }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 tracking-tighter">
                What Parents Say
              </h2>
              <p className="text-xl text-zinc-500 font-light leading-relaxed">
                Hear from our community about their experiences
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                quote:
                  "Gandhi Academy of technology and engineering(GATE) has transformed my child's learning experience. The teachers are exceptional!",
                author: "Mr. Prakash Rout",
                role: "Parent of 3rd Grader",
              },
              {
                quote:
                  "The holistic approach to education here is exactly what we were looking for.",
                author: "Swarnalata Panda",
                role: "Parent of 5th Grader",
              },
              {
                quote:
                  "My daughter loves going to college every day. That says it all!",
                author: "Sunita Sahu",
                role: "Parent of 2nd Grader",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-white p-10 rounded-[2rem] border border-zinc-200/60 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="text-zinc-300 mb-8">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-zinc-700 text-lg leading-relaxed mb-10 font-light">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center pt-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-medium mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 tracking-tight">
                      {testimonial.author}
                    </h4>
                    <p className="text-sm text-zinc-500 font-light">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Desktop: order 7, Mobile: order 7 */}
      <section className="py-32 bg-zinc-950 relative order-7 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: premiumEasing }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tighter leading-tight">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-zinc-400 mb-12 font-light tracking-wide max-w-2xl mx-auto">
              Discover how we can help your child reach their full potential in
              a nurturing environment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white text-zinc-950 px-8 py-4 rounded-full font-medium text-lg hover:bg-zinc-100 transition-colors duration-300"
              >
                Schedule a Tour
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-transparent border border-zinc-700 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-zinc-900 hover:border-zinc-600 transition-all duration-300"
              >
                Contact Admissions
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}