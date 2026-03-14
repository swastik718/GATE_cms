import { Users, Award, BookOpen, Heart, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import aboutus1 from "../image/aboutus1.jpeg";
import aboutus2 from "../image/aboutus2.jpg";

export default function About() {
  const values = [
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description:
        "We strive for the highest standards in education, ensuring our students are well-prepared for future challenges.",
    },
    {
      icon: Heart,
      title: "Character Building",
      description:
        "We focus on developing strong moral values, integrity, and empathy in our students.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "We foster a supportive community where everyone feels valued, respected, and included.",
    },
    {
      icon: Award,
      title: "Innovation",
      description:
        "We embrace modern teaching methods and technology to enhance the learning experience.",
    },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Modern Glass Morphism Effect */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 mb-6 border border-white/20">
            <span className="text-sm font-medium">About Our Institution</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-100">
            Gandhi Academy of technology and engineering(GATE) 
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto font-light">
            Empowering minds, shaping futures, and building tomorrow's leaders
            through innovative education.
          </p>
          <div className="mt-10">
            <button className="px-8 py-3.5 bg-white text-indigo-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center mx-auto group">
              Explore Our Programs
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Mission Section - Modern Card Layout */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full mb-4">
                Our Vision
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-2 leading-snug">
                Shaping the{" "}
                <span className="relative">
                  <span className="relative z-10">Future</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-indigo-100/80 z-0"></span>
                </span>{" "}
                Through Education
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At Gandhi Academy of technology and engineering(GATE) , we are dedicated to providing
                exceptional education that nurtures the whole child. Our mission
                is to create an environment where students can discover their
                passions, develop their talents, and grow into confident,
                responsible global citizens.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    Personalized learning experiences tailored to each student
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    Innovative teaching methods with cutting-edge technology
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    Supportive community fostering growth and development
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-indigo-200">
                  Learn More
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 flex items-center shadow-sm hover:shadow-md">
                  Watch Video <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src={aboutus1}
                  alt="Students learning"
                  className="w-full h-auto object-cover sm:aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 inline-block">
                    <h3 className="text-xl font-bold">
                      Our Students in Action
                    </h3>
                    <p className="text-sm opacity-90">
                      Interactive learning environment
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-yellow-400 rounded-2xl -z-10 opacity-70"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-400 rounded-full -z-10 opacity-70"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section - Modern Grid with Hover Effects */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full mb-4">
              Our Foundation
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 mt-2">
              Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide everything we do and shape the
              culture of our college community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-indigo-100 rounded-xl p-4 w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <value.icon className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section - Modern Timeline Approach */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white rotate-1">
                <img
                  src={aboutus2}
                  alt="College building"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Our Humble Beginnings</h3>
                  <p className="text-sm opacity-90">
                    Founded in 2010 with a vision for excellence
                  </p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-pink-100 rounded-full -z-10 opacity-70"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-100 rounded-full -z-10 opacity-70"></div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full mb-4">
                Our Journey
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-2">
                Our Story
              </h2>

              <div className="space-y-6 mb-8">
                <div className="relative pl-8 pb-8 border-l-2 border-indigo-200">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-indigo-600 -translate-x-1/2"></div>
                  <h4 className="text-lg font-bold text-gray-900">
                    2010 - Foundation
                  </h4>
                  <p className="text-gray-600">
                    The Pranab Educational Society was established as an
                    independent unit with an objective of imparting skill
                    development & stress free environment.
                  </p>
                </div>
                <div className="relative pl-8 pb-8 border-l-2 border-indigo-200">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-indigo-600 -translate-x-1/2"></div>
                  <h4 className="text-lg font-bold text-gray-900">
                    2012 - First Campus
                  </h4>
                  <p className="text-gray-600">
                    Established "Gandhi Academy of technology and engineering(GATE) " at GURUGRAM as a Co-Ed
                    college offering better education up to Standard VIII.
                  </p>
                </div>
                <div className="relative pl-8 border-l-2 border-indigo-200">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-indigo-600 -translate-x-1/2"></div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Present Day
                  </h4>
                  <p className="text-gray-600">
                    Now serving 500+ students with 50+ educators across multiple
                    programs, continuing our mission of excellence.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { number: "15+", label: "Years", color: "indigo" },
                  { number: "500+", label: "Students", color: "pink" },
                  { number: "50+", label: "Educators", color: "yellow" },
                  { number: "10+", label: "Programs", color: "green" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className={`text-center bg-${stat.color}-50 p-4 rounded-xl border border-${stat.color}-100 shadow-sm hover:shadow-md transition-all`}
                  >
                    <div
                      className={`text-3xl font-bold text-${stat.color}-600`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Gradient with Floating Elements */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8 text-white/90">
              Discover how Gandhi Academy of technology and engineering(GATE) can help your child reach
              their full potential.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-3.5 bg-white text-indigo-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-white/30">
                Apply Now
              </button>
              <button className="px-8 py-3.5 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                Schedule a Visit
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
