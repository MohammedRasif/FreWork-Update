"use client";
import img from "../../assets/img/1000062305-removebg-preview.png";
import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  CircleArrowUp,
  LogOut,
  Mail,
  MessageCircle,
  UserRound,
  Lock,
  Menu,
  X,
  EyeOff,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "../../assets/img/bruce-mars.png";
import { SlDiamond } from "react-icons/sl";
import { MdVerified } from "react-icons/md";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useChangePasswordMutation,
  useGetTuristProfileQuery,
} from "@/redux/features/withAuth";
import { toast, ToastContainer } from "react-toastify";
import AdminNotification from "../Admin/AdminNotification";
import { useTranslation } from "react-i18next";

export default function UserDashboardLayout() {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profileData, isLoading: isProfileLoading } =
    useGetTuristProfileQuery();
  const [changePassword, { isLoading: isChangePasswordLoading }] =
    useChangePasswordMutation();
  const notificationRef = useRef(null);
  const ws = useRef(null);

  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false,
  });

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error(t("passwords_do_not_match"));
      return;
    }
    try {
      await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      }).unwrap();
      toast.success(t("password_changed_success"));
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      handleClosePopup();
    } catch (error) {
      toast.error(error?.data?.error || t("failed_to_change_password"));
    }
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const handleClosePopup = () => {
    setIsChangePasswordOpen(false);
  };

  const handleItemClick = (itemName, path) => {
    if (itemName === t("logout")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userType");
      localStorage.removeItem("user_image");
      navigate(path);
    } else if (itemName === t("change_password")) {
      setIsChangePasswordOpen(true);
    } else {
      setSelectedItem(itemName);
      navigate(path);
      setIsMobileMenuOpen(false);
      setIsNotificationOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsNotificationOpen(false);
  };

  // WebSocket setup
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No token found, WebSocket connection aborted");
      return;
    }
   
    const baseUrl = "api.vacanzamycost.it";
    const socketUrl = `wss://${baseUrl}/ws/notification-count/?token=${token}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected successfully");
    };

    ws.current.onmessage = (event) => {
      console.log("Raw message received:", event.data);
      try {
        const messageData = JSON.parse(event.data);
        console.log("Parsed message:", messageData);
        if (messageData.unread_count !== undefined) {
          setUnreadCount(messageData.unread_count);
          console.log("Updated unreadCount:", messageData.unread_count);
        } else {
          console.warn("unread_count not found in message:", messageData);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Sync selectedItem with current route
  useEffect(() => {
    const normalizedLocation = location.pathname.replace(/\/$/, "");
    const myPlansRoutes = [
      "/user",
      "/user/favourite",
      "/user/accepted",
      "/user/published",
      "/user/CreatePlan",
    ];
    const profileRoutes = ["/user/profile", "/user/editProfile"];

    if (myPlansRoutes.includes(normalizedLocation)) {
      setSelectedItem(t("my_plans"));
      return;
    }
    if (profileRoutes.includes(normalizedLocation)) {
      setSelectedItem(t("profile"));
      return;
    }
    let currentItem = menuItems[0].items.find((item) => {
      const normalizedPath = item.path.replace(/\/$/, "");
      return (
        (!item.exact &&
          (normalizedPath === normalizedLocation ||
            normalizedLocation.startsWith(normalizedPath + "/"))) ||
        (item.exact && normalizedPath === normalizedLocation)
      );
    });
    if (currentItem) {
      setSelectedItem(currentItem.name);
    } else {
      setSelectedItem(null);
    }
  }, [location.pathname, t]);

  // Close mobile menu and notification dropdown when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);

  // Close mobile menu and notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest(".mobile-sidebar") &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        isNotificationOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen, isNotificationOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    {
      items: [
        {
          name: t("my_plans"),
          icon: <ClipboardList size={20} />,
          path: "/user",
          exact: true,
        },
        {
          name: t("profile"),
          icon: <UserRound size={20} />,
          path: "/user/profile",
        },
        {
          name: t("conversations"),
          icon: <MessageCircle size={20} />,
          path: "/user/chat",
        },
        { name: t("logout"), icon: <LogOut size={20} />, path: "/" },
      ],
    },
  ];

  const dropdownVariants = {
    closed: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    open: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 z-40 lg:hidden"></div>
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:block ${
          isCollapsed ? "w-20" : "w-80"
        } transition-all duration-500 ease-in-out`}
      >
        <NavLink to="/" className="w-full">
          <div className="font-bold lg:h-11 h-8 text-gray-800 mt-10 flex items-center justify-center">
            <img src={img} className="h-full" alt={t("logo")} />
          </div>
        </NavLink>
        {!isProfileLoading && profileData && (
          <div className="h-auto flex items-center px-4">
            <div className="flex flex-col w-full justify-center items-center mt-16">
              <div className="relative">
                <div
                  className={`transform transition-all duration-500 w-16 h-16 overflow-hidden rounded-full border border-gray-50  ${
                    isCollapsed
                      ? "opacity-0 -translate-x-full"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  <img
                    src={
                      profileData.profile_picture_url ||
                      ""
                    }
                    alt={t("user_avatar")}
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                {profileData?.is_verified && (
                  <div className="bg-white w-fit absolute top-0 right-0 rounded-full">
                    <MdVerified className="w-5 h-5 z-20 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="w-full flex flex-col gap-1 pl-3">
                <h3 className="text-2xl text-center font-normal text-[#343E4B]">
                  {profileData.first_name + " " + profileData.last_name}
                </h3>
                <span className="text-center text-lg font-bold text-[#343E4B]">
                  {profileData.profession || t("user")}
                </span>
              </div>
            </div>
          </div>
        )}
        <nav className="p-4 mt-6">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-8">
              <ul className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      onClick={() => handleItemClick(item.name, item.path)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-[#67748E] rounded-lg group relative ${
                          isActive || selectedItem === item.name
                            ? "bg-[#3776E2] text-white font-semibold"
                            : ""
                        }`
                      }
                    >
                      <span className="p-2 rounded-lg bg-white text-[#67748E] shadow-[0_2px_4px_-1px_#00000030]">
                        {item.icon}
                      </span>
                      <span
                        className={`transform transition-all duration-500 text-md font-semibold ${
                          isCollapsed
                            ? "opacity-0 -translate-x-full"
                            : "opacity-100 translate-x-0"
                        } whitespace-nowrap`}
                      >
                        {item.name}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* <div className="h-44 w-full flex flex-col bg-gradient-to-br from-blue-500 to-purple-600 bg-no-repeat bg-center p-5 gap-2 rounded-2xl">
            <div className="w-8 h-8 flex items-center justify-center bg-white shadow-[0_2px_4px_-1px_#00000030] p-2 rounded-md">
              <SlDiamond size={16} />
            </div>
            <div className="w-full flex flex-col gap-1">
              <h3 className="font-open-sans text-base font-semibold text-white">
                {t("need_help")}
              </h3>
              <h5 className="font-open-sans text-sm font-normal text-white">
                {t("check_our_docs")}
              </h5>
              <Button
                variant="secondary"
                className="bg-white text-gray-800 hover:bg-gray-100"
              >
                {t("documentation")}
              </Button>
            </div>
          </div> */}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`mobile-sidebar fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-[#343E4B]">{t("menu")}</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={t("close")}
          >
            <X size={20} />
          </button>
        </div>
        <div className="h-auto flex items-center px-4">
          <div className="flex flex-col w-full justify-center items-center">
            <NavLink to="/" className="w-full">
              <div className="font-bold lg:h-11 h-8 text-gray-800 mt-5 mb-5 flex items-center justify-center">
                <img src={img} className="h-full" alt={t("logo")} />
              </div>
            </NavLink>
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={
                    (!isProfileLoading && profileData?.profile_picture_url) ||
                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                  }
                  alt={t("user_avatar")}
                  className="w-full h-full rounded-full"
                />
              </div>
              {profileData?.is_verified && (
                <div className="bg-white w-fit absolute top-0 right-0 rounded-full">
                  <MdVerified className="w-5 h-5 z-20 text-blue-600" />
                </div>
              )}
            </div>
            <div className="w-full flex flex-col gap-1 pl-3 mt-4">
              <h3 className="text-xl text-center font-normal text-[#343E4B]">
                {isProfileLoading
                  ? t("loading")
                  : profileData?.first_name + " " + profileData?.last_name ||
                    t("user")}
              </h3>
              <span className="text-center text-sm text-[#8C8C8C]">
                {isProfileLoading
                  ? t("loading")
                  : profileData?.profession || t("user")}
              </span>
            </div>
          </div>
        </div>
        <nav className="p-4 mt-6">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-8">
              <ul className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      onClick={() => handleItemClick(item.name, item.path)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-[#67748E] rounded-lg group relative ${
                          isActive || selectedItem === item.name
                            ? "bg-[#3776E2] text-white font-semibold"
                            : ""
                        }`
                      }
                    >
                      <span className="p-2 rounded-lg bg-white text-[#67748E] shadow-[0_2px_4px_-1px_#00000030]">
                        {item.icon}
                      </span>
                      <span className="text-md font-semibold whitespace-nowrap">
                        {item.name}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* <div className="h-44 w-full flex flex-col bg-gradient-to-br from-blue-500 to-purple-600 bg-no-repeat bg-center p-5 gap-2 rounded-2xl">
            <div className="w-8 h-8 flex items-center justify-center bg-white shadow-[0_2px_4px_-1px_#00000030] p-2 rounded-md">
              <SlDiamond size={16} />
            </div>
            <div className="w-full flex flex-col gap-1">
              <h3 className="font-open-sans text-base font-semibold text-white">
                {t("need_help")}
              </h3>
              <h5 className="font-open-sans text-sm font-normal text-white">
                {t("check_our_docs")}
              </h5>
              <Button
                variant="secondary"
                className="bg-white text-gray-800 hover:bg-gray-100"
              >
                {t("documentation")}
              </Button>
            </div>
          </div> */}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#F8F9FA]">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileMenu}
                className="mobile-menu-button lg:hidden p-2 hover:bg-gray-200 rounded-full transition-colors duration-300"
                title={t("open_menu")}
              >
                <Menu size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4 sm:gap-8 me-2 sm:me-10">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={toggleNotificationDropdown}
                  className="p-2 rounded-full relative z-10 hover:bg-gray-200 transition-colors duration-200"
                  title={t("notifications")}
                >
                  <Bell size={20} className="sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-[60vw] max-w-[600px] h-96 bg-white border border-gray-200 shadow-lg rounded-md z-50 overflow-y-auto"
                    >
                      <AdminNotification />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden sm:flex items-center justify-center gap-5">
                <h4 className="text-xl font-medium">{t("settings")}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer" title={t("more_options")}>
                      <ChevronDown size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleItemClick(t("contact_support"), "/user/support")
                      }
                    >
                      <Mail size={20} />
                      {t("contact_support")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleItemClick(t("change_password"), "")}
                    >
                      <Lock size={20} />
                      {t("change_password")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer p-2" title={t("more_options")}>
                      <ChevronDown size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleItemClick(t("upgrade_package"), "/user/upgrade")
                      }
                    >
                      <CircleArrowUp size={20} />
                      {t("upgrade_package")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleItemClick(t("contact_support"), "/user/support")
                      }
                    >
                      <Mail size={20} />
                      {t("contact_support")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleItemClick(t("change_password"), "")}
                    >
                      <Lock size={20} />
                      {t("change_password")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#F5F5F6] p-4 sm:p-6">
          <Outlet />
        </main>

        {isChangePasswordOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{t("change_password")}</h2>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isChangePasswordLoading}
                  title={t("close")}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("old_password")}
                  </label>
                  <input
                    type={showPasswords.current_password ? "text" : "password"}
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleInputChange}
                    placeholder={t("enter_password")}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current_password")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
                    title={showPasswords.current_password ? t("hide_password") : t("show_password")}
                  >
                    {showPasswords.current_password ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("new_password")}
                  </label>
                  <input
                    type={showPasswords.new_password ? "text" : "password"}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder={t("enter_password")}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new_password")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
                    title={showPasswords.new_password ? t("hide_password") : t("show_password")}
                  >
                    {showPasswords.new_password ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("confirm_new_password")}
                  </label>
                  <input
                    type={showPasswords.confirm_password ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder={t("enter_password")}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm_password")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
                    title={showPasswords.confirm_password ? t("hide_password") : t("show_password")}
                  >
                    {showPasswords.confirm_password ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-blue-400"
                  disabled={isChangePasswordLoading}
                >
                  {isChangePasswordLoading ? t("processing") : t("confirm")}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
}