"use client";

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useShowUserInpormationQuery } from "@/redux/features/withAuth";
import img from "../../assets/img/1000062305-removebg-preview.png";
import LanguageToggleButton from "./LanguageToggleButton";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const {
    data: userData,
    isLoading,
    refetch,
  } = useShowUserInpormationQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const isAuthenticated = !!localStorage.getItem("access_token");

  const routeMap = {
    "/": "home",
    "/blog": "blog",
    "/pricing": "agencies",
    "/tourPlans": "tours",
    "/acceptedOffers": "acceptedOffers",
    "/contact": "contact",
    "/user/editProfile": "profile",
    "/user/profile": "profile",
  };

  useEffect(() => {
    const pathname = location.pathname.replace(/\/$/, "");
    if (pathname.startsWith("/blog_details/")) {
      setActiveLink("blog");
      return;
    }
    const newActiveLink = routeMap[pathname] || "home";
    setActiveLink(newActiveLink);
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    setIsProfileOpen(false);
  };

  const handleLinkClick = (link, path) => {
    setActiveLink(link);
    setIsOpen(false);
    navigate(path);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
    setIsOpen(false);
  };

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

  const handleDashboardClick = () => {
    const role = userData?.role;
    const path =
      role === "tourist" ? "/user" : role === "agency" ? "/admin" : "/";
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate(path);
  };

  const hamburgerVariants = {
    closed: { rotate: 0 },
    open: { rotate: 90 },
  };

  const menuVariants = {
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  const profileMenuVariants = {
    closed: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    open: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between fixed z-50">
      <NavLink to="/">
        <div className="font-bold lg:h-11 h-8 text-gray-800">
          <img src={img} className="h-full" alt="Logo" />
        </div>
      </NavLink>

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

      <div className="hidden lg:flex items-center space-x-8">
        <NavLink
          to="/"
          className={`text-base text-[18px] font-medium ${
            activeLink === "home"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("home", "/")}
        >
          {t("home")}
        </NavLink>
        <NavLink
          to="/blog"
          className={`text-base text-[18px] font-medium ${
            activeLink === "blog"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("blog", "/blog")}
        >
          {t("blog")}
        </NavLink>
        <NavLink
          to="/tourPlans"
          className={`text-base text-[18px] font-medium ${
            activeLink === "tours"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("tours", "/tourPlans")}
        >
          {t("tour_plans")}
        </NavLink>
        <NavLink
          to="/acceptedOffers"
          className={`text-base text-[18px] font-medium ${
            activeLink === "acceptedOffers"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("acceptedOffers", "/acceptedOffers")}
        >
          {t("accepted_offers")}
        </NavLink>
        <NavLink
          to="/pricing"
          className={`text-base text-[18px] font-medium ${
            activeLink === "agencies"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("agencies", "/pricing")}
        >
          {t("for_agencies")}
        </NavLink>
        <NavLink
          to="/contact"
          className={`text-base text-[18px] font-medium ${
            activeLink === "contact"
              ? "text-[#2464EC] border-b-2 border-[#2464EC]"
              : "text-gray-700 hover:text-blue-600"
          }`}
          onClick={() => handleLinkClick("contact", "/contact")}
        >
          {t("contact")}
        </NavLink>
      </div>

      <div className="hidden lg:flex items-center space-x-4">
        <LanguageToggleButton />
        {isAuthenticated && userData ? (
          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={toggleProfileDropdown}
            >
              <img
                src={
                  userData.image_url ||
                  "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                }
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
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-left cursor-pointer"
                    >
                      {t("dashboard")}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-left cursor-pointer"
                    >
                      {t("logout")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <NavLink to="/login">
              <button className="px-5 py-2 text-[18px] bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
                {t("login")}
              </button>
            </NavLink>
            <NavLink to="/register">
              <button className="px-5 py-2 text-[18px] bg-[#3776E2] text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
                {t("register")}
              </button>
            </NavLink>
          </>
        )}
      </div>

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
              {isAuthenticated && userData && (
                <div className="flex items-center space-x-2">
                  <img
                    src={
                      userData.image_url ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                    }
                    alt="User profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-gray-700 text-[18px] font-medium">
                    {isLoading ? t("loading") : userData.name}
                  </span>
                </div>
              )}
              <NavLink
                to="/"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "home"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleLinkClick("home", "/")}
              >
                {t("home")}
              </NavLink>
              <NavLink
                to="/blog"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "blog"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleLinkClick("blog", "/blog")}
              >
                {t("agencies")}
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
                {t("for_agencies")}
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
                {t("tour_plans")}
              </NavLink>
              <NavLink
                to="/acceptedOffers"
                className={`text-base text-[20px] font-medium ${
                  activeLink === "acceptedOffers"
                    ? "text-[#2464EC] border-b-2 border-[#2464EC]"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() =>
                  handleLinkClick("acceptedOffers", "/acceptedOffers")
                }
              >
                {t("accepted_offers")}
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
                {t("contact")}
              </NavLink>
              <LanguageToggleButton />
              {isAuthenticated && userData ? (
                <>
                  <button
                    onClick={handleDashboardClick}
                    className="px-6 py-2 text-[20px] bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer w-full text-center"
                  >
                    {t("dashboard")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 text-[20px] bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer w-full text-center"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login">
                    <button
                      className="px-6 py-2 text-[20px] bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("login")}
                    </button>
                  </NavLink>
                  <NavLink to="/register">
                    <button
                      className="px-6 py-2 text-[20px] bg-[#3776E2] text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer w-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("register")}
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
