import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useSeenNotificationMutation,
} from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import { IoClose, IoEyeOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const { data: notificationsData, isLoading: isNotificationsLoading } =
    useGetNotificationsQuery();
  const [seenNotification] = useSeenNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // WebSocket for real-time notifications
  useEffect(() => {
    const baseUrl =
      "https://transeunt-noncommemoratory-valeria.ngrok-free.app/";
    const socketUrl = `wss://${baseUrl}/ws/notifications/?token=${token}`;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        console.log("New notification received:", newNotification);

        // Update notifications state with the new notification
        setNotifications((prev) => [newNotification, ...prev]);

        // Trigger desktop notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Notification", {
            body: newNotification.message || "You have a new notification!",
            icon: "/path/to/icon.png",
          });
        } else if (
          "Notification" in window &&
          Notification.permission !== "denied"
        ) {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("New Notification", {
                body: newNotification.message || "You have a new notification!",
                icon: "/path/to/icon.png",
              });
            }
          });
        }

        // Mark as seen if applicable
        if (newNotification.id && !newNotification.seen) {
          seenNotification(newNotification.id);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
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
  }, [token, seenNotification]);

  // Sync notifications from API
  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
      notificationsData.forEach((item) => {
        if (!item.seen) {
          seenNotification(item.id);
        }
      });
    }
  }, [notificationsData, seenNotification]);

  // Handle view notification
  const handleViewClick = (notification) => {
    console.log("Viewing notification:", notification);
    if (notification.target_url) {
      navigate(notification.target_url);
    } else {
      toast.error("No target URL available for this notification");
    }
  };

  // Handle delete notification
  const handleDeleteClick = (id) => {
    setSelectedNotificationId(id);
    setShowPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNotification(selectedNotificationId).unwrap();
      setNotifications(
        notifications.filter((item) => item.id !== selectedNotificationId)
      );
      toast.success("Notification deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setShowPopup(false);
      setSelectedNotificationId(null);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
    setSelectedNotificationId(null);
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
          Notifications
        </h1>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isNotificationsLoading ? (
          <p className="text-gray-600 text-center">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-600 text-center">
            No notifications available.
          </p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm px-4 py-2 flex flex-col hover:shadow-md transition-shadow duration-200"
            >
              <p className="text-sm sm:text-[15px] text-gray-700 font-medium">
                {item.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleString("default", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewClick(item)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                    title="View Notification"
                  >
                    <IoEyeOutline size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                    title="Delete Notification"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Delete Notification
              </h2>
              <button
                onClick={handleCancelDelete}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this notification?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotification;
