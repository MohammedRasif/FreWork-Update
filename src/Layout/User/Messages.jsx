import { useState, useRef, useEffect } from "react";
import { SendIcon, ClockIcon, CheckIcon, XIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useAskForDiscountMutation,
  useGetChatHsitoryQuery,
  useGetPlansQuery,
  useInviteToChatMutation,
  useOfferDiscountMutation,
  useFinalOfferMutation,
  useAcceptFinalOfferMutation,
} from "@/redux/features/withAuth";
import { chat_sockit } from "@/assets/Socketurl";
import { v4 as uuidv4 } from "uuid";
import OfferDiscountForm from "@/components/OfferDiscount";
import FinalOfferForm from "@/components/FinalOffer";

function Messages() {
  const { id } = useParams();
  const location = useLocation();
  const agency = location.state;
  const [askDiscount, { isLoading: askDiscountLoading }] =
    useAskForDiscountMutation();
  const [offerDiscount, { isLoading: offerDiscountLoading }] =
    useOfferDiscountMutation();
  const [finalOffer, { isLoading: finalOfferLoading }] =
    useFinalOfferMutation();
  const [acceptFinalOffer, { isLoading: acceptFinalOfferLoading }] =
    useAcceptFinalOfferMutation();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const pendingMessagesRef = useRef(new Map());
  const [inviteToChat] = useInviteToChatMutation();

  // Offer discount form state
  const [isDiscountPopupOpen, setIsDiscountPopupOpen] = useState(false);
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [description, setDescription] = useState("");

  // Final offer form state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [startingDate, setStartingDate] = useState("");
  const [endingDate, setEndingDate] = useState("");
  const [totalMembers, setTotalMembers] = useState("");
  const [amount, setAmount] = useState("");
  const handleBack = () => {
    setIsPopupOpen(false);
  };

  // Fetch chat history and plans
  const { data, isLoading, error } = useGetChatHsitoryQuery(id);
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();

  // State for menu dropdown visibility
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState("");

  // Set initial tour plan from agency.agency.tour_plan_id
  useEffect(() => {
    if (agency?.agency?.tour_plan_id && plansData) {
      const selectedPlan = plansData.find(
        (plan) =>
          plan.id === agency.agency.tour_plan_id && plan.status === "published"
      );
      if (selectedPlan) {
        setSelectedDropdown(agency.agency.tour_plan_id.toString());
      }
    }
  }, [agency, plansData]);

  const dropdownOptions = (plansData || [])
    .filter((plan) => plan.status === "published")
    .map((plan) => ({
      value: plan.id,
      label: plan.location_to,
    }));

  // Initialize WebSocket
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
          message_type: message.message_type,
          text: message.text,
          data: message.data || null,
          tour_plan_id: message.tour_plan_id || null,
          tour_plan_title: message.tour_plan_title || null,
          isUser: false,
          timestamp: new Date(message.timestamp),
          is_read: message.is_read,
          status: "sent",
        };

        // Check if this is a confirmation of a pending message
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
        message_type: msg.message_type,
        text: msg.text,
        data: msg.data || null,
        tour_plan_id: msg.tour_plan_id || null,
        tour_plan_title: msg.tour_plan_title || null,
        isUser: msg.sender.user_id == userId,
        timestamp: new Date(msg.timestamp),
        is_read: msg.is_read,
        status: "sent",
        data: msg.data || null,
      }));
      setMessages(formattedMessages);
    }
  }, [data, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending text message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    if (!selectedDropdown && !agency.agency.tour_plan_id) {
      alert("Please select a tour plan first");
      return;
    }

    const tempId = uuidv4();
    const messageId = uuidv4();
    const tourPlan = dropdownOptions.find(
      (opt) => opt.value === selectedDropdown
    );
    const messageObj = {
      id: messageId,
      message: newMessage.trim(),
      data: null,
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
      id: message.id,
      message_type: message.message_type,
      tour_plan_id: message.tour_plan_id,
      tour_plan_title: message.tour_plan_title,
      text: message.text,
      data: message.data,
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
    if (!selectedId || !agency?.agency?.other_user_id) {
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

        // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        //   wsRef.current.send(JSON.stringify(messageObj));
        // }

        await inviteToChat({
          tour_plan_id: Number(selectedId),
          other_user_id: agency.agency.other_user_id,
        }).unwrap();
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

  // Handle ask for discount
  const askForDiscountHandler = async (planid) => {
    if (!planid || !id) {
      alert("Please select a plan first");
      return;
    }
    const tempId = uuidv4();
    const messageId = uuidv4();
    const tourPlan = dropdownOptions.find((opt) => opt.value === planid);
    const userEmail = localStorage.getItem("email") || "User";
    const messageObj = {
      id: messageId,
      message_type: "discount_request",
      tour_plan_id: planid,
      tour_plan_title: tourPlan?.label || null,
      text: `User is requesting a discount for tour plan ${
        tourPlan?.label || "Unknown"
      }`,
      data: null,
      tempId,
    };

    const localMessage = {
      id: messageId,
      message_type: "discount_request",
      text: messageObj.text,
      data: null,
      tour_plan_id: planid,
      tour_plan_title: tourPlan?.label || null,
      isUser: true,
      timestamp: new Date(),
      is_read: false,
      status: "sending",
      tempId,
    };
    setMessages((prev) => [...prev, localMessage]);
    pendingMessagesRef.current.set(tempId, localMessage);

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(messageObj));
      }
      const res = await askDiscount({ planid: planid, chatid: id }).unwrap();
      console.log("Discount request sent:", res);
    } catch (error) {
      console.error("Error sending discount request:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
      alert(
        error.data?.detail || "Failed to request discount. Please try again."
      );
    }
  };

  // Handle offer discount
  const offerDiscountHandler = async (planid, planTitle) => {
    if (!planid || !id) {
      alert("Please select a plan first");
      return;
    }

    const tempId = uuidv4();
    const messageId = uuidv4();
    const messageObj = {
      id: messageId,
      message_type: "discount_offer",
      message: `Discount offer for tour plan ${planTitle || "Unknown"}`,
      data: {
        type: discountType,
        value: discountValue,
        description: description,
      },
      tempId,
    };

    const localMessage = {
      id: messageId,
      message_type: "discount_offer",
      text: messageObj.message,
      data: {
        type: discountType,
        value: discountValue,
        description: description,
      },
      tour_plan_id: planid,
      tour_plan_title: planTitle || null,
      isUser: true,
      timestamp: new Date(),
      is_read: false,
      status: "sending",
      tempId,
    };
    setMessages((prev) => [...prev, localMessage]);
    pendingMessagesRef.current.set(tempId, localMessage);

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(messageObj));
      }
      const res = await offerDiscount({
        id,
        data: {
          discount_type: discountType,
          value: discountValue,
          description,
          tour_plan_id: planid,
        },
      }).unwrap();
      console.log("Discount offer sent successfully:", res);
      setIsDiscountPopupOpen(false);
      setDiscountType("percent");
      setDiscountValue("");
      setDescription("");
    } catch (error) {
      console.error("Error sending discount offer:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
      alert(
        error.data?.detail || "Failed to send discount offer. Please try again."
      );
    }
  };

  // Handle final offer
  const finalOfferHandler = async (planid, planTitle) => {
    if (!planid || !id) {
      alert("Please select a plan first");
      return;
    }

    const tempId = uuidv4();
    const messageId = uuidv4();
    const messageObj = {
      id: messageId,
      message_type: "final_offer",
      message: `Final offer for tour plan ${planTitle || "Unknown"}`,
      // data: {
      starting_date: startingDate,
      ending_date: endingDate,
      total_members: totalMembers,
      amount: amount,
      // },
      tempId,
    };

    const localMessage = {
      id: messageId,
      message_type: "final_offer",
      text: messageObj.message,
      data: {
        start_date: startingDate,
        end_date: endingDate,
        total_members: totalMembers,
        amount: amount,
      },
      tour_plan_id: planid,
      tour_plan_title: planTitle || null,
      isUser: true,
      timestamp: new Date(),
      is_read: false,
      status: "sending",
      tempId,
    };
    setMessages((prev) => [...prev, localMessage]);
    pendingMessagesRef.current.set(tempId, localMessage);

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(messageObj));
      }
      const res = await finalOffer({
        id,
        data: {
          start_date: startingDate,
          end_date: endingDate,
          total_members: Number(totalMembers),
          amount: Number(amount),
          tour_plan_id: planid,
        },
      }).unwrap();
      console.log("Final offer sent successfully:", res);
      setIsPopupOpen(false);
      setStartingDate("");
      setEndingDate("");
      setTotalMembers("");
      setAmount("");
    } catch (error) {
      console.error("Error sending final offer:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
      alert(
        error.data?.detail || "Failed to send final offer. Please try again."
      );
    }
  };

  const navigate = useNavigate();
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  const handleViewDetails = () => {
    navigate(`/tour-plans/${agency.agency.tour_plan_id}`);
    setIsButtonVisible(false);
  };


  // Handle accept final offer
  const acceptFinalOfferHandler = async (planid, messageId) => {
    if (!planid || !id) {
      alert("Please select a plan first");
      return;
    }
    const tempId = uuidv4();
    const newMessageId = uuidv4();
    const tourPlan = dropdownOptions.find((opt) => opt.value === planid);
    const messageObj = {
      id: newMessageId,
      message_type: "offer_accepted",
      message: `Final offer accepted for tour plan ${
        tourPlan?.label || "Unknown"
      }`,
      data: null,
      tempId,
    };

    const localMessage = {
      id: newMessageId,
      message_type: "offer_accepted",
      text: messageObj.message,
      data: null,
      tour_plan_id: planid,
      tour_plan_title: tourPlan?.label || null,
      isUser: true,
      timestamp: new Date(),
      is_read: false,
      status: "sending",
      tempId,
    };
    setMessages((prev) => [...prev, localMessage]);
    pendingMessagesRef.current.set(tempId, localMessage);

    try {
      // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      //   wsRef.current.send(JSON.stringify(messageObj));
      // }
      // const res = await acceptFinalOffer({
      //   id,
      //   data: {
      //     tour_plan_id: planid,
      //     message_id: messageId,
      //   },
      // }).unwrap();
      const res = await acceptFinalOffer({
        id
      }).unwrap();
      console.log("Final offer accepted successfully:", res);
    } catch (error) {
      console.error("Error accepting final offer:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      pendingMessagesRef.current.delete(tempId);
      alert(
        error.data?.detail || "Failed to accept final offer. Please try again."
      );
    }
  };

  // Handle offer accepted (for discount_offer)
  const handleOfferAccepted = (planid, messageId) => {
    if (!planid || !id) {
      alert("Please select a plan first");
      return;
    }
    const tempId = uuidv4();
    const newMessageId = uuidv4();
    const tourPlan = dropdownOptions.find((opt) => opt.value === planid);
    const messageObj = {
      id: newMessageId,
      message_type: "offer_accepted",
      message: `Offer accepted for tour plan ${tourPlan?.label || "Unknown"}`,
      data: null,
      tempId,
    };

    const localMessage = {
      id: newMessageId,
      message_type: "offer_accepted",
      text: messageObj.message,
      data: null,
      tour_plan_id: planid,
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
  };

  const openDiscountModal = () => {
    if (!agency.agency.tour_plan_id) {
      alert("Please select a plan first");
      return;
    }
    setIsDiscountPopupOpen(true);
  };

  const openFinalOfferModal = () => {
    if (!agency.agency.tour_plan_id) {
      alert("Please select a plan first");
      return;
    }
    setIsPopupOpen(true);
  };

  const closeDiscountModal = () => {
    setIsDiscountPopupOpen(false);
    setDiscountType("percent");
    setDiscountValue("");
    setDescription("");
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
      case "discount_request":
        return (
          <p className="text-[#922020]">
            {message.text}{" "}
            {message.tour_plan_title && `(${message.tour_plan_title})`}
          </p>
        );
      case "discount_offer":
        return (
          <>
            <p className="text-green-600">
              {message.text}{" "}
              {message.tour_plan_title && `(${message.tour_plan_title})`}
            </p>
            {message.data && (
              <>
                <p>Discount Type: {message.data.type}</p>
                <p>Discount Value: {message.data.value}</p>
                <p>Description: {message.data.description}</p>
              </>
            )}
            {userType === "tourist" && (
              <button
                onClick={() =>
                  handleOfferAccepted(message.tour_plan_id, message.id)
                }
                className="mt-2 bg-green-500 hover:cursor-pointer hover:bg-green-400 text-white px-2 py-1 rounded text-sm"
              >
                Accept Offer
              </button>
            )}
          </>
        );
      case "final_offer":
        return (
          <div>
            <p className="text-purple-600">
              To : {message.text}{" "}
              {message.tour_plan_title && `(${message.tour_plan_title})`}
              {/* {console.log(message, message.data, "final message")} */}
            </p>
            {message.data && (
              <>
                <p>Start Date: {message.data.start_date}</p>
                <p>End Date: {message.data.end_date}</p>
                <p>Cost: {message.data.amount}$</p>
              </>
            )}
            {userType === "tourist" &&
              message.tour_plan_id == selectedDropdown && (
                <button
                  onClick={() =>
                    acceptFinalOfferHandler(message.tour_plan_id, message.id)
                  }
                  disabled={message.data && message.data.is_accepted}
                  className="mt-2 bg-green-500 hover:bg-green-400 hover:cursor-pointer text-white px-2 py-1 rounded text-sm disabled:bg-gray-600 disabled:text-gray-300 disabled:hover:cursor-not-allowed"
                >
                  Accept Final Offer
                  {console.log(agency.agency.tour_plan_id == selectedDropdown)}
                </button>
              )}
          </div>
        );
      case "offer_accepted":
        return (
          <p className="text-green-600">
            {message.text}{" "}
            {message.tour_plan_title && `(${message.tour_plan_title})`}
          </p>
        );
      default:
        return <p>Unknown message type</p>;
    }
  };

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
      {/* Header Section */}
      <div className="flex items-center justify-between space-x-4 p-3 border-b border-gray-200 rounded-tr-lg bg-white dark:bg-[#252c3b]">
        {userType === "tourist" ? (
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
          <div>
            {agency.agency.tour_plan_title || "no tour plan is selected"}
          </div>
        )}
        <div className="flex items-center space-x-2">
          {userType === "tourist" ? (
            <button
              onClick={() => askForDiscountHandler(selectedDropdown)}
              className="bg-blue-500 hover:bg-blue-400 hover:cursor-pointer text-white px-4 py-2 rounded font-medium text-sm"
              disabled={askDiscountLoading}
            >
              Ask for Discount
            </button>
          ) : (
            <>
              <button
                onClick={openDiscountModal}
                className="bg-blue-500 hover:bg-blue-400 hover:cursor-pointer text-white px-4 py-2 rounded font-medium text-sm"
                disabled={offerDiscountLoading || finalOfferLoading}
              >
                Offer Discount
              </button>
              <button
                onClick={openFinalOfferModal}
                className="bg-purple-500 hover:bg-purple-400 hover:cursor-pointer text-white px-4 py-2 rounded font-medium text-sm"
                disabled={offerDiscountLoading || finalOfferLoading}
              >
                Final Offer
              </button>
            </>
          )}
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
                {/* <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-[#1E232E] hover:cursor-pointer">
                  Cancel the Discussion
                </button> */}
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
                    src={agency.agency.image}
                    alt={agency.agency.name}
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
      <OfferDiscountForm
        isOpen={isDiscountPopupOpen}
        discountType={discountType}
        discountValue={discountValue}
        description={description}
        onDiscountTypeChange={setDiscountType}
        onDiscountValueChange={setDiscountValue}
        onDescriptionChange={setDescription}
        onClose={closeDiscountModal}
        onConfirm={() =>
          offerDiscountHandler(
            agency.agency.tour_plan_id,
            agency.agency.tour_plan_title
          )
        }
      />
      <FinalOfferForm
        isOpen={isPopupOpen}
        startingDate={startingDate}
        endingDate={endingDate}
        totalMembers={totalMembers}
        amount={amount}
        onStartingDateChange={setStartingDate}
        onEndingDateChange={setEndingDate}
        onTotalMembersChange={setTotalMembers}
        onAmountChange={setAmount}
        onBack={handleBack}
        onConfirm={() =>
          finalOfferHandler(
            agency.agency.tour_plan_id,
            agency.agency.tour_plan_title
          )
        }
      />
    </div>
  );
}

export default Messages;
