import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SchoolNavigation = () => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const buttons = [
    {
      id: "results",
      title: "Results",
      subtitle: "View Exam Results",
      icon: "🏆",
      href: "/results",
      gradient: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
      color: "#ff6b6b",
    },
    {
      id: "syllabus",
      title: "Syllabus",
      subtitle: "Course Curriculum",
      icon: "📚",
      href: "/syllabus",
      gradient: "linear-gradient(135deg, #4ecdc4, #26d0ce)",
      color: "#4ecdc4",
    },
    {
      id: "student-login",
      title: "Student Login",
      subtitle: "Access Portal",
      icon: "👤",
      href: "/student-login",
      gradient: "linear-gradient(135deg, #a55eea, #8e44ad)",
      color: "#a55eea",
    },
    {
      id: "holiday",
      title: "Holiday Calendar",
      subtitle: "Academic Schedule",
      icon: "📅",
      href: "/holiday-calendar",
      gradient: "linear-gradient(135deg, #feca57, #ff9ff3)",
      color: "#feca57",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.98,
      y: -4,
    },
  };

  const iconVariants = {
    hover: {
      rotate: [0, -10, 10, -10, 0],
      scale: [1, 1.2, 1.1, 1.2, 1],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  };

  const backgroundVariants = {
    animate: {
      background: [
        "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)",
        "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
        "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)",
      ],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.section
      className="relative overflow-hidden py-16 px-5"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)",
      }}
      variants={backgroundVariants}
      animate="animate"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-gray-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="flex flex-wrap justify-center items-center gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          {buttons.map((button, index) => (
            <motion.a
              key={button.id}
              href={button.href}
              className="relative bg-white bg-opacity-98 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-gray-800 font-semibold text-base no-underline flex flex-col items-center gap-3 min-w-[200px] overflow-hidden group cursor-pointer"
              style={{
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setHoveredButton(button.id)}
              onHoverEnd={() => setHoveredButton(null)}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                }}
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
              />

              {/* Hover Glow Effect */}
              <AnimatePresence>
                {hoveredButton === button.id && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-20"
                    style={{
                      background: button.gradient,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.2, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white mb-1 relative z-10"
                style={{ background: button.gradient }}
                variants={iconVariants}
                whileHover="hover"
              >
                {button.icon}
              </motion.div>

              {/* Text Content */}
              <div className="text-center relative z-10">
                <motion.div
                  className="text-base font-semibold leading-tight"
                  animate={
                    hoveredButton === button.id
                      ? { color: button.color }
                      : { color: "#2d3748" }
                  }
                  transition={{ duration: 0.2 }}
                >
                  {button.title}
                </motion.div>
                <motion.div
                  className="text-xs text-slate-500 font-normal mt-1"
                  animate={hoveredButton === button.id ? { y: 2 } : { y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {button.subtitle}
                </motion.div>
              </div>

              {/* Ripple Effect on Click */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ background: button.gradient }}
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1, opacity: 0.3 }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          ))}
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          className="flex justify-center mt-8 space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {buttons.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-gray-400 bg-opacity-60 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.5,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .flex {
            flex-direction: column;
          }

          .min-w-[200px] {
            min-width: 280px;
            flex-direction: row;
            text-align: left;
            padding: 20px 24px;
          }

          .w-12.h-12 {
            width: 40px;
            height: 40px;
            margin-right: 16px;
            margin-bottom: 0;
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .min-w-[200px] {
            min-width: 100%;
          }
        }
      `}</style>
    </motion.section>
  );
};

export default SchoolNavigation;
