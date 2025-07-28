"use client";

import { useGetChatListQuery } from "@/redux/features/withAuth";
import { useState, useEffect } from "react";
import { IoMdSearch } from "react-icons/io";
import { MdVerified } from "react-icons/md";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function ChatInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatsList, setChatsList] = useState([]);
  const {
    data: chatList,
    isLoading: isChatListLoading,
    refetch: refetchChatList,
  } = useGetChatListQuery();

  // Update and sort chatsList when chatList data is fetched
  useEffect(() => {
    if (chatList && Array.isArray(chatList)) {
      const sortedChats = [...chatList].sort((a, b) => {
        const timeA = a.last_message_time
          ? new Date(a.last_message_time)
          : new Date(a.updated_at);
        const timeB = b.last_message_time
          ? new Date(b.last_message_time)
          : new Date(b.updated_at);
        // Improved date handling with fallback
        if (!timeA || isNaN(timeA.getTime())) return 1;
        if (!timeB || isNaN(timeB.getTime())) return -1;
        return timeB - timeA; // Sort in descending order
      });

      const mappedChats = sortedChats.map((chat) => ({
        id: chat.id?.toString() || "",
        name: chat.other_participant_name || "Unknown User",
        image: chat.other_participant_image || "/placeholder.svg",
        lastMessage: chat.last_message || null,
        unreadCount: chat.unread_count || 0,
        active: chat.active || false, // Backend support needed for active status
        tourist_is_verified: chat.tourist_is_verified || false,
        other_user_id: chat.other_user_id || null,
        tour_plan_title: chat.tour_plan_title || "No Tour Plan",
        tour_plan_id:chat.tour_plan_id || null
      }));

      setChatsList(mappedChats);
    }
  }, [isChatListLoading, chatList]);

  // Check for mobile layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update selectedAgencyId based on current route
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const agencyIdFromPath = pathParts[pathParts.length - 1];
    if (
      pathParts.includes("chat") &&
      chatsList.some((agency) => agency.id === agencyIdFromPath)
    ) {
      setSelectedAgencyId(agencyIdFromPath);
    } else {
      setSelectedAgencyId(null);
    }
  }, [location.pathname, chatsList]);

  const handleAgencyClick = (agency) => {
    console.log(agency,"adlkgjfldsjljdfslore olsdlk")
    if (!agency.id) return;
    setSelectedAgencyId(agency.id);
    const basePath = location.pathname.includes("/admin/")
      ? "/admin/chat"
      : "/user/chat";
    navigate(`${basePath}/${agency.id}`, { state: { agency } });
  };

  const isBaseRoute =
    location.pathname === "/user/chat" || location.pathname === "/admin/chat";

  // Filter agencies based on search term, including tour_plan_title
  const filteredAgencies = chatsList.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.tour_plan_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-semibold mb-3">Messages</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats or tour plans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-200 rounded-lg pl-10 pr-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <IoMdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isChatListLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : filteredAgencies.length === 0 ? (
            <div className="p-4 text-center">No chats found</div>
          ) : (
            filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                onClick={() => handleAgencyClick(agency,"llllllllllllllllllllllllllllllllll")}
                className={`flex items-center px-4 py-2 border-b border-gray-300 cursor-pointer hover:bg-gray-200 ${
                  selectedAgencyId === agency.id ? "bg-gray-200" : ""
                }`}
              >
                <div className="relative mr-3">
                  <img
                    src={agency.image}
                    alt={agency.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/placeholder.svg")}
                  />
                  {agency.active && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold truncate">{agency.name}</h3>
                      {agency.tourist_is_verified && (
                        <MdVerified className="ml-1 w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    {agency.unreadCount > 0 && (
                      <span className="text-[12px] bg-blue-500 text-white px-2 py-1 rounded-full ml-2">
                        {agency.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {agency.tour_plan_title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {agency.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {!isBaseRoute && (
          <div className="fixed inset-0 bg-gray-900 z-50">
            <Outlet />
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="roboto p-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Messages
      </h1>
      <div className="flex" style={{ height: "80vh" }}>
        <div className="w-1/4 rounded-l-lg bg-gray-50 dark:bg-[#1E232E] border-r border-gray-200 dark:border-gray-300 flex flex-col">
          <div className="m-3 relative">
            <input
              type="text"
              placeholder="Search chats or tour plans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md w-full pl-10 py-[10px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
            <IoMdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <div className="overflow-y-auto flex-1">
            {isChatListLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : filteredAgencies.length === 0 ? (
              <div className="p-4 text-center">No chats found</div>
            ) : (
              filteredAgencies.map((agency) => (
                <div
                  key={agency.id}
                  onClick={() => handleAgencyClick(agency,"....................................")}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252c3b] text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-200 dark:border-gray-300 ${
                    selectedAgencyId === agency.id
                      ? "bg-blue-100 dark:bg-[#2F80A9]"
                      : ""
                  }`}
                >
                  <div className="relative mr-3">
                    <img
                      src={agency.image}
                      alt={agency.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => (e.target.src = "/placeholder.svg")}
                    />
                    {agency.active && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className="font-medium text-[15px] truncate">
                          {agency.name}
                        </span>
                        {agency.tourist_is_verified && (
                          <MdVerified className="ml-1 w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      {agency.unreadCount > 0 && (
                        <span className="text-[12px] bg-blue-500 text-white px-2 py-1 rounded-full ml-2">
                          {agency.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {agency.tour_plan_title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {agency.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="w-3/4 bg-white dark:bg-[#252c3b] rounded-r-lg">
          {isBaseRoute ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Select a Chat to Start Messaging
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Choose an agency to begin your conversation.
                </p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}