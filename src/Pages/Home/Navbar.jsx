"use client";

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useShowUserInpormationQuery } from "@/redux/features/withAuth";
import img from "../../assets/img/1000062305-removebg-preview.png";
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Get user data from the query
  const { data: userData, isLoading } = useShowUserInpormationQuery();
  console.log(userData)

  // Check if access_token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("access_token");

  // Update activeLink based on the current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/") {
      setActiveLink("home");
    } else if (pathname === "/membership") {
      setActiveLink("membership");
    } else if (pathname === "/pricing") {
      setActiveLink("agencies");
    } else if (pathname === "/s") {
      setActiveLink("tours");
    } else if (pathname === "/contact") {
      setActiveLink("contact");
    }
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    setIsProfileOpen(false); // Close profile dropdown when mobile menu toggles
  };

  const handleLinkClick = (link, path) => {
    setActiveLink(link);
    setIsOpen(false); // Close mobile menu on link click
    navigate(path); // Navigate to the selected route
  };

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
    setIsOpen(false); // Close mobile menu when profile dropdown toggles
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("name");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_image");
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate("/login");
  };

  // Handle dashboard navigation based on role
  const handleDashboardClick = () => {
    const role = userData?.role;
    const path = role === "tourist" ? "/user" : role === "agency" ? "/admin" : "/";
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate(path);
  };

  // Hamburger icon animation variants
  const hamburgerVariants = {
    closed: { rotate: 0 },
    open: { rotate: 90 },
  };

  // Dropdown menu animation variants
  const menuVariants = {
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  // Profile dropdown animation variants
  const profileMenuVariants = {
    closed: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    open: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between relative">
      {/* Logo/Brand */}
      <div className="font-bold lg:h-11 h-8 text-gray-800">
        <img src={img} className="h-full" alt="" />
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="lg:hidden">
        <motion.button
          onClick={toggleMenu}
          animate={isOpen ? "open" : "closed"}
          variants={hamburgerVariants}
          className="text-gray-700 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </motion.button>
      </div>

      {/* Navigation Links - Desktop */}
      <div className="hidden lg:flex items-center space-x-8">
        <NavLink
          to="/"
          className={`text-base text-[20px] font-medium ${
            activeLink === "home"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("home", "/")}
        >
          Home
        </NavLink>
        <NavLink
          to="/membership"
          className={`text-base text-[20px] font-medium ${
            activeLink === "membership"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("membership", "/membership")}
        >
          Agencies
        </NavLink>
        <NavLink
          to="/pricing"
          className={`text-base text-[20px] font-medium ${
            activeLink === "agencies"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("agencies", "/pricing")}
        >
          Membership Plans
        </NavLink>
        <NavLink
          to="/tourPlans"
          className={`text-base text-[20px] font-medium ${
            activeLink === "tours"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("tours", "/tourPlans")}
        >
          Tour Plans
        </NavLink>
        <NavLink
          to="/contact"
          className={`text-base text-[20px] font-medium ${
            activeLink === "contact"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("contact", "/contact")}
        >
          Contact
        </NavLink>
      </div>

      {/* Auth Section - Desktop */}
      <div className="hidden lg:flex items-center space-x-4">
        {isAuthenticated && userData ? (
          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={toggleProfileDropdown}
            >
              <img
                src={userData.image_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png" }
                alt="User profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-gray-700 text-[18px] font-medium">
                {userData.name}
              </span>
            </div>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={profileMenuVariants}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-50"
                >
                  <div className="flex flex-col">
                    <button
                      onClick={handleDashboardClick}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <NavLink to="/login">
              <button className="px-6 py-2 text-[20px] bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
                Login
              </button>
            </NavLink>
            <NavLink to="/register">
              <button className="px-6 py-2 text-[20px] bg-[#3776E2] text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
                Register
              </button>
            </NavLink>
          </>
        )}
      </div>

      {/* Dropdown Menu - Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg lg:hidden z-50"
          >
            <div className="flex flex-col items-center space-y-4 py-4">
              <NavLink
                to="/"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "home"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleLinkClick("home", "/")}
              >
                Home
              </NavLink>
              <NavLink
                to="/membership"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "membership"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleLinkClick("membership", "/membership")}
              >
                Agencies
              </NavLink>
              <NavLink
                to="/pricing"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "agencies"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleLinkClick("agencies", "/pricing")}
              >
                Membership Plans
              </NavLink>
              <NavLink
                to="/tourPlans"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "tours"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleLinkClick("tours", "/tourPlans")}
              >
                Tour Plans
              </NavLink>
              <NavLink
                to="/contact"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "contact"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleLinkClick("contact", "/contact")}
              >
                Contact
              </NavLink>
              {isAuthenticated && userData ? (
                <div className="relative w-full text-center" ref={profileRef}>
                  <div
                    className="flex flex-col items-center space-y-2 cursor-pointer"
                    onClick={toggleProfileDropdown}
                  >
                    <img
                      src={userData.image_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
                      alt="User profile"
                      className="w-10 h-10 rounded-full object-cover mx-auto"
                    />
                    <span className="text-gray-700 text-[18px] font-medium">
                      {userData.name}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={profileMenuVariants}
                        className="w-full bg-white border-t border-gray-200 shadow-lg z-50"
                      >
                        <div className="flex flex-col">
                          <button
                            onClick={handleDashboardClick}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-center"
                          >
                            Dashboard
                          </button>
                          <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-center"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <NavLink to="/login">
                    <button
                      className="px-6 py-2 text-[20px] bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </button>
                  </NavLink>
                  <NavLink to="/register">
                    <button
                      className="px-6 py-2 text-[20px] bg-[#3776E2] text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </button>
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;