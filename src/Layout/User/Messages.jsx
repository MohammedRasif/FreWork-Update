import { useState, useRef, useEffect } from "react";
import {
  SendIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  PaperclipIcon,
  ArrowLeft,
  MoreVertical,
  Archive,
  ArchiveRestore,
  FileText,
  MessagesSquare,
  LoaderCircle,
  BadgeCheck,
  RotateCcw,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useArchivedUserMutation,
  useGetChatListQuery,
  useGetPlansQuery,
  useInviteToChatMutation,
  useMessageSentMutation,
  useShowMessagesQuery,
} from "@/redux/features/withAuth";
import { chat_sockit } from "@/assets/Socketurl";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ChatAvatar from "./ChatAvatar";
import ChatOfferActions from "./ChatOfferActions";
import useChatOfferWorkflow from "@/hooks/useChatOfferWorkflow";
import { getAcceptedChatOffer, getChatParticipantName } from "@/lib/chatOffers";


const FILE_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.treioferte.md";

function Messages() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const userId = localStorage.getItem("user_id");
  const location = useLocation();
  const navigate = useNavigate();
  const agency = location.state?.agency;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);

  const pendingMessagesRef = useRef(new Map());
  const [inviteToChat] = useInviteToChatMutation();
  const [archivedUser] = useArchivedUserMutation();
  const [sentMessage] = useMessageSentMutation();

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useShowMessagesQuery(id, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 2000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: chatList,
    isLoading: isChatListLoading,
    refetch: refetchChatList,
  } = useGetChatListQuery(undefined, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
  const currentChat = Array.isArray(chatList) ? chatList.find((chat) => String(chat.id) === id) : null;
  const workflow = useChatOfferWorkflow({ chat: currentChat, chatId: id, planId: currentChat?.tour_plan_id || agency?.tour_plan_id, messages });

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const [isConversationArchived, setIsConversationArchived] = useState(false);
  useEffect(() => {
    if (!agency && id && chatList && !isChatListLoading) {
      const currentChat = chatList.find((chat) => chat.id?.toString() === id);
      if (currentChat) {
        const basePath = location.pathname.includes("/agentie/")
          ? "/agentie/mesaje"
          : "/cont/mesaje";

        const agencyData = {
          id: currentChat.id?.toString() || "",
          name: currentChat.other_participant_name || t("unknown_user"),
          image:
            currentChat.other_participant_image ||
            null,
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
    setNewMessage("");
    setMenuOpen(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    let reconnectTimeout;
    const connectWebSocket = () => {
      if (!isMounted) return;
      try {
        const ws = new WebSocket(chat_sockit(id));
        wsRef.current = ws;
        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const received = JSON.parse(event.data);
            refetchMessages();
            refetchChatList();
            if (received.type !== "chat_message") return;

            const inner = received.message || received.data || received;
            let messageType = "text";
            if (inner.file || inner.file_url) messageType = "file";
            else if (inner.message_type) messageType = inner.message_type;

            const serverMessage = {
              id: inner.id,
              message_type: messageType,
              text: inner.text || null,
              data: inner.data || null,
              tour_plan_id: inner.tour_plan_id || null,
              tour_plan_title: inner.tour_plan_title || null,
              file: inner.file || inner.file_url
                ? new URL(inner.file || inner.file_url, FILE_BASE_URL).href
                : null,
              senderUserId: inner.sender?.user_id,
              isUser: String(inner.sender?.user_id) === userId,
              timestamp: inner.timestamp ? new Date(inner.timestamp) : new Date(),
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
                          file: serverMessage.file || msg.file,
                          senderUserId: serverMessage.senderUserId,
                          status: "sent",
                          // Keep the request marker until HTTP resolves, so the server URL replaces the preview reliably.
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
        ws.onerror = (err) => console.warn("WebSocket error:", err);
        ws.onclose = () => {
          if (isMounted) reconnectTimeout = setTimeout(connectWebSocket, 2500);
        };
      } catch {
        if (isMounted) reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };
    connectWebSocket();
    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [id, userId, refetchMessages, refetchChatList]);

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
        senderUserId: msg.sender?.user_id,
        isUser: String(msg.sender?.user_id) === userId,
        timestamp: new Date(msg.timestamp),
        is_read: msg.is_read,
        status: "sent",
      }));
      setMessages((prev) => {
        const uniqueMsgs = new Map(prev.map((message) => [message.id, message]));
        for (const message of formattedMessages) {
          const existing = uniqueMsgs.get(message.id);
          uniqueMsgs.set(message.id, { ...existing, ...message, ...(existing?.tempId ? { tempId: existing.tempId } : {}) });
        }
        return [...uniqueMsgs.values()].sort((a, b) => a.timestamp - b.timestamp);
      });
    }
  }, [messagesData, userId, id]);

  const lastMessageCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0) {
      if (isInitialLoadRef.current) {
        scrollToBottom("auto");
        isInitialLoadRef.current = false;
      } else if (messages.length > lastMessageCountRef.current) {
        scrollToBottom("smooth");
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    isInitialLoadRef.current = true;
    lastMessageCountRef.current = 0;
  }, [id]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(120, Math.max(40, input.scrollHeight))}px`;
  }, [newMessage, isMessagesLoading, agency]);

  const handleFileChange = async (e) => {
    if (!isChatActive) return;
    const file = e.target.files[0];
    const activePlanId = selectedDropdown || agency?.tour_plan_id || currentChat?.tour_plan_id;
    if (file) {
      if (!activePlanId) {
        alert(t("select_tour_plan_first"));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const tempId = uuidv4();
      const messageId = uuidv4();
      const tourPlan = dropdownOptions.find(
        (opt) => String(opt.value) === String(activePlanId),
      );

      const filePreviewUrl = URL.createObjectURL(file);
      const localFileName = file.name;

      const localMessage = {
        id: messageId,
        message_type: "file",
        text: null,
        data: null,
        tour_plan_id: activePlanId,
        tour_plan_title: tourPlan?.label || currentChat?.tour_plan_title || null,
        file: filePreviewUrl,
        localFileName: localFileName,
        originalFile: file,
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
        refetchMessages();
        refetchChatList();
      } catch (error) {
        console.error("Failed to send file message:", error);
        toast.error(t("failed_send_file"));
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? { ...msg, status: "failed" }
              : msg,
          ),
        );
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
      inputRef.current?.focus();
    }
  };

  const handleSendMessage = async () => {
    if (!isChatActive || newMessage.trim() === "" || isSending) return;
    const activePlanId = selectedDropdown || agency?.tour_plan_id || currentChat?.tour_plan_id;
    if (!activePlanId) {
      alert(t("select_tour_plan_first"));
      return;
    }

    const messageText = newMessage.trim();
    setIsSending(true);
    setNewMessage("");
    const tempId = uuidv4();
    const messageId = uuidv4();
    const tourPlan = dropdownOptions.find(
      (opt) => String(opt.value) === String(activePlanId),
    );

    const localMessage = {
      id: messageId,
      message_type: "text",
      text: messageText,
      data: null,
      tour_plan_id: activePlanId,
      tour_plan_title: tourPlan?.label || currentChat?.tour_plan_title || null,
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
    formData.append("text", messageText);

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
      refetchMessages();
      refetchChatList();
    } catch (error) {
      console.error("Failed to send text message:", error);
      toast.error(t("failed_send_text"));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg,
        ),
      );
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
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
    if (message.originalFile) formData.append("file", message.originalFile);
    else formData.append("text", message.text);

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
      if (message.file?.startsWith("blob:")) URL.revokeObjectURL(message.file);
      pendingMessagesRef.current.delete(tempId);
      refetchMessages();
      refetchChatList();
    } catch (error) {
      console.error("Failed to retry message:", error);
      toast.error(t("failed_retry_message"));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: "failed" } : msg,
        ),
      );
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
          tour_plan_title: tourPlan?.label || currentChat?.tour_plan_title || null,
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
    navigate(`/cereri/${agency.tour_plan_id}`);

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
        (message.file.startsWith("blob:") && message.originalFile?.type.startsWith("image/")));

    if (message.text || message.file) {
      return (
        <>
          {message.text && (
            <p className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${message.file ? "mb-2" : ""}`}>
              {message.text}
            </p>
          )}
          {message.file && (
            <div>
              {isImageFile ? (
                <img
                  src={message.file}
                  alt={message.localFileName || t("attachment")}
                  className="max-w-full h-auto rounded-xl"
                  style={{ maxWidth: "min(240px, 100%)" }}
                />
              ) : (
                <div className="flex min-w-0 items-center gap-2 rounded-lg border border-current/15 p-2">
                  <PaperclipIcon className="h-4 w-4 shrink-0" />
                  <a
                    href={message.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${
                      message.isUser
                        ? "text-white underline"
                        : "text-[#9b701f] hover:underline"
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
    if (
      message.message_type === "final_offer_sent" ||
      message.message_type === "offer"
    ) {
      return (
        <p className="font-semibold text-[#b88424]">
          {message.text || t("final_offer_sent")}
        </p>
      );
    }

    if (
      message.message_type === "final_offer_accepted" ||
      message.message_type === "offer_accepted"
    ) {
      return (
        <p className="font-semibold text-[#166534]">
          {message.text || t("final_offer_accepted")}
        </p>
      );
    }

    if (
      message.message_type === "final_offer_declined" ||
      message.message_type === "offer_declined" ||
      message.message_type === "offer_rejected"
    ) {
      return (
        <p className="font-semibold text-[#b54a40]">
          {message.text || t("final_offer_declined")}
        </p>
      );
    }

    return <p>{t("unknown_content")}</p>;
  };

  const basePath = location.pathname.startsWith("/agentie/") ? "/agentie/mesaje" : "/cont/mesaje";
  const canRejectOffer = workflow.canDecide;
  const isChatActive = workflow.status !== "rejected" && !isConversationArchived && currentChat?.is_active !== false && messagesData?.conversation?.is_active !== false;
  const participantName = workflow.isAgency ? getChatParticipantName(currentChat, workflow.role, workflow.acceptedOffers, userId, t) : agency?.name;
  const participantImage = workflow.isAgency && !getAcceptedChatOffer(workflow.acceptedOffers, currentChat, userId) ? null : agency?.image;
  const isLoading = isMessagesLoading || (isChatListLoading && !agency);
  const hasError = messagesError || (!agency && !isChatListLoading);

  if (isLoading || hasError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-[#77818e]" role={hasError ? "alert" : "status"}>
        {isLoading ? <LoaderCircle className="animate-spin text-[#b88424]" size={28} /> : <MessagesSquare size={32} className="text-[#b88424]" />}
        <p className="text-sm">{isLoading ? t("loading_messages") : messagesError ? t("error_loading_chat") : t("chat_not_found")}</p>
        <button type="button" onClick={() => navigate(basePath)} className="rounded-xl border border-[#e5ddce] bg-white px-4 py-2 text-sm font-semibold text-[#172b43]">{t("chat_back")}</button>
      </div>
    );
  }

  return (
    <div className="chat-thread flex h-full min-h-0 flex-col text-[#172b43]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-3 border-b border-[#eeeae3] bg-white px-3 py-4 sm:px-5">
        <div className="order-1 flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => navigate(basePath)} aria-label={t("chat_back")} className="chat-icon-button md:hidden"><ArrowLeft size={20} /></button>
          <ChatAvatar name={participantName} image={participantImage} active={currentChat?.active} className="h-10 w-10" />
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold sm:text-base"><span className="truncate">{participantName}</span>{currentChat?.tourist_is_verified && <BadgeCheck size={16} className="shrink-0 text-[#b88424]" aria-label={t("chat_verified")} />}</h2>
            <p className="mt-0.5 truncate text-xs text-[#9b701f]">{agency.tour_plan_title}</p>
          </div>
        </div>
        {canRejectOffer && (
          <button type="button" onClick={() => { setMenuOpen(false); workflow.openDialog("decline"); }} className="order-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#efd2cc] bg-[#fff6f3] px-3 py-2.5 text-xs font-semibold text-[#b54a40] transition hover:border-[#d8a29a] hover:bg-[#fff0ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b54a40] xl:order-2 xl:w-auto">
            <XIcon size={16} className="shrink-0" aria-hidden="true" />{t("reject_offer")}
          </button>
        )}
        <div className="relative order-2 shrink-0 xl:order-3" ref={menuRef}>
          <button type="button" aria-label={t("chat_options")} aria-expanded={menuOpen} aria-controls="chat-actions" onClick={() => setMenuOpen(prev => !prev)} onKeyDown={e => { if (e.key === "Escape") setMenuOpen(false); }} className="chat-icon-button"><MoreVertical size={21} /></button>
          {menuOpen && (
            <div id="chat-actions" onKeyDown={e => { if (e.key === "Escape") setMenuOpen(false); }} className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-[#e9e6e0] bg-white p-1.5 shadow-xl">
              <button type="button" className="chat-menu-item" onClick={handleViewDetails}><FileText size={17} className="shrink-0 text-[#b88424]" />{t("view_tour_details")}</button>
              <button type="button" className="chat-menu-item" onClick={handleArchiveConversation}>{isConversationArchived ? <ArchiveRestore size={17} className="shrink-0 text-[#b88424]" /> : <Archive size={17} className="shrink-0 text-[#b88424]" />}{isConversationArchived ? t("unarchive_conversation") : t("archive_conversation")}</button>
              {canRejectOffer && <button type="button" className="chat-menu-item text-[#b54a40]" onClick={() => { setMenuOpen(false); workflow.openDialog("decline"); }}><XIcon size={17} className="shrink-0" />{t("reject_offer")}</button>}
            </div>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5 sm:px-6 sm:py-6" aria-label={t("messages")}>
        {messages.length === 0 && <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-[#77818e]"><MessagesSquare size={30} className="text-[#c8b38d]" />{t("no_messages")}</div>}
        {messages.map(message => {
          if (
            !message.text &&
            !message.file &&
            message.message_type !== "start_conversation" &&
            message.message_type !== "final_offer_sent" &&
            message.message_type !== "offer" &&
            message.message_type !== "final_offer_accepted" &&
            message.message_type !== "offer_accepted" &&
            message.message_type !== "final_offer_declined" &&
            message.message_type !== "offer_declined" &&
            message.message_type !== "offer_rejected"
          ) return null;
          if (message.message_type === "start_conversation") return <div key={message.id || message.tempId} className="flex justify-center"><span className="max-w-sm rounded-xl border border-[#e7e1d6] bg-[#f4f0e8] px-4 py-2 text-center text-xs leading-5 text-[#8d7a59]">{message.text}</span></div>;
          return (
            <div key={message.id || message.tempId} className={`flex items-end gap-2 ${message.isUser ? "justify-end" : "justify-start"}`}>
              {!message.isUser && <ChatAvatar name={participantName} image={participantImage} className="h-7 w-7 !rounded-xl text-[10px]" />}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[78%] ${message.isUser ? "rounded-br-sm bg-[#172b43] text-white" : "rounded-bl-sm border border-[#ece7df] bg-white text-[#34485c]"}`}>
                {renderMessageContent(message)}
                <div className={`mt-1.5 flex items-center justify-end gap-1.5 ${message.isUser ? "text-[#b9c5d2]" : "text-[#99a0a9]"}`}>
                  <time className="text-[10px] leading-4">{message.timestamp.toLocaleTimeString(i18n.language === "ro" ? "ro-RO" : "ru-RU", { hour: "2-digit", minute: "2-digit" })}</time>
                  {message.isUser && message.status === "sending" && <ClockIcon size={12} aria-label={t("chat_sending")} />}
                  {message.isUser && message.status === "sent" && <CheckIcon size={13} className="text-[#e3b965]" aria-label={t("sent")} />}
                  {message.isUser && message.status === "failed" && <button type="button" onClick={() => handleRetryMessage(message.tempId)} aria-label={t("chat_retry")} className="rounded p-1 text-[#f3a49b] focus-visible:outline-2"><RotateCcw size={14} /></button>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatOfferActions workflow={workflow} />

      {isChatActive ? (
        <div className="shrink-0 border-t border-[#eeeae3] bg-white p-3 sm:p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-[#e4e7eb] bg-[#fafbfc] p-2 transition focus-within:border-[#c88f2a] focus-within:ring-2 focus-within:ring-[#c88f2a]/10">
            <button type="button" aria-label={t("attachment")} title={t("attachment")} className="chat-icon-button shrink-0" onClick={() => fileInputRef.current?.click()} disabled={!isChatActive}><PaperclipIcon size={20} /></button>
            <input type="file" aria-label={t("attachment")} ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} />
            <textarea rows={1} aria-label={t("type_message_or_select_file")} placeholder={t("type_message_or_select_file")} className="chat-composer min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent py-2.5 text-sm leading-5 outline-none" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={handleKeyPress} ref={inputRef} disabled={!isChatActive} />
            <button type="button" aria-label={t("chat_send")} title={t("chat_send")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dd9e2c] text-white transition hover:bg-[#c68a22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c88f2a] disabled:bg-[#eeebe5] disabled:text-[#b5b1a9]" onClick={handleSendMessage} disabled={!newMessage.trim() || isSending || !isChatActive}>{isSending ? <LoaderCircle size={18} className="animate-spin" /> : <SendIcon size={18} />}</button>
          </div>
        </div>
      ) : (
        <div className="shrink-0 border-t border-[#eeeae3] bg-white px-4 py-4 text-center text-xs leading-5 text-[#77818e]">{t(workflow.status === "rejected" ? "final_offer_declined" : isConversationArchived ? "conversation_archived" : "conversation_inactive_message")}</div>
      )}
    </div>
  );
}

export default Messages;
