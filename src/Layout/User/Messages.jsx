import { useState, useRef, useEffect } from "react";
import { SendIcon, ClockIcon, CheckIcon, XIcon } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
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
  const agency = location.state;
  console.log("Agency:", agency);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const pendingMessagesRef = useRef(new Map());
  const [inviteToChat] = useInviteToChatMutation();

  const { data, isLoading, error } = useGetChatHsitoryQuery(id);
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState("");

  const dropdownOptions = (plansData || [])
    .filter((plan) => plan.status === "published")
    .map((plan) => ({
      value: plan.id,
      label: plan.location_to,
    }));

  useEffect(() => {
    const chat_url = chat_sockit(id);
    wsRef.current = new WebSocket(chat_url);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received WebSocket message:", message);
        const serverMessage = {
          id: message.id,
          text: message.message_type === "text" ? message.text : null,
          isUser: false,
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
          is_read: message.is_read,
          status: "sent",
        };

        const tempId = message.tempId;
        if (tempId && pendingMessagesRef.current.has(tempId)) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId
                ? { ...serverMessage, tempId: msg.tempId }
                : msg
            )
          );
          pendingMessagesRef.current.delete(tempId);
        } else {
          setMessages((prev) => [...prev, serverMessage]);
        }
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
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        wsRef.current = new WebSocket(chat_url);
      }, 5000);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id]);

  useEffect(() => {
    if (Array.isArray(data)) {
      console.log(data, "Chat history data received");
      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        text: msg.message_type === "text" ? msg.text : null,
        isUser: msg.sender?.role !== "agency" ?? true,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        is_read: msg.is_read,
        status: "sent",
      }));
      console.log("Formatted chat history:", formattedMessages);
      setMessages(formattedMessages);
    } else {
      console.warn("Chat history data is not an array or is null/undefined:", data);
      setMessages([]);
    }
  }, [data]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const tempId = uuidv4();
    const messageObj = {
      message: newMessage.trim(),
      tempId,
    };

    const localMessage = {
      text: newMessage.trim(),
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

  const handleRetryMessage = (tempId) => {
    const message = pendingMessagesRef.current.get(tempId);
    if (!message) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === tempId ? { ...msg, status: "sending" } : msg
      )
    );

    const messageObj = {
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

  const handleDropdownChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedDropdown(selectedId);
    if (selectedId) {
      try {
        await inviteToChat({ selected_tour_id: selectedId });
      } catch (err) {
        console.error("Failed to send selected tour id:", err);
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col items-center justify-center">
        <h1 className="text-lg text-gray-800 dark:text-gray-100">Loading...</h1>
      </div>
    );
  }

  if (error || !agency || !agency.agency) {
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
      <div className="flex items-center justify-between space-x-4 p-3 border-b border-gray-200 rounded-tr-lg bg-white dark:bg-[#252c3b]">
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
        <div className="flex items-center space-x-2">
          <button className="bg-blue-500 hover:bg-blue-400 hover:cursor-pointer text-white px-4 py-2 rounded font-medium text-sm">
            Ask for Discount
          </button>
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
                <button className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E232E] hover:cursor-pointer">
                  View Tour Details
                </button>
                <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-[#1E232E] hover:cursor-pointer">
                  Cancel the Discussion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id || message.tempId}>
              {message.isUser ? (
                <div className="flex justify-end space-x-2">
                  <div className="max-w-xs bg-[#2F80A9] text-white rounded-lg p-3 text-md font-medium">
                    {message.text && <p>{message.text}</p>}
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
                      src={agency.agency.image}
                      alt={agency.agency.name}
                    />
                  </div>
                  <div className="max-w-xs bg-white dark:bg-[#1E232E] text-gray-800 dark:text-gray-200 rounded-lg p-3 text-md font-medium shadow-sm">
                    {message.text && <p>{message.text}</p>}
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
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