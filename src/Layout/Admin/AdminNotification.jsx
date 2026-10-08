import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, FileText, ArrowUpRight, Trash2, X, LoaderCircle, TriangleAlert } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDeleteNotificationMutation, useGetNotificationsQuery, useSeenNotificationMutation } from "@/redux/features/withAuth";

export default function AdminNotification({ compact = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [notifications, setNotifications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const permissionRequestedRef = useRef(false);
  const readBatchRef = useRef("");
  const { data, isLoading, isError, refetch } = useGetNotificationsQuery();
  const [markAsSeen] = useSeenNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  useEffect(() => {
    if (!permissionRequestedRef.current && "Notification" in window && Notification.permission === "default") {
      permissionRequestedRef.current = true;
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!Array.isArray(data)) return;
    setNotifications(data);
    const unreadBatch = data.filter(item => !item.seen).map(item => item.id).sort().join(",");
    if (unreadBatch && unreadBatch !== readBatchRef.current) {
      readBatchRef.current = unreadBatch;
      // This endpoint marks all notifications as read in one request.
      markAsSeen().unwrap().catch(() => { readBatchRef.current = ""; });
    }
  }, [data, markAsSeen]);

  useEffect(() => {
    if (!token) return;
    const socket = new WebSocket(`wss://api.treioferte.md/ws/notifications/?token=${token}`);
    socket.onmessage = event => {
      try {
        const payload = JSON.parse(event.data);
        const notification = payload.notification || payload;
        if (!notification.id || !notification.message) return;
        setNotifications(previous => [notification, ...previous.filter(item => item.id !== notification.id)]);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(t("new_notification"), { body: notification.message, icon: "/favicon_2.png" });
        }
        if (!notification.seen) markAsSeen();
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    };
    return () => socket.close();
  }, [token, markAsSeen, t]);

  const openNotification = item => {
    if (item.target_url) navigate(item.target_url);
    else if (item.plan_id) navigate(`/cereri/${item.plan_id}`);
    else toast.error(t("no_target_url"));
  };

  const closeDelete = () => { if (!isDeleting) setSelectedId(null); };
  const confirmDelete = async () => {
    try {
      await deleteNotification(selectedId).unwrap();
      setNotifications(previous => previous.filter(item => item.id !== selectedId));
      setSelectedId(null);
      toast.success(t("notification_deleted_success"));
    } catch {
      toast.error(t("failed_to_delete_notification"));
    }
  };

  return (
    <section className={`${compact ? "w-full" : "mx-auto w-full max-w-3xl overflow-hidden rounded-[24px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.04)]"} text-[#172b43]`} aria-label={t("notifications")}>
      <header className={`flex items-start gap-3 border-b border-[#eeeae3] ${compact ? "p-5" : "p-5 sm:p-6"}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#ecdfc8] bg-[#fbf5e9] text-[#b88424]"><BellRing size={21} strokeWidth={1.8} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 className={`${compact ? "text-lg" : "text-2xl"} font-bold tracking-tight`}>{t("notifications")}</h2>
          <p className="mt-1 text-xs leading-5 text-[#77818e]">{t("notification_panel_intro")}</p>
        </div>
        {!isLoading && !isError && notifications.length > 0 && <span className="rounded-full bg-[#fbf2df] px-2.5 py-1 text-xs font-semibold text-[#9b701f]" aria-label={t("notification_count", { count: notifications.length })}>{notifications.length}</span>}
      </header>

      <div className={compact ? "max-h-[min(52dvh,400px)] overflow-y-auto p-3" : "p-3 sm:p-4"}>
        {isLoading ? (
          <div role="status" className="flex items-center justify-center gap-2 px-3 py-10 text-sm text-[#77818e]"><LoaderCircle size={19} className="animate-spin text-[#b88424]" />{t("loading_notifications")}</div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-[#77818e]"><TriangleAlert size={27} className="text-[#b54a40]" /><p>{t("notification_load_failed")}</p><button type="button" onClick={refetch} className="rounded-xl border border-[#e5ddce] px-4 py-2 font-semibold text-[#9b701f]">{t("chat_retry")}</button></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f7f3ec] text-[#c1a576]"><Bell size={28} strokeWidth={1.5} aria-hidden="true" /></span><p className="text-sm font-semibold">{t("no_notifications_available")}</p><p className="max-w-xs text-xs leading-5 text-[#77818e]">{t("notification_empty_hint")}</p></div>
        ) : (
          <ul className="space-y-2">
            {notifications.map(item => {
              const Icon = item.plan_id ? FileText : Bell;
              const date = new Date(item.created_at);
              return (
                <li key={item.id} className={`flex items-start gap-2 rounded-2xl border p-3 transition sm:p-4 ${item.seen ? "border-[#eeeae3] bg-white hover:bg-[#fcfbf8]" : "border-[#ecdfc8] bg-[#fffcf5]"}`}>
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f6f0e4] text-[#b88424]"><Icon size={17} strokeWidth={1.8} aria-hidden="true" />{!item.seen && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#dd9e2c]" aria-label={t("notification_unread")} />}</span>
                  <div className="min-w-0 flex-1 pl-1">
                    <button type="button" onClick={() => openNotification(item)} className="block w-full rounded-lg text-left text-[13px] font-medium leading-6 [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-[#c88f2a] sm:text-sm">{item.message}</button>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {!Number.isNaN(date.getTime()) && <time dateTime={date.toISOString()} className="text-[11px] text-[#99a0a9]">{date.toLocaleString(i18n.language === "ro" ? "ro-RO" : "ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time>}
                      <button type="button" onClick={() => openNotification(item)} className="inline-flex items-center gap-1 rounded text-[11px] font-semibold text-[#9b701f] hover:underline focus-visible:outline-2 focus-visible:outline-[#c88f2a]">{t("view_notification")}<ArrowUpRight size={13} aria-hidden="true" /></button>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedId(item.id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9ca2aa] transition hover:bg-[#fff0ed] hover:text-[#b54a40] focus-visible:outline-2 focus-visible:outline-[#c88f2a]" aria-label={t("delete_notification")} title={t("delete_notification")}><Trash2 size={16} aria-hidden="true" /></button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog.Root open={selectedId !== null} onOpenChange={open => { if (!open) closeDelete(); }}>
        <Dialog.Portal>
          <Dialog.Overlay data-notification-dialog className="fixed inset-0 z-[80] bg-[#172b43]/45 backdrop-blur-sm" />
          <Dialog.Content data-notification-dialog className="fixed left-1/2 top-1/2 z-[81] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[#e9e6e0] bg-white p-6 text-[#172b43] shadow-2xl" onEscapeKeyDown={event => { if (isDeleting) event.preventDefault(); }} onPointerDownOutside={event => { if (isDeleting) event.preventDefault(); }}>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#b54a40]"><Trash2 size={22} aria-hidden="true" /></span>
            <Dialog.Title className="pr-5 text-xl font-bold tracking-tight">{t("delete_notification")}</Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-6 text-[#77818e]">{t("confirm_delete_notification")}</Dialog.Description>
            <Dialog.Close disabled={isDeleting} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#77818e] hover:bg-[#f7f3ec] disabled:opacity-50" aria-label={t("close")}><X size={18} aria-hidden="true" /></Dialog.Close>
            <div className="mt-6 flex gap-3">
              <Dialog.Close disabled={isDeleting} className="flex-1 rounded-xl border border-[#e9e6e0] px-3 py-3 text-sm font-semibold disabled:opacity-50">{t("cancel")}</Dialog.Close>
              <button type="button" onClick={confirmDelete} disabled={isDeleting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b54a40] px-3 py-3 text-sm font-semibold text-white hover:bg-[#9c3d34] disabled:opacity-50">{isDeleting && <LoaderCircle size={16} className="animate-spin" />}{isDeleting ? t("processing") : t("delete")}</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
