import { useState, useRef, useEffect } from "react";
import { SendIcon, ClockIcon, CheckIcon, XIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetChatHsitoryQuery,
  useGetPlansQuery,
  useInviteToChatMutation,
} from "@/redux/features/withAuth";
import { chat_sockit } from "@/assets/Socketurl";
import { v4 as uuidv4 } from "uuid";

function Messages() {
  const { id } = useParams();
  const location = useLocation();
  const agency = location.state?.agency;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const pendingMessagesRef = useRef(new Map());
  const [inviteToChat] = useInviteToChatMutation();

  // Fetch chat history and plans
  const { data, isLoading, error } = useGetChatHsitoryQuery(id);
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();

  // State for menu dropdown visibility
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState("");

  // Set initial tour plan from agency.tour_plan_id
  useEffect(() => {
    if (agency?.tour_plan_id && plansData) {
      const selectedPlan = plansData.find(
        (plan) => plan.id === agency.tour_plan_id && plan.status === "published"
      );
      if (selectedPlan) {
        setSelectedDropdown(agency.tour_plan_id.toString());
      }
    }
  }, [agency, plansData]);

  const dropdownOptions = (plansData || [])
    .filter((plan) => plan.status === "published")
    .map((plan) => ({
      value: plan.id,
      label: plan.location_to,
    }));

  // Reset messages when conversation ID changes
  useEffect(() => {
    setMessages([]);
    pendingMessagesRef.current.clear();
  }, [id]);

  // Initialize WebSocket
  useEffect(() => {
    const chat_url = chat_sockit(id);
    wsRef.current = new WebSocket(chat_url);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const received = JSON.parse(event.data);
        console.log("Received WebSocket message:", received);

        if (received.type === "message_history") {
          return;
        }

        if (received.type !== "chat_message") {
          return;
        }

        const inner = received.message;
        const tempId = received.tempId;

        const serverMessage = {
          id: inner.id,
          message_type: "text",
          text: inner.text,
          data: null,
          tour_plan_id: inner.tour_plan_id || null,
          tour_plan_title: inner.tour_plan_title || null,
          file_url: inner.file_url || null,
          isUser: String(inner.sender?.user_id) === userId,
          timestamp: new Date(inner.timestamp),
          is_read: inner.is_read,
          status: "sent",
        };

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === serverMessage.id)) {
            return prev;
          }

          if (
            serverMessage.isUser &&
            tempId &&
            pendingMessagesRef.current.has(tempId)
          ) {
            const updated = prev.map((msg) =>
              msg.tempId === tempId
                ? { ...serverMessage, tempId: undefined }
                : msg
            );
            pendingMessagesRef.current.delete(tempId);
            return updated;
          } else if (!serverMessage.isUser) {
            return [...prev, serverMessage];
          }
          return prev;
        });
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.status === "sending" ? { ...msg, status: "failed" } : msg
        )
      );
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id]);

  // Map fetched chat history to messages state
  const userId = localStorage.getItem("user_id");
  const userType = localStorage.getItem("role");
  useEffect(() => {
    if (data && Array.isArray(data.messages) && userId) {
      const formattedMessages = data.messages.map((msg) => ({
        id: msg.id,
        message_type: msg.message_type || "text",
        text: msg.text,
        data: msg.data || null,
        tour_plan_id: msg.tour_plan_id || null,
        tour_plan_title: msg.tour_plan_title || null,
        file_url: msg.file_url || null,
        isUser: String(msg.sender.user_id) === userId,
        timestamp: new Date(msg.timestamp),
        is_read: msg.is_read,
        status: "sent",
      }));
      setMessages((prev) => {
        const allMsgs = [...prev, ...formattedMessages];
        const uniqueMsgs = allMsgs.reduce((acc, msg) => {
          if (!acc[msg.id]) {
            acc[msg.id] = msg;
          }
          return acc;
        }, {});
        return Object.values(uniqueMsgs).sort(
          (a, b) => a.timestamp - b.timestamp
        );
      });
    }
  }, [data, userId, id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending text message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    if (!selectedDropdown && !agency?.tour_plan_id) {
      alert("Please select a tour plan first");
      return;
    }

    const tempId = uuidv4();
    const messageId = uuidv4();
    const tourPlan = dropdownOptions.find(
      (opt) => opt.value === selectedDropdown
    );
    const messageObj = {
      type: "chat_message",
      message: newMessage.trim(),
      tempId,
    };

    const localMessage = {
      id: messageId,
      message_type: "text",
      text: newMessage.trim(),
      data: null,
      tour_plan_id: selectedDropdown,
      tour_plan_title: tourPlan?.label || null,
      isUser: true,
      timestamp: new Date(),
      is_read: false,
      status: "sending",
      tempId,
    };
    setMessages((prev) => [...prev, localMessage]);
    pendingMessagesRef.current.set(tempId, localMessage);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
    }

    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle retrying a failed message
  const handleRetryMessage = (tempId) => {
    const message = pendingMessagesRef.current.get(tempId);
    if (!message) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === tempId ? { ...msg, status: "sending" } : msg
      )
    );

    const messageObj = {
      type: "chat_message",
      message: message.text,
      tempId,
    };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // Handle dropdown change and send start_conversation
  const handleDropdownChange = async (e) => {
    const selectedId = e.target.value;
    if (!agency?.other_user_id) {
      alert("Please select an agency and tour plan first");
      return;
    }
    setSelectedDropdown(selectedId);
    if (selectedId) {
      try {
        const tourPlan = dropdownOptions.find((opt) => opt.value == selectedId);
        const messageId = uuidv4();
        const tempId = uuidv4();
        const messageObj = {
          id: messageId,
          message_type: "start_conversation",
          message: `Conversation started regarding tour plan: ${
            tourPlan?.label || "Unknown"
          }`,
          data: null,
          tempId,
        };

        const localMessage = {
          id: messageId,
          message_type: "start_conversation",
          text: messageObj.message,
          data: new Date(),
          tour_plan_id: selectedId,
          tour_plan_title: tourPlan?.label || null,
          isUser: true,
          timestamp: new Date(),
          is_read: false,
          status: "sending",
          tempId,
        };
        setMessages((prev) => [...prev, localMessage]);
        pendingMessagesRef.current.set(tempId, localMessage);

        const res = await inviteToChat({
          tour_plan_id: Number(selectedId),
          other_user_id: agency.other_user_id,
        }).unwrap();

        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? {
                  ...msg,
                  id: res.id || msg.id,
                  status: "sent",
                  tempId: undefined,
                }
              : msg
          )
        );
        pendingMessagesRef.current.delete(tempId);
      } catch (err) {
        console.error("Failed to send start conversation:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId ? { ...msg, status: "failed" } : msg
          )
        );
        pendingMessagesRef.current.delete(tempId);
      }
    }
  };

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const navigate = useNavigate();
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  const handleViewDetails = () => {
    if (!agency?.tour_plan_id) {
      alert("Tourist has not provided a tour plan.");
      return;
    }
    navigate(`/tour-plans/${agency.tour_plan_id}`);
    setIsButtonVisible(false);
  };

  // Render message based on message_type
  const renderMessageContent = (message) => {
    switch (message.message_type) {
      case "text":
        return <p>{message.text}</p>;
      case "start_conversation":
        return (
          <p className="text-blue-600 italic">
            {message.text}{" "}
            {message.tour_plan_title && `(${message.tour_plan_title})`}
          </p>
        );
      default:
        return <p>Unknown message type: {message.text}</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col items-center justify-center">
        <h1 className="text-lg text-gray-800 dark:text-gray-100">Loading...</h1>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col items-center justify-center">
        <h1 className="text-lg text-gray-800 dark:text-gray-100">
          {error
            ? "Error loading chat history"
            : "Select an agency to start chatting"}
        </h1>
      </div>
    );
  }

  return (
    <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between space-x-4 p-3 border-b border-gray-200 rounded-tr-lg bg-white dark:bg-[#252c3b]">
        {/* {userType === "tourist" ? (
          <select
            className="bg-gray-100 dark:bg-[#1E232E] text-gray-800 dark:text-gray-200 rounded px-3 py-2 focus:outline-none"
            value={selectedDropdown}
            onChange={handleDropdownChange}
            disabled={plansLoading}
          >
            <option value="">Select Option</option>
            {dropdownOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <div>{agency.tour_plan_title || "No tour plan selected"}</div>
        )} */}
        <div></div>
        <div className="flex items-center space-x-2">
          <div className="relative" ref={menuRef}>
            <button
              className="bg-gray-100 hover:cursor-pointer dark:bg-[#1E232E] text-gray-800 dark:text-gray-200 px-3 text-2xl font-semibold rounded focus:outline-none"
              onClick={() => setMenuOpen((prev) => !prev)}
              type="button"
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#252c3b] border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E232E] hover:cursor-pointer"
                  onClick={handleViewDetails}
                >
                  View Tour Details
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E232E] hover:cursor-pointer"
                  onClick={handleViewDetails}
                >
                  Archived
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Messages Section */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id || message.tempId}>
            {message.isUser ? (
              <div className="flex justify-end space-x-2">
                <div className="max-w-xs bg-[#2F80A9] text-white rounded-lg p-3 text-md font-medium">
                  {renderMessageContent(message)}
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    {message.status === "sending" && (
                      <ClockIcon className="h-3 w-3 text-gray-300" />
                    )}
                    {message.status === "sent" && (
                      <CheckIcon className="h-3 w-3 text-green-300" />
                    )}
                    {message.status === "failed" && (
                      <button
                        onClick={() => handleRetryMessage(message.tempId)}
                        className="text-red-300 hover:text-red-400"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    )}
                    <span className="text-[8px] text-gray-300">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600">You</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={agency.image}
                    alt={agency.name}
                  />
                </div>
                <div className="max-w-xs bg-white dark:bg-[#1E232E] text-gray-800 dark:text-gray-200 rounded-lg p-3 text-md font-medium shadow-sm">
                  {renderMessageContent(message)}
                  <div className="flex justify-end">
                    <span className="text-[8px] text-gray-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Message input area */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 bg-transparent border-none focus:outline-none mx-3 text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            ref={inputRef}
          />
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={handleSendMessage}
          >
            <SendIcon className="h-5 w-5 cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Messages;
