"use client";

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
import UserAvatar from "../../assets/img/bruce-mars.png";
import { SlDiamond } from "react-icons/sl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChangePasswordMutation, useGetTuristProfileQuery } from "@/redux/features/withAuth";
import { notification_url } from "@/assets/Socketurl";
import { MdVerified } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";

export default function UserDashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false); // New state for popup
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profileData, isLoading: isProfileLoading } = useGetTuristProfileQuery();
  let ws = useRef(null);
  console.log(profileData);
  const [changePassword, { isLoading: isChangePasswordLoading }] = useChangePasswordMutation();

  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false,
  });

  // State to manage form inputs
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
  });
  

   const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };


  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate new password and confirm password
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New password and confirm password do not match!');
      return;
    }

    try {
      // Call the API to change password
      await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      }).unwrap();

      // Show success toast
      toast.success('Password changed successfully!');

      // Reset form and close popup
      setFormData({
        current_password: '',
        new_password: '',
      });
      handleClosePopup();
    } catch (error) {
      // Show error toast
      toast.error(error?.data?.error || 'Failed to change password');
    }
  };
  // WebSocket for notifications
  useEffect(() => {
    ws.current = new WebSocket(notification_url);
    ws.current.onopen = () => {
      console.log("notification socket connected");
    };
    ws.current.onmessage = (event) => {
      console.log("Raw message:", event.data);
      try {
        const data = JSON.parse(event.data);
        setNotifications((prev) => [...prev, data]);
        console.log("Parsed message:", data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };
    ws.current.onerror = (error) => {
      console.error("notification socket error:", error);
    };
    ws.current.onclose = () => {
      console.log("notification connection closed");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

 
 // Inside UserDashboardLayout component
useEffect(() => {
  const normalizedLocation = location.pathname.replace(/\/$/, "");
  const myPlansRoutes = [
    "/user",
    "/user/favourite",
    "/user/accepted",
    "/user/published",
    "/user/CreatePlan", // Existing entry from your previous request
  ];
  const profileRoutes = [
    "/user/profile",
    "/user/editProfile", // Added /user/editProfile to profile routes
  ];

  if (myPlansRoutes.includes(normalizedLocation)) {
    setSelectedItem("My Plans");
    console.log("normalizedLocation:", normalizedLocation, "selectedItem:", "My Plans");
    return;
  }
  if (profileRoutes.includes(normalizedLocation)) {
    setSelectedItem("Profile");
    console.log("normalizedLocation:", normalizedLocation, "selectedItem:", "Profile");
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
    console.log("normalizedLocation:", normalizedLocation, "selectedItem:", currentItem.name);
  } else {
    setSelectedItem(null);
    console.log("normalizedLocation:", normalizedLocation, "selectedItem:", null);
  }
}, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest(".mobile-sidebar") &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

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
          name: "My Plans",
          icon: <ClipboardList size={20} />,
          path: "/user",
          exact: true,
        },
        {
          name: "Profile",
          icon: <UserRound size={20} />,
          path: "/user/profile",
        },
        {
          name: "Conversations",
          icon: <MessageCircle size={20} />,
          path: "/user/chat",
        },
        {
          name: "Notifications",
          icon: <Bell size={20} />,
          path: "/user/notification",
        },
        { name: "Logout", icon: <LogOut size={20} />, path: "/" },
      ],
    },
  ];

  const handleItemClick = (itemName, path) => {
    if (itemName === "Logout") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_image");
      navigate(path);
    } else if (itemName === "Change password") {
      setIsChangePasswordOpen(true);
    } else {
      setSelectedItem(itemName);
      navigate(path);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleClosePopup = () => {
    setIsChangePasswordOpen(false);
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
        {/* Logo */}
        {!isProfileLoading && profileData && (
          <div className="h-auto flex items-center px-4">
            <NavLink to="/" className="w-full">
              <div className="flex flex-col w-full justify-center items-center mt-16">
              <div className="relative">
                <div
                  className={`transform transition-all duration-500 w-16 h-16 overflow-hidden rounded-full border border-gray-50 ${
                    isCollapsed
                      ? "opacity-0 -translate-x-full"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  <img
                    src={profileData.profile_picture_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
                    alt="User"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                {profileData?.is_verified && (
                  <div className="bg-white w-fit absolute top-0 right-0 rounded-full">
                    <MdVerified className=" w-5 h-5 z-20 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="w-full flex flex-col gap-1 pl-3">
                <h3 className="text-2xl text-center font-normal text-[#343E4B]">
                  {profileData.first_name + " " + profileData.last_name}
                </h3>
                <span className="text-center text-lg font-bold text-[#343E4B]">
                  {profileData.profession || "User"}
                </span>
              </div>
            </div>
            </NavLink>
          </div>
        )}

        {/* Navigation */}
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
                      {item.badge && !isCollapsed && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="h-44 w-full flex flex-col bg-gradient-to-br from-blue-500 to-purple-600 bg-no-repeat bg-center p-5 gap-2 rounded-2xl">
            <div className="w-8 h-8 flex items-center justify-center bg-white shadow-[0_2px_4px_-1px_#00000030] p-2 rounded-md">
              <SlDiamond size={16} />
            </div>
            <div className="w-full flex flex-col gap-1">
              <h3 className="font-open-sans text-base font-semibold text-white">
                Need Help
              </h3>
              <h5 className="font-open-sans text-sm font-normal text-white">
                Please check our docs
              </h5>
              <Button
                variant="secondary"
                className="bg-white text-gray-800 hover:bg-gray-100"
              >
                DOCUMENTATION
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`mobile-sidebar fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-[#343E4B]">Menu</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Logo */}
        <div className="h-auto flex items-center px-4">
          <div className="flex flex-col w-full justify-center items-center mt-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={
                    (!isProfileLoading && profileData?.profile_picture_url) ||
                    UserAvatar
                  }
                  alt="User"
                  className="w-full h-full rounded-full"
                />
              </div>
              {profileData?.is_verified && (
                <div className="bg-white w-fit absolute top-0 right-0 rounded-full">
                  <MdVerified className=" w-5 h-5 z-20 text-blue-600" />
                </div>
              )}
            </div>
            <div className="w-full flex flex-col gap-1 pl-3 mt-4">
              <h3 className="text-xl text-center font-normal text-[#343E4B]">
                {isProfileLoading
                  ? "Loading..."
                  : profileData?.first_name + " " + profileData?.last_name ||
                    "User"}
              </h3>
              <span className="text-center text-sm text-[#8C8C8C]">
                {isProfileLoading
                  ? "Loading..."
                  : profileData?.profession || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
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
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="h-44 w-full flex flex-col bg-gradient-to-br from-blue-500 to-purple-600 bg-no-repeat bg-center p-5 gap-2 rounded-2xl">
            <div className="w-8 h-8 flex items-center justify-center bg-white shadow-[0_2px_4px_-1px_#00000030] p-2 rounded-md">
              <SlDiamond size={16} />
            </div>
            <div className="w-full flex flex-col gap-1">
              <h3 className="font-open-sans text-base font-semibold text-white">
                Need Help
              </h3>
              <h5 className="font-open-sans text-sm font-normal text-white">
                Please check our docs
              </h5>
              <Button
                variant="secondary"
                className="bg-white text-gray-800 hover:bg-gray-100"
              >
                DOCUMENTATION
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-[#F8F9FA]">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileMenu}
                className="mobile-menu-button lg:hidden p-2 hover:bg-gray-200 rounded-full transition-colors duration-300"
              >
                <Menu size={20} />
              </button>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-2xl font-medium text-[#343E4B] flex gap-2 sm:gap-4 items-end">
                  Wednesday
                  <span className="text-xs font-normal">25 July, 2025</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-8 me-2 sm:me-10">
              <NavLink
                to="/user/notification"
                className={({ isActive }) =>
                  `p-2 rounded-full relative ${
                    isActive ? "bg-[#3776E2] text-white" : "bg-[#EEF1F5]"
                  }`
                }
              >
                <Bell size={20} className="sm:w-6 sm:h-6" />
                {notifications.length > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </NavLink>
              <div className="hidden sm:flex items-center justify-center gap-5">
                <h4 className="text-xl font-medium">Settings</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer">
                      <ChevronDown size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    {/* <DropdownMenuItem onClick={() => handleItemClick("Upgrade package", "/user/upgrade")}>
                      <CircleArrowUp size={20} />
                      Upgrade package
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => handleItemClick("Contact support", "/user/support")}>
                      <Mail size={20} />
                      Contact support
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemClick("Change password", "")}>
                      <Lock size={20} />
                      Change password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer p-2">
                      <ChevronDown size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => handleItemClick("Upgrade package", "/user/upgrade")}>
                      <CircleArrowUp size={20} />
                      Upgrade package
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemClick("Contact support", "/user/support")}>
                      <Mail size={20} />
                      Contact support
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemClick("Change password", "")}>
                      <Lock size={20} />
                      Change password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#F5F5F6] p-4 sm:p-6">
          <Outlet />
        </main>

        {/* Change Password Popup */}
       {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-500 hover:text-gray-700"
                disabled={isChangePasswordLoading}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Old password</label>
                <input
                  type={showPasswords.current_password ? 'text' : 'password'}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current_password')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
                >
                  {showPasswords.current_password ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  type={showPasswords.new_password ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new_password')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
                >
                  {showPasswords.new_password ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                <input
                  type={showPasswords.confirm_password ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm_password')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
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
                {isChangePasswordLoading ? 'Processing...' : 'Confirm'}
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
    
  );
}