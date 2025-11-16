"use client";
import { useState, useEffect } from "react";
import { VscRobot } from "react-icons/vsc";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminMessages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const users = [];

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const userIdFromPath = pathParts[pathParts.length - 1];

    if (
      pathParts.includes("Message") &&
      users.some((user) => user.id === userIdFromPath)
    ) {
      setSelectedUserId(userIdFromPath);
    } else {
      setSelectedUserId(null);
    }
  }, [location.pathname]);

  const handleUserClick = (user) => {
    setSelectedUserId(user.id);
    navigate(`/Admin_Dashboard/Message/${user.id}`, { state: { user } });
  };

  const handleChatbotClick = () => {
    setSelectedUserId(null);
    navigate("/Admin_Dashboard/Message/chatbot");
  };

  const isBaseRoute = location.pathname === "/Admin_Dashboard/Message";

  return (
    <div className="p-10 roboto">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
        {t("messages")}
      </h1>
      <div className="flex" style={{ height: "80vh" }}>
        {/* User List Sidebar */}
        <div className="w-1/4 rounded-l-lg bg-gray-50 dark:bg-[#1E232E] border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="m-3">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="border border-gray-300 rounded-md w-full pl-2 py-[10px]"
            />
          </div>

          <div
            onClick={handleChatbotClick}
            className={`flex items-center space-x-2 px-[10px] py-[8px] mt-2 cursor-pointer ${
              location.pathname === "/Admin_Dashboard/Message/chatbot"
                ? "bg-[#B6E3FC]"
                : "hover:bg-[#B6E3FC]"
            }`}
          >
            <div className="bg-[#2F80A9] h-10 w-10 text-white flex items-center justify-center rounded-full">
              <VscRobot size={25} />
            </div>
            <div className="text-md">
              <h1 className="pt-1 font-semibold">{t("smart_ai_assistant")}</h1>
            </div>
          </div>

          {/* User list container */}
          <div className="overflow-y-auto flex-1">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252c3b] text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-200 ${
                  selectedUserId === user.id
                    ? "bg-blue-100 dark:bg-[#2F80A9]"
                    : ""
                }`}
              >
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full mr-3 object-cover"
                />
                <div className="relative">
                  <span className="font-medium text-[15px]">{user.name}</span>
                  {user.number && (
                    <h1 className="absolute top-1 left-[28vh] text-[12px] bg-[#0B7EBB] text-white px-[5px] rounded-full">
                      {user.number}
                    </h1>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Default Message or Outlet */}
        <div className="w-3/4 bg-white dark:bg-[#252c3b] rounded-r-lg">
          {isBaseRoute ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {t("select_chat_to_start")}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {t("choose_user_or_ai")}
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
};

export default AdminMessages;