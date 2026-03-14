import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ExternalLink,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-violet-600/10 via-rose-500/10 to-emerald-500/10 -translate-y-20 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-80 lg:h-80 rounded-full bg-gradient-to-tr from-cyan-600/10 via-violet-500/10 to-rose-500/10 translate-y-16 -translate-x-16"></div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-10 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* College Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-violet-600 to-rose-500 p-2 sm:p-2.5 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-white" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-400 via-rose-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
                Gandhi Academy of technology and engineering(GATE) 
              </span>
            </div>

            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
              Empowering education through innovative technology and dedicated
              teaching. Building bright futures for every student with
              excellence and care.
            </p>

            <div className="space-y-3 sm:space-y-4 text-gray-300">
              <a
                href="https://maps.google.com/?q=Laxmi+Bazar,Near+Satya+Narayan+Temple,Aska.pin:761110"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 hover:text-white transition-all duration-300 group bg-gray-800/30 p-3 rounded-xl hover:bg-gradient-to-r hover:from-violet-600/20 hover:to-rose-500/20 backdrop-blur-sm"
              >
                <div className="bg-gradient-to-br from-violet-500 to-rose-500 p-1.5 rounded-lg mt-0.5">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-medium group-hover:text-violet-300 transition-colors">
                    Our Location
                  </span>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Berhampur
                  </p>
                </div>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto mt-1" />
              </a>

              <div className="flex items-start space-x-3 hover:text-white transition-all duration-300 group bg-gray-800/30 p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-cyan-500/20 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-1.5 rounded-lg mt-0.5">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-medium group-hover:text-emerald-300 transition-colors">
                    Call Us
                  </span>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    (+91) 72057****6, 865****497
                  </p>
                </div>
              </div>

              <a
                href="mailto:Gandhi Academy of technology and engineering(GATE)@gmail.com"
                className="flex items-start space-x-3 hover:text-white transition-all duration-300 group bg-gray-800/30 p-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-orange-500/20 backdrop-blur-sm"
              >
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-1.5 rounded-lg mt-0.5">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-medium group-hover:text-amber-300 transition-colors">
                    Email Us
                  </span>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 break-all">
                    Gandhi Academy of technology and engineering(GATE)@gmail.com
                  </p>
                </div>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto mt-1" />
              </a>
            </div>

            {/* Social Media Links */}
            <div className="mt-6 sm:mt-8">
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-gray-200">
                Connect With Us
              </h4>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <a
                  href="https://wa.me/9198765432"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800/50 p-2.5 sm:p-3 rounded-xl hover:bg-gradient-to-br hover:from-green-600 hover:to-green-500 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                  <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://facebook.com/YourSchoolPage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800/50 p-2.5 sm:p-3 rounded-xl hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-500 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                  <FaFacebookF className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://instagram.com/YourSchoolPage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800/50 p-2.5 sm:p-3 rounded-xl hover:bg-gradient-to-br hover:from-pink-600 hover:to-purple-500 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                  <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://youtube.com/@YourSchoolChannel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800/50 p-2.5 sm:p-3 rounded-xl hover:bg-gradient-to-br hover:from-red-600 hover:to-red-500 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                  <FaYoutube className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 relative">
                <span className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">
                  Quick Links
                </span>
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full"></div>
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Admissions", href: "#" },
                  { name: "Photo Gallery", href: "/gallery" },
                  { name: "Academic Programs", href: "#" },
                  { name: "Faculty", href: "#" },
                  { name: "Contact", href: "/contact" },
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group text-sm sm:text-base py-1 px-2 rounded-lg hover:bg-gradient-to-r hover:from-violet-600/10 hover:to-rose-500/10"
                    >
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1"></div>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 relative">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Resources
                </span>
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { name: "Time Table", href: "/admin/timetable" },
                  { name: "Notices", href: "/notices" },
                  { name: "Calendar", href: "/calendar" },
                  { name: "Results", href: "/tc-verify" },
                  { name: "Downloads", href: "/resources" },
                  { name: "Student Portal", href: "/student" },
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group text-sm sm:text-base py-1 px-2 rounded-lg hover:bg-gradient-to-r hover:from-emerald-600/10 hover:to-cyan-500/10"
                    >
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1"></div>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-10 sm:mt-12 lg:mt-14">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-violet-600 hover:to-rose-500 text-gray-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/25 transform hover:scale-105 backdrop-blur-sm border border-gray-700 hover:border-violet-500/50"
          >
            <ArrowUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-bounce" />
            <span className="text-sm sm:text-base font-medium">
              Back to Top
            </span>
          </button>
        </div>

        {/* Copyright */}
        <div className="border-t border-gradient-to-r from-violet-500/20 via-gray-700 to-rose-500/20 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center text-gray-400 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full"></div>
          <p className="text-xs sm:text-sm lg:text-base">
            &copy; {new Date().getFullYear()}
            <span className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent font-semibold mx-1">
              Gandhi Academy of technology and engineering(GATE)
            </span>
            . All rights reserved.
            <br className="sm:hidden" />
            <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0 sm:ml-2 inline-block">
              Developed with ❤️ by{" "}
              <a
                href="https://codesewa.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-cyan-300 transition-all duration-300 font-medium"
              >
                CodeSewa
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
