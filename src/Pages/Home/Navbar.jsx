import React, { useState, useEffect, useRef } from "react";
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

  // এই ম্যাপ দিয়ে active link চেক করি
  const routeMap = {
    "/": "home",
    "/blog": "blog",
    "/pricing": "agencies",
    "/tourPlans": "tours",
    "/acceptedOffers": "acceptedOffers",
    "/contact": "contact",
    "/who_it_work": "howitworks", // নতুন রুট যোগ করলাম
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
    if (isAuthenticated) refetch();
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
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

  const handleLinkClick = (linkKey, path) => {
    setActiveLink(linkKey);
    setIsOpen(false);
    navigate(path);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate("/login");
  };

  const handleDashboardClick = () => {
    const role = userData?.role;
    const path = role === "tourist" ? "/user" : role === "agency" ? "/admin" : "/";
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate(path);
  };

  // একই লিংকগুলো Desktop + Mobile দুজায়গাতেই ব্যবহার করবো
  const navItems = [
    { key: "home", path: "/", label: t("home") },
    { key: "tours", path: "/tourPlans", label: t("tour_plans") },
    { key: "acceptedOffers", path: "/acceptedOffers", label: t("accepted_offers") },
    { key: "agencies", path: "/pricing", label: t("for_agencies") },
    { key: "howitworks", path: "/who_it_work", label: t("who_work") },
    // যদি পরে ব্লগ/কন্টাক্ট চালু করো তাহলে এখানে যোগ করো
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <NavLink to="/">
        <img src={img} className="h-8 lg:h-11" alt="VacanzaMyCost.it" />
      </NavLink>

      {/* Hamburger - Mobile */}
      <motion.button
        onClick={toggleMenu}
        className="lg:hidden text-gray-700"
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </motion.button>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center space-x-8">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={`text-[18px] font-medium transition-colors ${
              activeLink === item.key
                ? "text-[#2464EC] border-b-2 border-[#2464EC] pb-1"
                : "text-gray-700 hover:text-[#2464EC]"
            }`}
            onClick={() => handleLinkClick(item.key, item.path)}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Desktop Right Side */}
      <div className="hidden lg:flex items-center space-x-5">
        <LanguageToggleButton />
        {isAuthenticated && userData ? (
          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={toggleProfileDropdown}
            >
              <img
                src={userData.image_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
              />
              <span className="font-medium text-gray-800">{userData.name}</span>
            </div>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
                >
                  <button
                    onClick={handleDashboardClick}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    {t("dashboard")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                  >
                    {t("logout")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <NavLink to="/login">
              <button className="px-6 py-2.5 text-[18px] bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                {t("login")}
              </button>
            </NavLink>
            <NavLink to="/register">
              <button className="px-6 py-2.5 text-[18px] bg-[#3776E2] text-white rounded-lg hover:bg-blue-700 transition shadow-md">
                {t("register")}
              </button>
            </NavLink>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl border-b border-gray-200 lg:hidden z-40"
          >
            <div className="px-6 py-8 flex flex-col space-y-2">

              {/* Logged-in User Info */}
              {isAuthenticated && userData && (
                <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                  <img
                    src={userData.image_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
                    alt="User"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100"
                  />
                  <p className="mt-3 text-lg font-semibold text-gray-800">{userData.name}</p>
                </div>
              )}

              {/* Same Links as Desktop */}
              {navItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={`text-lg font-medium py-2 text-center rounded-lg transition ${
                    activeLink === item.key
                      ? "text-[#2464EC] bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleLinkClick(item.key, item.path)}
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Language Toggle */}
              <div className="flex justify-center py-4">
                <LanguageToggleButton />
              </div>

              {/* Auth Buttons */}
              {isAuthenticated && userData ? (
                <>
                  <button
                    onClick={handleDashboardClick}
                    className="w-full py-3 text-lg font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md"
                  >
                    {t("dashboard")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-lg font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="block">
                    <button className="w-full py-3 text-lg font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                      {t("login")}
                    </button>
                  </NavLink>
                  <NavLink to="/register" className="block">
                    <button className="w-full py-3 text-lg font-medium bg-[#3776E2] text-white rounded-lg hover:bg-blue-700 shadow-md">
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