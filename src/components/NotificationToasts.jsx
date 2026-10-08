import { CheckCircle2, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

function ToastIcon({ type, isLoading }) {
  const Icon = isLoading ? LoaderCircle : type === "success" ? CheckCircle2 : type === "error" || type === "warning" ? TriangleAlert : Info;
  return <span className={`site-toast-icon site-toast-icon--${type}`}><Icon size={20} strokeWidth={1.8} className={isLoading ? "animate-spin" : ""} aria-hidden="true" /></span>;
}

export default function NotificationToasts() {
  const { t } = useTranslation();
  return (
    <ToastContainer
      className="site-notifications"
      position="top-right"
      autoClose={4000}
      limit={3}
      newestOnTop
      closeOnClick={false}
      pauseOnHover
      pauseOnFocusLoss
      draggable="touch"
      icon={props => <ToastIcon {...props} />}
      closeButton={({ closeToast }) => <button type="button" className="site-toast-close" aria-label={t("notification_close_alert")} onClick={() => closeToast(true)}><X size={16} aria-hidden="true" /></button>}
      aria-label={t("notification_alert_region")}
      role="alert"
    />
  );
}
