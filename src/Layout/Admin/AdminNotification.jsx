import { useDeleteNotificationMutation, useGetNotificationsQuery, useSeenNotificationMutation } from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify"; // Import react-toastify

const AdminNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const { data: notificationsData, isLoading: isNotificationsLoading } = useGetNotificationsQuery();
  const [seenNotification] = useSeenNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation(); // Corrected: No id passed here
  const token = localStorage.getItem("access_token");

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const baseUrl = "https://novel-fresh-spaniel.ngrok-free.app/";
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
        setNotifications((prev) => [...prev, newNotification]);

        // Trigger desktop notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Notification", {
            body: newNotification.message || "You have a new notification!",
            icon: "/path/to/icon.png",
          });
        } else if ("Notification" in window && Notification.permission !== "denied") {
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

  const handleDeleteClick = (id) => {
    setSelectedNotificationId(id);
    setShowPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Trigger the delete mutation with the selectedNotificationId
      await deleteNotification(selectedNotificationId).unwrap();
      
      // Update the local state to remove the deleted notification
      setNotifications(
        notifications.filter((item) => item.id !== selectedNotificationId)
      );

      // Show success toast
      toast.success("Notification deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Close the popup
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
    <div className="p-4 sm:p-6 container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-700 text-center sm:text-left">
          All Notifications
        </h1>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {isNotificationsLoading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
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
                    className="py-1 px-[2px]"
                  />
                </button>
              </div>
            </div>
          ))
        )}
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