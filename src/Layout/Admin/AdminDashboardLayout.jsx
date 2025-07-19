"use client";

import { useState, useEffect } from "react";
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
import { useGetAgencyProfileQuery } from "@/redux/features/withAuth";

export default function AdminDashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Changed default to null
  const location = useLocation();
  const navigate = useNavigate();
  const { data: agencyData, isLoading } = useGetAgencyProfileQuery();

  const menuItems = [
    {
      items: [
        {
          name: "My Plans",
          icon: <ClipboardList size={20} />,
          path: "/admin",
          exact: true,
        },
        {
          name: "Notifications",
          icon: <Bell size={20} />,
          path: "/admin/admin_notification",
        },
        {
          name: "Membership",
          icon: <UserRound size={20} />,
          path: "/admin/membership",
        },
        {
          name: "Conversations",
          icon: <MessageCircle size={20} />,
          path: "/admin/chat",
        },
        {
          name: "Profile",
          icon: <UserRound size={20} />,
          path: "/admin/profile",
        },
        { name: "Logout", icon: <LogOut size={20} />, path: "/" },
      ],
    },
  ];

  // Sync selectedItem with current route
  useEffect(() => {
    const normalizedLocation = location.pathname.replace(/\/$/, "");
    const myPlansRoutes = [
      "/admin",
      "/admin/favourite",
      "/admin/accepted",
      "/admin/published",
    ];

    if (myPlansRoutes.includes(normalizedLocation)) {
      setSelectedItem("My Plans");
      console.log("normalizedLocation:", normalizedLocation, "selectedItem:", "My Plans");
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

  const handleItemClick = (itemName, path) => {
    if (itemName === "Logout") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate(path);
    } else {
      setSelectedItem(itemName);
      navigate(path);
      setIsMobileMenuOpen(false); // Close mobile menu on click
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
        <div className="h-auto flex items-center px-4">
          <div className="flex flex-col w-full justify-center items-center mt-16">
            <div
              className={`transform transition-all duration-500 ${
                isCollapsed
                  ? "opacity-0 -translate-x-full"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <img
                src={
                  isLoading
                    ? UserAvatar
                    : agencyData?.profile_handler_image ||
                      agencyData?.agency_logo_url ||
                      UserAvatar
                }
                alt={agencyData?.profile_handler_name || "User"}
                className="w-16 h-16 rounded-full"
              />
            </div>
            <div className="w-full flex flex-col gap-1 pl-3">
              <h3 className="text-2xl text-center font-normal text-[#343E4B]">
                {isLoading
                  ? "Loading..."
                  : agencyData?.profile_handler_name || "Company Profile"}
              </h3>
              <span className="text-center text-md text-[#8C8C8C]">
                {isLoading
                  ? "Loading..."
                  : agencyData?.profile_handler_position || "username"}
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
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold text-[#343E4B]">Menu</h1>
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-auto flex items-center px-4">
          <div className="flex flex-col w-full justify-center items-center mt-8">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={(!isLoading && agencyData?.agency_logo_url) || UserAvatar}
                alt={agencyData?.name || "User"}
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="w-full flex flex-col gap-1 pl-3 mt-4">
              <h3 className="text-xl text-center font-normal text-[#343E4B]">
                {isLoading
                  ? "Loading..."
                  : agencyData?.name || "Company Profile"}
              </h3>
              <span className="text-center text-sm text-[#8C8C8C]">
                {isLoading ? "Loading..." : agencyData?.position || "username"}
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
                to="/admin/admin_notification"
                className={({ isActive }) =>
                  `p-2 rounded-full relative ${
                    isActive ? "bg-[#3776E2] text-white" : "bg-[#EEF1F5]"
                  }`
                }
              >
                <Bell size={20} className="sm:w-6 sm:h-6" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
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
                    <DropdownMenuItem>
                      <CircleArrowUp size={20} />
                      Upgrade package
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail size={20} />
                      Contact support
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
                    <DropdownMenuItem>
                      <CircleArrowUp size={20} />
                      Upgrade package
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail size={20} />
                      Contact support
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock size={20} />
                      Change password
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
      </div>
    </div>
  );
}