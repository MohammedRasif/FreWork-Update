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
  useGetChatListQuery,
  useGetPlansQuery,
  useInviteToChatMutation,
  useMessageSentMutation,
  useRejectOfferMutation,
  useShowMessagesQuery,
} from "@/redux/features/withAuth";
import { chat_sockit } from "@/assets/Socketurl";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { HiOutlineDotsVertical } from "react-icons/hi";

const FILE_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://cool-haupia-b694eb.netlify.app";

function Messages() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const userId = localStorage.getItem("user_id");
  const location = useLocation();
  const navigate = useNavigate();
  const agency = location.state?.agency;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
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
    data: messagesData,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useShowMessagesQuery(id);

  const {
    data: chatList,
    isLoading: isChatListLoading,
    refetch: refetchChatList,
  } = useGetChatListQuery();

  const [rejectOffer] = useRejectOfferMutation();
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const [isConversationArchived, setIsConversationArchived] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState("");

  const rejectReasons = [
    { label: "Prezzo troppo alto", value: "Prezzo troppo alto", tKey: "preza" },
    {
      label: "Offerta poco chiara",
      value: "Offerta poco chiara",
      tKey: "offerta",
    },
    {
      label: "Destinazione inadatta",
      value: "Destinazione inadatta",
      tKey: "destinazioan",
    },
    { label: "Solo valutazione", value: "Solo valutazione", tKey: "solo" },
    {
      label: "Ho scelto un'altra proposta",
      value: "Ho scelto un'altra proposta",
      tKey: "scelto",
    },
  ];

  useEffect(() => {
    if (!agency && id && chatList && !isChatListLoading) {
      const currentChat = chatList.find((chat) => chat.id?.toString() === id);
      if (currentChat) {
        const basePath = location.pathname.includes("/admin/")
          ? "/admin/chat"
          : "/user/chat";

        const agencyData = {
          id: currentChat.id?.toString() || "",
          name: currentChat.other_participant_name || t("unknown_user"),
          image:
            currentChat.other_participant_image ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png",
          other_user_id: currentChat.other_user_id || null,
          tour_plan_id: currentChat.tour_plan_id || null,
          tour_plan_title: currentChat.tour_plan_title || t("no_tour_plan"),
          is_archived: currentChat.is_archived || false,
        };

        navigate(`${basePath}/${id}`, {
          state: { agency: agencyData },
          replace: true,
        });
      }
    }
  }, [
    agency,
    id,
    chatList,
    isChatListLoading,
    navigate,
    navigate,
    location.pathname,
    t,
  ]);

  useEffect(() => {
    if (agency?.tour_plan_id && plansData) {
      const selectedPlan = plansData.find(
        (plan) =>
          plan.id === agency.tour_plan_id && plan.status === "published",
      );
      if (selectedPlan) {
        setSelectedDropdown(agency.tour_plan_id.toString());
      }
    }
  }, [agency, plansData]);

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

  useEffect(() => {
    setMessages([]);
    pendingMessagesRef.current.clear();
    setSelectedFile(null);
  }, [id]);

  useEffect(() => {
    const chat_url = chat_sockit(id);
    wsRef.current = new WebSocket(chat_url);

    wsRef.current.onmessage = (event) => {
      try {
        const received = JSON.parse(event.data);
        if (received.type !== "chat_message") return;

        const inner = received.message || received;
        let messageType = "text";
        if (inner.file) messageType = "file";
        else if (inner.message_type) messageType = inner.message_type;

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
              pendingMessagesRef.current.values(),
            ).find(
              (pm) =>
                pm.message_type === serverMessage.message_type &&
                (pm.text === serverMessage.text ||
                  (pm.text === null && serverMessage.text === null)) &&
                Math.abs(
                  pm.timestamp.getTime() - serverMessage.timestamp.getTime(),
                ) < 10000,
            );

            if (matchingPending) {
              return prev.map((msg) =>
                msg.tempId === matchingPending.tempId
                  ? {
                      ...msg,
                      id: serverMessage.id,
                      status: "sent",
                      tempId: undefined,
                    }
                  : msg,
              );
            }
          }

          const exists = prev.some((msg) => msg.id === serverMessage.id);
          if (exists) return prev;
          return [...prev, serverMessage].sort(
            (a, b) => a.timestamp - b.timestamp,
          );
        });
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [id, userId]);

  useEffect(() => {
    if (
      messagesData?.messages &&
      Array.isArray(messagesData.messages) &&
      userId
    ) {
      const formattedMessages = messagesData.messages.map((msg) => ({
        id: msg.id,
        message_type:
          msg.message_type || (msg.file || msg.file_url ? "file" : "text"),
        text: msg.text || null,
        data: msg.data || null,
        tour_plan_id: msg.tour_plan_id || null,
        tour_plan_title: msg.tour_plan_title || null,
        file:
          msg.file || msg.file_url
            ? (msg.file || msg.file_url).startsWith("http")
              ? msg.file || msg.file_url
              : `${FILE_BASE_URL}${msg.file || msg.file_url}`
            : null,
        isUser: String(msg.sender?.user_id) === userId,
        timestamp: new Date(msg.timestamp),
        is_read: msg.is_read,
        status: "sent",
      }));
      setMessages((prev) => {
        const allMsgs = [...prev, ...formattedMessages];
        const uniqueMsgs = allMsgs.reduce((acc, msg) => {
          if (!acc[msg.id]) acc[msg.id] = msg;
          return acc;
        }, {});
        return Object.values(uniqueMsgs).sort(
          (a, b) => a.timestamp - b.timestamp,
        );
      });
    }
  }, [messagesData, userId, id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!selectedDropdown && !agency?.tour_plan_id) {
        alert(t("select_tour_plan_first"));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const tempId = uuidv4();
      const messageId = uuidv4();
      const tourPlan = dropdownOptions.find(
        (opt) => opt.value === selectedDropdown,
      );

      const filePreviewUrl = URL.createObjectURL(file);
      const localFileName = file.name;

      const localMessage = {
        id: messageId,
        message_type: "file",
        text: null,
        data: null,
        tour_plan_id: selectedDropdown,
        tour_plan_title: tourPlan?.label || null,
        file: filePreviewUrl,
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

        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

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
                  localFileName: undefined,
                }
              : msg,
          ),
        );
        pendingMessagesRef.current.delete(tempId);
      } catch (error) {
        console.error("Failed to send file message:", error);
        toast.error(t("failed_send_file"));
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? { ...msg, status: "failed", localFileName: undefined }
              : msg,
          ),
        );
        pendingMessagesRef.current.delete(tempId);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
      inputRef.current?.focus();
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    if (!selectedDropdown && !agency?.tour_plan_id) {
      alert(t("select_tour_plan_first"));
      return;
    }

    const tempId = uuidv4();
    const messageId = uuidv4();
    const tourPlan = dropdownOptions.find(
      (opt) => opt.value === selectedDropdown,
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
            : msg,
        ),
      );
      pendingMessagesRef.current.delete(tempId);
    } catch (error) {
      console.error("Failed to send text message:", error);
      toast.error(t("failed_send_text"));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg,
        ),
      );
      pendingMessagesRef.current.delete(tempId);
    }

    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleAcceptFinalOffer = async () => {
    setIsAccepting(true);
    try {
      await finalOfferResponse({
        id: Number(id),
        data: { is_accepted: true },
      }).unwrap();
      toast.success(t("final_offer_accepted"));
    } catch (error) {
      console.error("Failed to accept final offer:", error);
      toast.error(t("failed_accept_offer"));
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineFinalOffer = async () => {
    setIsDeclining(true);
    try {
      await finalOfferResponse({
        id: Number(id),
        data: { is_accepted: false },
      }).unwrap();
      toast.success(t("final_offer_declined"));
    } catch (error) {
      console.error("Failed to decline final offer:", error);
      toast.error(t("failed_decline_offer"));
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
        msg.tempId === tempId ? { ...msg, status: "sending" } : msg,
      ),
    );

    const formData = new FormData();
    formData.append("text", message.text);

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
            : msg,
        ),
      );
      pendingMessagesRef.current.delete(tempId);
    } catch (error) {
      console.error("Failed to retry message:", error);
      toast.error(t("failed_retry_message"));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg,
        ),
      );
      pendingMessagesRef.current.delete(tempId);
    }
  };

  const handleDropdownChange = async (e) => {
    const selectedId = e.target.value;
    if (!agency?.other_user_id) {
      alert(t("select_agency_and_plan"));
      return;
    }
    setSelectedDropdown(selectedId);
    if (selectedId) {
      try {
        const tourPlan = dropdownOptions.find((opt) => opt.value == selectedId);
        const messageId = uuidv4();
        const tempId = uuidv4();
        const messageText = t("conversation_started", {
          plan: tourPlan?.label || t("unknown"),
        });

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
              : msg,
          ),
        );
        pendingMessagesRef.current.delete(tempId);
      } catch (err) {
        console.error("Failed to send start conversation:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId ? { ...msg, status: "failed" } : msg,
          ),
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
      alert(t("no_tour_plan_provided"));
      return;
    }
    navigate(`/tour-plans/${agency.tour_plan_id}`);
    setIsButtonVisible(false);
  };

  const handleArchiveConversation = async () => {
    try {
      await archivedUser({ id, is_archived: !isConversationArchived }).unwrap();
      setMenuOpen(false);
      toast.success(
        isConversationArchived
          ? t("conversation_unarchived")
          : t("conversation_archived"),
      );
      await refetchChatList();
    } catch (err) {
      console.error(
        `Failed to ${isConversationArchived ? "unarchive" : "archive"} conversation:`,
        err,
      );
      toast.error(
        t("failed_archive_conversation", {
          action: isConversationArchived ? t("unarchive") : t("archive"),
        }),
      );
    }
  };

  const getFileExtension = (url) =>
    url?.split("?")[0].split(".").pop().toLowerCase();
  const getFileName = (url) => url?.split("/").pop().split("?")[0];

  const renderMessageContent = (message) => {
    const fileExt = message.file ? getFileExtension(message.file) : "";
    const isImageFile =
      message.file &&
      (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt) ||
        message.file.startsWith("blob:"));

    if (message.text || message.file) {
      return (
        <>
          {message.text && (
            <p className={message.file ? "mb-2 break-words" : "break-words"}>
              {message.text}
            </p>
          )}
          {message.file && (
            <div>
              {isImageFile ? (
                <img
                  src={message.file}
                  alt={message.localFileName || t("attachment")}
                  className="max-w-full h-auto rounded"
                  style={{ maxWidth: "200px" }}
                />
              ) : (
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
    return <p>{t("unknown_content")}</p>;
  };

  if (isMessagesLoading) {
    return (
      <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col items-center justify-center relative">
        <h1 className="text-lg text-gray-800 dark:text-gray-100">
          {t("loading_messages")}
        </h1>
      </div>
    );
  }

  if (isChatListLoading && !agency) {
    return (
      <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col items-center justify-center relative">
        <h1 className="text-lg text-gray-800 dark:text-gray-100">
          {t("loading_chat")}
        </h1>
      </div>
    );
  }

  if (messagesError || (!agency && !isChatListLoading)) {
    return (
      <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col items-center justify-center relative">
        <h1 className="text-lg text-gray-800 dark:text-gray-100">
          {messagesError ? t("error_loading_chat") : t("chat_not_found")}
        </h1>
      </div>
    );
  }

  const currentChat = chatList?.find((chat) => chat.id?.toString() === id);

  return (
    <div className="rounded-r-lg bg-[#F5F7FB] dark:bg-[#252c3b] h-full flex flex-col">
      <div className="flex items-center justify-between space-x-4 p-3 border-b border-gray-200 rounded-tr-lg bg-white dark:bg-[#252c3b]">
        <div></div>
        <div className="flex items-center space-x-2">
          <div className="relative space-x-2 flex items-center " ref={menuRef}>
            {currentChat?.is_active === true && (
              <button
                className="bg-gray-100 hover:bg-gray-200 dark:bg-[#1E232E] px-3 py-1 rounded"
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
              >
                {t("reject_offer")}
              </button>
            )}

            {isRejectModalOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[#252c3b] w-full max-w-md rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {t("reject_reason_title")}
                  </h3>

                  <div className="space-y-3">
                    {rejectReasons.map((reason) => (
                      <label
                        key={reason.label}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="reject_reason"
                          value={reason.label}
                          checked={selectedRejectReason === reason.label}
                          onChange={() => setSelectedRejectReason(reason.label)}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {i18n.language === "it"
                            ? reason.label
                            : t(reason.label)}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsRejectModalOpen(false)}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600"
                    >
                      {t("cancel")}
                    </button>

                    <button
                      onClick={async () => {
                        if (!selectedRejectReason) return;

                        try {
                          await rejectOffer({
                            id: currentChat.offer_id,
                            data: {
                              reason: selectedRejectReason,
                            },
                          }).unwrap();
                        } catch (err) {
                          toast.error(t("failed_reject_offer"));
                          return; 
                        }

                        try {
                          await finalOfferResponse({
                            id: Number(id),
                            data: {
                              is_accepted: false,
                              reason: selectedRejectReason,
                            },
                          }).unwrap();

                          toast.success(t("offer_rejected"));
                          setIsRejectModalOpen(false);
                        } catch (err) {
                          toast.error(t("failed_final_offer_response"));
                        }
                      }}
                      disabled={!selectedRejectReason}
                      className="px-4 py-2 rounded bg-[#2F80A9] text-white disabled:opacity-50"
                    >
                      {t("send")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              className="bg-gray-100 hover:cursor-pointer dark:bg-[#1E232E] text-gray-800 dark:text-gray-200 px-2 text-2xl font-semibold rounded focus:outline-none py-1"
              onClick={() => setMenuOpen((prev) => !prev)}
              type="button"
            >
              <HiOutlineDotsVertical size={22} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-40 w-52 bg-white dark:bg-[#252c3b] border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E232E] hover:cursor-pointer"
                  onClick={handleViewDetails}
                >
                  {t("view_tour_details")}
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E232E] hover:cursor-pointer"
                  onClick={handleArchiveConversation}
                >
                  {isConversationArchived
                    ? t("unarchive_conversation")
                    : t("archive_conversation")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {t("no_messages")}
          </div>
        )}
        {messages.map((message) => {
          if (
            !message.text &&
            !message.file &&
            message.message_type !== "start_conversation" &&
            message.message_type !== "final_offer_sent"
          ) {
            return null;
          }

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
                        {message.timestamp.toLocaleTimeString(
                          i18n.language === "it" ? "it-IT" : "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                    <span className="text-xs text-gray-600">{t("you")}</span>
                  </div>
                </div>
              ) : (
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
            <div className="absolute bottom-30 right-2/8 flex flex-col space-y-2">
              <button
                onClick={handleAcceptFinalOffer}
                disabled={isAccepting}
                className={`border px-4 py-1 rounded-full text-white ${
                  isAccepting
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-[#2F80A9] hover:bg-[#256f8c] cursor-pointer"
                }`}
              >
                {isAccepting ? t("accepting") : t("accept_final_offer")}
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
                {isDeclining ? t("declining") : t("decline_final_offer")}
              </button>
            </div>
          )}
      </div>

      {currentChat?.is_active === true ? (
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
              placeholder={t("type_message_or_select_file")}
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
      ) : (
        <div className="border-t border-gray-200 p-3 bg-gray-50 dark:bg-[#1E232E] dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("conversation_inactive_message")}
          </p>
        </div>
      )}
    </div>
  );
}

export default Messages;
