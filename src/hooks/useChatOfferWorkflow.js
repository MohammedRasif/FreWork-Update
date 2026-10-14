import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  useFinalOfferSentMutation,
  useFinalOfferResponseMutation,
  useGetOneDetailQuery,
  useGetAllacceptedOfferQuery,
  useMessageSentMutation,
} from "@/redux/features/withAuth";
import { getAcceptedChatOffer, getOfferNoticeStatus, offerRejectReasons } from "@/lib/chatOffers";

const readNotice = (key) => {
  try {
    const notice = JSON.parse(sessionStorage.getItem(key));
    return notice?.key === key && ["accepted", "rejected"].includes(notice.status) && typeof notice.text === "string" ? notice : null;
  }
  catch { return null; }
};

const storeNotice = (notice) => {
  try { sessionStorage.setItem(notice.key, JSON.stringify(notice)); }
  catch { /* Retain the retry action in memory when browser storage is unavailable. */ }
};

export default function useChatOfferWorkflow({ chat, chatId, planId, messages }) {
  const { t } = useTranslation();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  const isAgency = role === "agency";
  const storageKey = `chat-offer-notice:${userId}:${chatId}`;
  const { data: plan, isLoading, isError, refetch } = useGetOneDetailQuery(planId, { skip: !planId, pollingInterval: 3000, refetchOnMountOrArgChange: true });
  const { data: acceptedOffers, refetch: refetchAccepted } = useGetAllacceptedOfferQuery(undefined, { skip: !isAgency, pollingInterval: 3000 });
  const accepted = getAcceptedChatOffer(acceptedOffers, chat, userId);
  const agencyId = isAgency ? userId : chat?.other_user_id;
  const offer = accepted || (Array.isArray(plan?.offers) ? plan.offers : []).find((item) => String(item.agency?.user) === String(agencyId));
  const [sendFinal] = useFinalOfferSentMutation();
  const [respond] = useFinalOfferResponseMutation();
  const [sendMessage] = useMessageSentMutation();
  const [dialog, setDialog] = useState(null);
  const [consent, setConsent] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [localResult, setLocalResult] = useState(null);
  const [sentLocally, setSentLocally] = useState(false);
  const [notice, setNotice] = useState(() => readNotice(storageKey));
  const activeChatRef = useRef(chatId);
  activeChatRef.current = chatId;

  useEffect(() => {
    setDialog(null); setConsent(false); setReason(""); setError("");
    setLocalResult(null); setSentLocally(false); setNotice(readNotice(storageKey));
  }, [storageKey]);

  const messageStatus = getOfferNoticeStatus(messages, plan?.user);
  let serverStatus = null;
  if (offer?.status === "accepted" || accepted) serverStatus = "accepted";
  else if (offer?.status === "rejected") serverStatus = "rejected";
  else if (plan?.status === "accepted") serverStatus = "closed";
  else if (!isAgency && plan && !offer && !isError && chat?.deal_status === true) serverStatus = "rejected";
  else if (!offer && messageStatus) serverStatus = messageStatus;
  const status = localResult || serverStatus;
  const isFinal = Boolean(offer?.is_final || (!isAgency && chat?.final_offer_sent) || sentLocally);
  const enabled = chat?.is_active !== false && !status && !busy && !isLoading && !isError;
  const canSend = isAgency && enabled && offer?.id != null && !isFinal;
  const canDecide = role === "tourist" && String(plan?.user) === String(userId) && enabled && isFinal && offer?.id != null;
  const agencyName = offer?.agency?.agency_name || t("agency");

  useEffect(() => {
    if (status || (dialog === "send" && isFinal && !busy)) setDialog(null);
  }, [status, dialog, isFinal, busy]);
  useEffect(() => {
    // Recover a decision saved by the server when its HTTP response was lost.
    if (notice?.confirmed === false && serverStatus === notice.status) {
      const confirmed = { ...notice, confirmed: true };
      storeNotice(confirmed); setNotice(confirmed);
    }
  }, [notice, serverStatus]);

  const openDialog = (next) => {
    if (busyRef.current || (next === "send" ? !canSend : !canDecide)) return;
    setConsent(false); setReason(""); setError(""); setDialog(next);
  };

  const deliverNotice = async (pending) => {
    const alreadyDelivered = messages.some((message) =>
      message.text === pending.text && String(message.senderUserId) === String(userId) && Number(message.id) > (pending.afterMessageId || 0),
    );
    if (!alreadyDelivered) {
      const form = new FormData(); form.append("text", pending.text);
      await sendMessage({ id: Number(pending.chatId), data: form }).unwrap();
    }
    try { sessionStorage.removeItem(pending.key); }
    catch { /* Sending succeeded even when browser storage is unavailable. */ }
    if (activeChatRef.current === pending.chatId) setNotice(null);
  };

  const submit = async () => {
    if (busyRef.current || !dialog || (dialog === "send" ? !canSend : !canDecide) || (dialog === "accept" && !consent)) return;
    const requestChatId = chatId;
    const action = dialog;
    busyRef.current = true; setBusy(true); setError("");
    try {
      if (action === "send") {
        await sendFinal(offer.id).unwrap();
        if (activeChatRef.current === requestChatId) { setSentLocally(true); setDialog(null); }
        toast.success(t("final_offer_sent_success"));
      } else {
        const result = action === "accept" ? "accepted" : "rejected";
        const pending = {
          key: storageKey, chatId: requestChatId, status: result, confirmed: false,
          afterMessageId: messages.reduce((last, message) => Math.max(last, Number(message.id) || 0), 0),
          text: t(action === "accept" ? "chat_offer_accepted_notice" : "chat_offer_rejected_notice", { agency: agencyName }) + (action === "decline" && reason ? `\n${t("chat_offer_reason")}: ${t(offerRejectReasons.find((item) => item.value === reason)?.labelKey)}` : ""),
        };
        storeNotice(pending);
        if (activeChatRef.current === requestChatId) setNotice(pending);
        await respond({ id: Number(requestChatId), data: { is_accepted: action === "accept", ...(reason ? { reason: reason.trim() } : {}) } }).unwrap();
        const confirmed = { ...pending, confirmed: true }; storeNotice(confirmed);
        if (activeChatRef.current === requestChatId) { setLocalResult(result); setNotice(confirmed); setDialog(null); }
        toast.success(t(action === "accept" ? "final_offer_accepted" : "final_offer_declined"));
        try { await deliverNotice(confirmed); }
        catch { /* The confirmed decision remains visible; its chat notice can be retried. */ }
      }
    } catch {
      if (activeChatRef.current === requestChatId) setError(t(action === "send" ? "failed_to_send_final_offer" : "failed_final_offer_response"));
      // A concurrent decision may have closed the offer. Refresh before allowing another attempt.
      refetch();
    } finally {
      busyRef.current = false; setBusy(false);
      if (isAgency) refetchAccepted();
    }
  };

  const retryNotice = async () => {
    if (!notice || notice.confirmed === false || busyRef.current) return;
    busyRef.current = true; setBusy(true);
    try { await deliverNotice(notice); }
    catch { toast.error(t("chat_offer_notice_failed")); }
    finally { busyRef.current = false; setBusy(false); }
  };

  return { role, isAgency, plan, offer, acceptedOffers, isLoading, isError, refetch, status, isFinal, canSend, canDecide, agencyName, dialog, setDialog, openDialog, consent, setConsent, reason, setReason, error, busy, submit, notice: notice?.confirmed === false ? null : notice, retryNotice };
}
