import { useGetNotificationsQuery, useSeenNotificationMutation } from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";

const AdminNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const { data: notificationsData, isLoading: isNotificationsLoading } =
    useGetNotificationsQuery();
  const [seenNotification] = useSeenNotificationMutation();
  const token = localStorage.getItem("access_token");
  console.log(token)


  useEffect(() => {
    
    const baseUrl = "https://novel-fresh-spaniel.ngrok-free.app/";
    const socketUrl = `wss://${baseUrl}/ws/notifications/?token=${token}`;
    const socket = new WebSocket(socketUrl);
    

    socket.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    return () => {
      socket.close();
    };
  }, [token]); 

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
      notificationsData.forEach((item) => {
        if (!item.seen) {
          seenNotification(item.id);
        }
      });
      console.log(notificationsData);
    }
  }, [notificationsData, seenNotification]);

  const handleDeleteClick = (id) => {
    setSelectedNotificationId(id);
    setShowPopup(true);
  };

  const handleConfirmDelete = () => {
    setNotifications(
      notifications.filter((item) => item.id !== selectedNotificationId)
    );
    setShowPopup(false);
    setSelectedNotificationId(null);
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
    setSelectedNotificationId(null);
  };

  return (
    <div className="p-4 sm:p-6 container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700 text-center sm:text-left">
          All Notifications
        </h1>
        <a
          href="#"
          className="text-sm sm:text-md underline text-center sm:text-right"
        >
          Clear all
        </a>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {!isNotificationsLoading &&
          notifications.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-md p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            >
              <p className="text-sm sm:text-md text-gray-700">{item.message}</p>
              <div className="flex items-center justify-between sm:justify-end space-x-2">
                <span className="text-gray-500 text-sm sm:text-md">
                  {new Date(item.created_at).toLocaleString("default", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <button
                  onClick={() => handleDeleteClick(item.id)}
                  className="text-red-500 hover:text-red-700 border border-gray-300 rounded-sm cursor-pointer p-1 sm:p-[2px]"
                >
                  <RiDeleteBin6Line
                    size={24}
                    sm:size={28}
                    className="py-1 px-[2px]"
                  />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">
              Are you sure you want to delete this notification?
            </h2>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer w-full sm:w-auto"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotification;