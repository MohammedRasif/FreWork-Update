import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useShowUserInpormationQuery } from "@/redux/features/withAuth";
import BrandWordmark from "@/components/BrandWordmark";
import LanguageToggleButton from "./LanguageToggleButton";
import { useTranslation } from "react-i18next";
import { ChevronDown, ClipboardList, LogOut, UserRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userRole = localStorage.getItem("role");
  const isAuthenticated = !!localStorage.getItem("access_token");

  const {
    data: userData,
    isLoading,
    refetch,
  } = useShowUserInpormationQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });
  localStorage.setItem(
    "agency_is_verified",
    userData?.agency_is_verified || "",
  );

  const routeMap = {
    "/": "home",
    "/blog": "blog",
    "/pentru-agentii": "agencies",
    "/cereri": "tours",
    "/oferte-acceptate": "acceptedOffers",
    "/contact": "contact",
    "/cum-functioneaza": "howitworks",
    "/agentii-verificate": "certifiedAgencies",
    "/politica-de-confidentialitate": "privacy",
    "/termeni-si-conditii": "terms",
    "/cont/modifica-profil": "profile",
    "/cont/profil": "profile",
  };

  useEffect(() => {
    const pathname = location.pathname.replace(/\/$/, "");
    if (pathname.startsWith("/blog/")) {
      setActiveLink("blog");
      return;
    }
    if (pathname.startsWith("/cereri/")) {
      setActiveLink("tours");
      return;
    }
    const newActiveLink = routeMap[pathname] || "home";
    setActiveLink(newActiveLink);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) refetch();
  }, [isAuthenticated, refetch]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    setIsProfileOpen(false);
  };

  const handleLinkClick = (linkKey, path) => {
    setActiveLink(linkKey);
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate("/autentificare");
  };

  // const handleDashboardClick = () => {
  //   const role = userData?.role;
  //   const path = role === "tourist" ? "/cont" : role === "agency" ? "/agentie" : "/";
  //   setIsProfileOpen(false);
  //   setIsOpen(false);
  //   navigate(path);
  // };
  const handleDashboardClick = () => {
    const role = userData?.role;
    const isAgencyVerified = userData?.agency_is_verified;
    const isProfileComplete = userData?.is_profile_complete;

    let path = "/";

    if (role === "tourist") {
      path = "/cont";
    } else if (role === "agency") {
      if (!isAgencyVerified) {
        path = "/in-asteptare";
      } else if (!isProfileComplete) {
        path = "/agentie/modifica-profil";
      } else {
        path = "/agentie";
      }
    }

    setIsProfileOpen(false);
    setIsOpen(false);
    navigate(path);
  };

  const navItems = [
    { key: "home", path: "/", label: t("home") },
    { key: "tours", path: "/cereri", label: t("tour_plans") },
    {
      key: "acceptedOffers",
      path: "/oferte-acceptate",
      label: t("accepted_offers"),
    },
    ...(userRole !== "tourist"
      ? [{ key: "agencies", path: "/pentru-agentii", label: t("for_agencies") }]
      : []),
    { key: "howitworks", path: "/cum-functioneaza", label: t("who_work") },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-200 flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-[72px] xl:h-[82px] px-3 sm:px-5 xl:px-6 shadow-sm">
      {/* Logo */}
      <NavLink to="/" className="inline-flex min-h-11 shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c88f2a] focus-visible:ring-offset-2">
        <BrandWordmark className="xl:text-[28px]" />
      </NavLink>

      {/* Hamburger - Mobile */}
      <motion.button
        onClick={toggleMenu}
        className="xl:hidden text-gray-700"
        aria-label={isOpen ? t("close") : t("open_menu")}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </motion.button>

      {/* Desktop Menu */}
      <div className="hidden items-center xl:flex gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={`text-[14px] whitespace-nowrap font-medium transition-colors ${
              activeLink === item.key
                ? "text-[#DD9E2C] border-b-2 border-[#DD9E2C] pb-1"
                : "text-gray-700 hover:text-[#DD9E2C]"
            }`}
            onClick={() => handleLinkClick(item.key, item.path)}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Desktop Right Side */}
      <div className="hidden items-center shrink-0 xl:flex gap-3">
        <LanguageToggleButton />
        {isAuthenticated && userData ? (
          <DropdownMenu open={isProfileOpen} onOpenChange={(open) => { setIsProfileOpen(open); if (open) setIsOpen(false); }}>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label={t("settings")} className="flex h-10 items-center gap-1 rounded-xl px-2 text-[#34485c] hover:bg-[#f7f3ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c88f2a] focus-visible:ring-offset-2">
                <UserRound size={19} aria-hidden="true" />
                <ChevronDown size={15} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#e9e6e0] p-1.5">
              <DropdownMenuItem onSelect={handleDashboardClick}>
                <ClipboardList size={17} aria-hidden="true" />{t("dashboard")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut size={17} aria-hidden="true" />{t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <NavLink to="/autentificare">
              <button className="px-4 py-2 text-[15px] bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                {t("login")}
              </button>
            </NavLink>
            <NavLink to="/inregistrare">
              <button className="px-4 py-2 text-[15px] bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] text-white rounded-lg cursor-pointer transition shadow-md">
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
            className="absolute top-full left-0 w-full bg-white shadow-xl border-b border-gray-200 z-40 xl:hidden"
          >
            <div className="px-6 py-8 flex flex-col space-y-2">
              {/* Logged-in User Info */}
              {isAuthenticated && userData && (
                <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                  <img
                    src={
                      userData.image_url ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                    }
                    alt={t("user")}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100"
                  />
                  <p className="mt-3 text-lg font-semibold text-gray-800">
                    {userData.name}
                  </p>
                </div>
              )}

              {/* Same Links as Desktop */}
              {navItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={`text-lg font-medium py-2 text-center rounded-lg transition ${
                    activeLink === item.key
                      ? "text-[#DD9E2C] bg-blue-50"
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
                    className="w-full py-3 text-lg font-medium bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] text-white rounded-lg shadow-md"
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
                  <NavLink to="/autentificare" className="block">
                    <button className="w-full py-3 text-lg font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                      {t("login")}
                    </button>
                  </NavLink>
                  <NavLink to="/inregistrare" className="block">
                    <button className="w-full py-3 text-lg font-medium bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] text-white rounded-lg shadow-md">
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
