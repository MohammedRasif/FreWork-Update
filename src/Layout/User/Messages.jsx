import { useState, useRef, useEffect } from "react";
import {
  SendIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  PaperclipIcon,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useArchivedUserMutation,
  useFinalOfferResponseMutation,
  useGetChatHsitoryQuery,
  useGetChatListQuery,
  useGetPlansQuery,
  useInviteToChatMutation,
  useMessageSentMutation,
} from "@/redux/features/withAuth";
import { chat_sockit } from "@/assets/Socketurl";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

const FILE_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://cool-haupia-b694eb.netlify.app"; 
function Messages() {
  const { id } = useParams();
  console.log(id);
  const userId = localStorage.getItem("user_id");
  const location = useLocation();
  const navigate = useNavigate();
  const agency = location.state?.agency;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // Retaining for existing logic, though redundant now
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const pendingMessagesRef = useRef(new Map());
  const [inviteToChat] = useInviteToChatMutation();
  const [archivedUser] = useArchivedUserMutation();
  const [finalOfferResponse] = useFinalOfferResponseMutation();
  const [sentMessage] = useMessageSentMutation();

  const {
    data: chatList,
    isLoading: isChatListLoading,
    refetch: refetchChatList,
  } = useGetChatListQuery();
  const { data, isLoading, error } = useGetChatHsitoryQuery(id);

  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // State for menu dropdown visibility
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const [isConversationArchived, setIsConversationArchived] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true); // Retained state

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

  // Update isConversationArchived based on chatList
  useEffect(() => {
    if (chatList && Array.isArray(chatList)) {
      const currentChat = chatList.find((chat) => chat.id?.toString() === id);
      setIsConversationArchived(currentChat?.is_archived || false);
    }
  }, [chatList, id]);

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
    setSelectedFile(null);
  }, [id]);

  // Initialize WebSocket
  useEffect(() => {
    const chat_url = chat_sockit(id);
    wsRef.current = new WebSocket(chat_url);

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

        const inner = received.message || received;

        // Determine message type
        let messageType = "text";
        if (inner.file) {
          messageType = "file";
        } else if (inner.message_type) {
          messageType = inner.message_type;
        }

        const serverMessage = {
          id: inner.id,
          message_type: messageType,
          text: inner.text || null,
          data: null,
          tour_plan_id: inner.tour_plan_id || null,
          tour_plan_title: inner.tour_plan_title || null,
          file: inner.file || inner.file_url || null,
          isUser: String(inner.sender?.user_id) === userId,
          timestamp: new Date(inner.timestamp),
          is_read: inner.is_read,
          status: "sent",
        };

        setMessages((prev) => {
          if (serverMessage.isUser) {
            const matchingPending = Array.from(
              pendingMessagesRef.current.values()
            ).find(
              (pm) =>
                pm.message_type === serverMessage.message_type &&
                (pm.text === serverMessage.text ||
                  (pm.text === null && serverMessage.text === null)) &&
                Math.abs(
                  pm.timestamp.getTime() - serverMessage.timestamp.getTime()
                ) < 2000
            );

            if (matchingPending) {
              // Update the pending message with server ID and status, don't add new
              return prev.map((msg) =>
                msg.tempId === matchingPending.tempId
                  ? {
                      ...msg,
                      id: serverMessage.id,
                      status: "sent",
                      tempId: undefined,
                    }
                  : msg
              );
            }
          }

          // If no match or not user's message, add if it doesn't exist
          const exists = prev.some((msg) => msg.id === serverMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, serverMessage].sort(
            (a, b) => a.timestamp - b.timestamp
          );
        });
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id, userId]);

  useEffect(() => {
    if (data && Array.isArray(data.messages) && userId) {
      const formattedMessages = data.messages.map((msg) => ({
        id: msg.id,
        message_type: msg.message_type || (msg.file ? "file" : "text"),
        text: msg.text,
        data: msg.data || null,
        tour_plan_id: msg.tour_plan_id || null,
        tour_plan_title: msg.tour_plan_title || null,
        file: msg.file
          ? msg.file.startsWith("http")
            ? msg.file
            : `${FILE_BASE_URL}${msg.file}`
          : null,
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

  // Handle file selection and auto-send
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Auto-send the file
      if (!selectedDropdown && !agency?.tour_plan_id) {
        alert("Please select a tour plan first");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const tempId = uuidv4();
      const messageId = uuidv4();
      const tourPlan = dropdownOptions.find(
        (opt) => opt.value === selectedDropdown
      );

      // Create a local preview URL for ALL file types
      const filePreviewUrl = URL.createObjectURL(file);

      // Use the actual file object or its name for local rendering
      const localFileName = file.name;

      const localMessage = {
        id: messageId,
        message_type: "file",
        text: null, // No text in this path
        data: null,
        tour_plan_id: selectedDropdown,
        tour_plan_title: tourPlan?.label || null,
        // Use the local object URL for preview (image or generic file link)
        file: filePreviewUrl,
        // Store the original file object or name for temporary display
        localFileName: localFileName,
        isUser: true,
        timestamp: new Date(),
        is_read: false,
        status: "sending",
        tempId,
      };

      setMessages((prev) => [...prev, localMessage]);
      pendingMessagesRef.current.set(tempId, localMessage);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await sentMessage({
          id: Number(id),
          data: formData,
        }).unwrap();

        // Clean up preview URL
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? {
                  ...msg,
                  id: response.id || msg.id,
                  file: response.file
                    ? response.file.startsWith("http")
                      ? response.file
                      : `${FILE_BASE_URL}${response.file}`
                    : null,
                  text: response.text || null,
                  status: "sent",
                  tempId: undefined,
                  localFileName: undefined, // Clean up local file name
                }
              : msg
          )
        );
        pendingMessagesRef.current.delete(tempId);
      } catch (error) {
        console.error("Failed to send file message:", error);
        toast.error("Failed to send file message");
        // Clean up preview URL on failure
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? { ...msg, status: "failed", localFileName: undefined }
              : msg
          )
        );
        pendingMessagesRef.current.delete(tempId);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      inputRef.current?.focus();
    }
  };

  // Handle sending text message
  const handleSendMessage = async () => {
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

    const localMessage = {
      id: messageId,
      message_type: "text",
      text: newMessage.trim(),
      data: null,
      tour_plan_id: selectedDropdown,
      tour_plan_title: tourPlan?.label || null,
      file: null,
      isUser: true,
      timestamp: new Date(),
      is_read: false,
      status: "sending",
      tempId,
    };

    setMessages((prev) => [...prev, localMessage]);
    pendingMessagesRef.current.set(tempId, localMessage);

    const formData = new FormData();
    formData.append("text", newMessage.trim());

    try {
      const response = await sentMessage({
        id: Number(id),
        data: formData,
      }).unwrap();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId
            ? {
                ...msg,
                id: response.id || msg.id,
                status: "sent",
                tempId: undefined,
              }
            : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
    } catch (error) {
      console.error("Failed to send text message:", error);
      toast.error("Failed to send text message");
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

  // Handle accept final offer
  const handleAcceptFinalOffer = async () => {
    setIsAccepting(true);
    try {
      await finalOfferResponse({
        id: Number(id),
        data: { is_accepted: true },
      }).unwrap();
      toast.success("Final offer accepted successfully");
    } catch (error) {
      console.error("Failed to accept final offer:", error);
      toast.error("Failed to accept final offer");
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle decline final offer
  const handleDeclineFinalOffer = async () => {
    setIsDeclining(true);
    try {
      await finalOfferResponse({
        id: Number(id),
        data: { is_accepted: false },
      }).unwrap();
      toast.success("Final offer declined successfully");
    } catch (error) {
      console.error("Failed to decline final offer:", error);
      toast.error("Failed to decline final offer");
    } finally {
      setIsDeclining(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetryMessage = async (tempId) => {
    const message = pendingMessagesRef.current.get(tempId);
    if (!message) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.tempId === tempId ? { ...msg, status: "sending" } : msg
      )
    );

    const formData = new FormData();
    formData.append("text", message.text);
    // formData.append("tour_plan_id", message.tour_plan_id); // Assuming sentMessage API handles context

    try {
      const response = await sentMessage({
        id: Number(id),
        data: formData,
      }).unwrap();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId
            ? {
                ...msg,
                id: response.id || msg.id,
                file: response.file
                  ? response.file.startsWith("http")
                    ? response.file
                    : `${FILE_BASE_URL}${response.file}`
                  : msg.file,
                status: "sent",
                tempId: undefined,
              }
            : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
    } catch (error) {
      console.error("Failed to retry message:", error);
      toast.error("Failed to retry message");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
    }
  };

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
        const messageText = `Conversation started regarding tour plan: ${
          tourPlan?.label || "Unknown"
        }`;

        const localMessage = {
          id: messageId,
          message_type: "start_conversation",
          text: messageText,
          data: new Date(),
          tour_plan_id: selectedId,
          tour_plan_title: tourPlan?.label || null,
          file: null,
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

  const handleViewDetails = () => {
    if (!agency?.tour_plan_id) {
      alert("Tourist has not provided a tour plan.");
      return;
    }
    navigate(`/tour-plans/${agency.tour_plan_id}`);
    setIsButtonVisible(false); // Does not affect rendering in the current structure
  };

  const handleArchiveConversation = async () => {
    try {
      await archivedUser({ id, is_archived: !isConversationArchived }).unwrap();
      setMenuOpen(false);
      toast.success(
        isConversationArchived
          ? "Conversation unarchived successfully"
          : "Conversation archived successfully"
      );
      await refetchChatList();
      navigate(
        location.pathname.includes("/admin/") ? "/admin/chat" : "/user/chat"
      );
    } catch (err) {
      console.error(
        `Failed to ${
          isConversationArchived ? "unarchive" : "archive"
        } conversation:`,
        err
      );
      toast.error(
        `Failed to ${
          isConversationArchived ? "unarchive" : "archive"
        } conversation`
      );
    }
  };

  const getFileExtension = (url) =>
    url.split("?")[0].split(".").pop().toLowerCase();
  const getFileName = (url) => url.split("/").pop().split("?")[0];

  /**
   * Renders the content of a single message, supporting text, file, or both.
   * This is the function that was updated to meet the user's request.
   */
  const renderMessageContent = (message) => {
    const fileExt = message.file ? getFileExtension(message.file) : "";
    const isImageFile =
      message.file &&
      (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt) ||
        message.file.startsWith("blob:")); // Check for both actual extension and local blob URLs

    // --- UPDATED LOGIC TO RENDER BOTH TEXT AND FILE ---
    if (message.text || message.file) {
      return (
        <>
          {/* 1. Render Text Content if it exists */}
          {message.text && (
            <p className={message.file ? "mb-2 break-words" : "break-words"}>
              {message.text}
            </p>
          )}

          {/* 2. Render File/Image Content if it exists */}
          {message.file && (
            <div>
              {isImageFile ? (
                // Display Image
                <img
                  src={message.file}
                  alt={message.localFileName || "Attachment"} // Use localFileName for pending
                  className="max-w-full h-auto rounded"
                  style={{ maxWidth: "200px" }}
                />
              ) : (
                // Display Link for PDF/Other Files
                <div className="flex items-center space-x-2 pt-1">
                  <PaperclipIcon className="h-4 w-4 shrink-0" />
                  <a
                    href={message.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${
                      message.isUser
                        ? "text-white underline"
                        : "text-blue-500 hover:underline"
                    } truncate max-w-[calc(100%-20px)] text-sm`}
                    title={message.localFileName || getFileName(message.file)}
                  >
                    {message.localFileName || getFileName(message.file)}
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      );
    }
    // --- END UPDATED LOGIC ---

    // Fallback for system messages or empty data (though 'start_conversation' is handled in the map)
    return <p>Unknown content.</p>;
  };

  if (isLoading || isChatListLoading) {
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

  const currentChat = chatList?.find((chat) => chat.id?.toString() === id);

  return (
    <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between space-x-4 p-3 border-b border-gray-200 rounded-tr-lg bg-white dark:bg-[#252c3b]">
        {/* Empty div for spacing/alignment with the right side */}
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
                  onClick={handleArchiveConversation}
                >
                  {isConversationArchived
                    ? "Unarchive Conversation"
                    : "Archive Conversation"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Messages Section */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto relative">
        {messages.map((message) => {
          // Filter out messages that should not be visible as bubbles
          if (
            !message.text &&
            !message.file &&
            message.message_type !== "start_conversation" &&
            message.message_type !== "final_offer_sent" // Added a check for system-only types if they were hidden before
          ) {
            return null;
          }

          // Render 'start_conversation' (and other system messages if needed) as a system message
          if (message.message_type === "start_conversation") {
            return (
              <div
                key={message.id || message.tempId}
                className="flex justify-center w-full"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full italic max-w-sm text-center">
                  {message.text}
                </div>
              </div>
            );
          }

          return (
            <div key={message.id || message.tempId}>
              {message.isUser ? (
                // User's Message (Right Side)
                <div className="flex justify-end space-x-2">
                  <div className="max-w-xs bg-[#2F80A9] text-white rounded-lg p-3 text-md font-medium shadow-md">
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
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                    <span className="text-xs text-gray-600">You</span>
                  </div>
                </div>
              ) : (
                // Agency's Message (Left Side)
                <div className="flex items-start space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={agency.image}
                      alt={agency.name}
                    />
                  </div>
                  <div className="max-w-xs bg-white dark:bg-[#1E232E] text-gray-800 dark:text-gray-200 rounded-lg p-3 text-md font-medium shadow-sm">
                    {renderMessageContent(message)}
                    {/* Time is often omitted on the left side, or placed below the bubble content */}
                  </div>
                </div>
              )}
            </div>
          );
        })}
       <div ref={messagesEndRef} />
        {currentChat?.final_offer_sent === true &&
  currentChat?.deal_status !== null &&
  currentChat?.deal_status === false && (
    <div className="absolute bottom-5 right-3/7 flex flex-col space-y-2">
      <button
        onClick={handleAcceptFinalOffer}
        disabled={isAccepting}
        className={`border px-4 py-1 rounded-full text-white ${
          isAccepting
            ? "bg-green-300 cursor-not-allowed"
            : "bg-[#2F80A9] hover:bg-[#256f8c] cursor-pointer"
        }`}
      >
        {isAccepting ? "Accepting..." : "Accept final offer"}
      </button>

      <button
        onClick={handleDeclineFinalOffer}
        disabled={isDeclining}
        className={`border px-4 py-1 rounded-full text-white ${
          isDeclining
            ? "bg-red-300 cursor-not-allowed"
            : "bg-[#2F80A9] hover:bg-[#256f8c] cursor-pointer"
        }`}
      >
        {isDeclining ? "Declining..." : "Decline final offer"}
      </button>
    </div>
  )}

      </div>
      {/* Message input area */}
      <div className="border-t border-gray-200 p-3 bg-white dark:bg-[#252c3b] dark:border-gray-700">
        <div className="flex items-center bg-gray-100 dark:bg-[#1E232E] rounded-full px-4 py-2">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <PaperclipIcon className="h-5 w-5 cursor-pointer" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <input
            type="text"
            placeholder="Type a message or select a file"
            className="flex-1 bg-transparent border-none focus:outline-none mx-3 text-sm text-gray-800 dark:text-gray-200"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            ref={inputRef}
            disabled={!!currentChat?.final_offer_response}
          />
          <button
            className={`transition-colors duration-200 ${
              newMessage.trim() === "" || currentChat?.final_offer_response
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            }`}
            onClick={handleSendMessage}
            disabled={
              newMessage.trim() === "" || !!currentChat?.final_offer_response
            }
          >
            <SendIcon className="h-5 w-5 cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Messages;
