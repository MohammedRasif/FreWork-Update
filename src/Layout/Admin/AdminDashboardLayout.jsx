import { createContext, useContext, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, ClipboardList, Clock3, CreditCard, Eye, EyeOff, Lock, LogOut, Mail, Menu, MessageCircle, ShieldCheck, UserRound, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useChangePasswordMutation, useGetAgencyProfileQuery, useShowUserInpormationQuery } from "@/redux/features/withAuth";
import AdminNotification from "./AdminNotification";
import BrandWordmark from "@/components/BrandWordmark";
import { getPageTitle } from "@/lib/pageTitle";
import LanguageToggleButton, { LanguageMenuItems } from "@/Pages/Home/LanguageToggleButton";
import { getAgencyAccountPath } from "@/lib/agencyOnboarding";

const UnreadCountContext = createContext();
export const useUnreadCount = () => useContext(UnreadCountContext);

const passwordFields = [
  { name: "current_password", label: "old_password" },
  { name: "new_password", label: "new_password" },
  { name: "confirm_password", label: "confirm_new_password" },
];

function AgencyNav({ t, pathname, agency, isLoading, canAccessDashboard, onNavigate, onLogout }) {
  const name = agency?.agency_name || localStorage.getItem("name") || t("company_profile");
  const items = [
    { path: "/agentie", label: t("my_board"), icon: ClipboardList, active: pathname === "/agentie" || pathname === "/agentie/dashboard" },
    { path: "/agentie/abonament", label: t("subscription_management"), icon: CreditCard, active: pathname === "/agentie/abonament" },
    { path: "/agentie/mesaje", label: t("conversations"), icon: MessageCircle, active: pathname.startsWith("/agentie/mesaje") },
    { path: "/agentie/profil", label: t("profile"), icon: UserRound, active: pathname === "/agentie/profil" || pathname === "/agentie/modifica-profil" },
  ].filter((item) => canAccessDashboard || item.path === "/agentie/profil");

  return (
    <>
      <NavLink to="/" onClick={onNavigate} className="flex h-[76px] items-center border-b border-[#e9e6e0] px-6">
        <BrandWordmark />
      </NavLink>
      <div className="px-4 pb-4 pt-6">
        <div className="flex items-center gap-3 rounded-[18px] bg-[#f7f3ec] px-3 py-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#172b43] text-lg font-bold text-white">
            <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
            {(agency?.profile_handler_image || agency?.agency_logo_url) && <img src={agency.profile_handler_image || agency.agency_logo_url} onError={(event) => { event.currentTarget.style.display = "none"; }} alt={name} className="absolute inset-0 h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#172b43]">{isLoading ? t("loading") : name}</p>
            <p className="truncate text-xs text-[#718092]">{t("agency")}</p>
          </div>
          {agency?.is_verified && <ShieldCheck size={17} className="ml-auto shrink-0 text-[#b98427]" aria-label={t("verified")} />}
        </div>
      </div>
      <nav className="flex-1 px-4" aria-label={t("menu")}>
        <p className="px-3 pb-3 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#98a3ad]">{t("menu")}</p>
        <ul className="space-y-1.5">
          {items.map(({ path, label, icon: Icon, active }) => <li key={path}>
            <NavLink to={path} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors ${active ? "bg-[#172b43] text-white shadow-sm" : "text-[#536477] hover:bg-[#f7f3ec] hover:text-[#172b43]"}`}>
              <Icon size={19} strokeWidth={1.9} className={active ? "text-[#e0a948]" : "text-[#9b6b22]"} aria-hidden="true" />{label}
            </NavLink>
          </li>)}
        </ul>
      </nav>
      <div className="border-t border-[#e9e6e0] p-4">
        <button type="button" onClick={onLogout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm font-semibold text-[#617082] transition-colors hover:bg-[#fff3ee] hover:text-[#9d4635]"><LogOut size={19} aria-hidden="true" />{t("logout")}</button>
      </div>
    </>
  );
}

export default function AdminDashboardLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPasswords, setShowPasswords] = useState({ current_password: false, new_password: false, confirm_password: false });
  const [formData, setFormData] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const { data: agencyData, isLoading: isAgencyLoading } = useGetAgencyProfileQuery();
  const { data: userData, isLoading: isUserLoading } = useShowUserInpormationQuery(undefined, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const [changePassword, { isLoading: isChangePasswordLoading }] = useChangePasswordMutation();
  const notificationRef = useRef(null);
  const mainRef = useRef(null);
  const pathname = location.pathname.replace(/\/$/, "") || "/agentie";
  const canAccessDashboard = !isUserLoading && userData?.role === "agency" && Boolean(userData.agency_is_verified && userData.is_profile_complete && !userData.agency_is_rejected);
  const isProfilePage = pathname === "/agentie/profil" || pathname === "/agentie/modifica-profil";
  const pageTitle = getPageTitle(pathname, t);

  useEffect(() => { document.title = `TreiOferte | ${pageTitle}`; }, [pageTitle]);
  useEffect(() => {
    if (!userData) return;
    if (userData.role !== "agency") navigate("/cont", { replace: true });
    else if (userData.agency_is_rejected || (!canAccessDashboard && !isProfilePage)) navigate(getAgencyAccountPath(userData), { replace: true });
  }, [userData, canAccessDashboard, isProfilePage, navigate]);
  useEffect(() => { setIsMobileMenuOpen(false); setIsNotificationOpen(false); }, [location.pathname]);
  useEffect(() => { mainRef.current?.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const socket = new WebSocket(`wss://api.treioferte.md/ws/notification-count/?token=${token}`);
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.unread_count !== undefined) setUnreadCount(Number(data.unread_count) || 0);
      } catch { /* Ignore malformed notification counts. */ }
    };
    return () => socket.close();
  }, []);
  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && !event.target.closest?.("[data-notification-dialog]")) setIsNotificationOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const logout = () => {
    ["access_token", "refresh_token", "name", "role", "user_id", "userEmail", "userType", "user_image"].forEach((key) => localStorage.removeItem(key));
    navigate("/");
  };
  const submitPassword = async (event) => {
    event.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error(t("passwords_do_not_match"));
      return;
    }
    try {
      await changePassword({ current_password: formData.current_password, new_password: formData.new_password }).unwrap();
      toast.success(t("password_changed_success"));
      setFormData({ current_password: "", new_password: "", confirm_password: "" });
      setIsChangePasswordOpen(false);
    } catch (error) {
      toast.error(error?.data?.error || t("failed_to_change_password"));
    }
  };

  return (
    <UnreadCountContext.Provider value={{ unreadCount, setUnreadCount }}>
      <div className="agency-dashboard flex h-screen min-w-0 overflow-hidden bg-[#faf9f6] text-[#172b43]">
        <aside className="hidden w-[272px] shrink-0 flex-col border-r border-[#e9e6e0] bg-white lg:flex">
          <AgencyNav t={t} pathname={pathname} agency={agencyData} isLoading={isAgencyLoading} canAccessDashboard={canAccessDashboard} onNavigate={() => { }} onLogout={logout} />
        </aside>
        {isMobileMenuOpen && <button type="button" aria-label={t("close")} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-[#10243a]/45 lg:hidden" />}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,300px)] flex-col border-r border-[#e9e6e0] bg-white shadow-xl transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!isMobileMenuOpen} inert={!isMobileMenuOpen}>
          <AgencyNav t={t} pathname={pathname} agency={agencyData} isLoading={isAgencyLoading} canAccessDashboard={canAccessDashboard} onNavigate={() => setIsMobileMenuOpen(false)} onLogout={logout} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="relative z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-[#e9e6e0] bg-white px-4 sm:px-6 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setIsMobileMenuOpen(true)} aria-label={t("open_menu")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#34485c] hover:bg-[#f7f3ec] lg:hidden"><Menu size={22} aria-hidden="true" /></button>
              <div className="min-w-0"><p className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[#a36f1d] sm:block">TreiOferte</p><h1 className="truncate text-base font-bold sm:text-lg">{pageTitle}</h1></div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <LanguageToggleButton className="hidden sm:inline-flex" />
              <div className="relative" ref={notificationRef}>
                <button type="button" onClick={() => setIsNotificationOpen((value) => !value)} aria-label={t("notifications")} aria-expanded={isNotificationOpen} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#34485c] hover:bg-[#f7f3ec]"><Bell size={20} aria-hidden="true" />{unreadCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c88f2a] px-1 text-[10px] font-bold text-white">{unreadCount}</span>}</button>
                {isNotificationOpen && <div className="fixed right-4 top-[84px] z-50 sm:absolute sm:right-0 sm:top-12 max-h-[min(70vh,500px)] w-[min(88vw,440px)] overflow-y-auto rounded-[18px] border border-[#e9e6e0] bg-white shadow-[0_20px_55px_rgba(23,43,67,0.17)]"><AdminNotification compact /></div>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button type="button" aria-label={t("settings")} className="flex h-10 items-center gap-1 rounded-xl px-2 text-[#34485c] hover:bg-[#f7f3ec]"><UserRound size={19} aria-hidden="true" /><ChevronDown size={15} aria-hidden="true" /></button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#e9e6e0] p-1.5">
                  <DropdownMenuItem onClick={() => navigate("/agentie/profil")}><UserRound size={17} />{t("profile")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}><Lock size={17} />{t("change_password")}</DropdownMenuItem>
                  <LanguageMenuItems />
                  {canAccessDashboard && <DropdownMenuItem onClick={() => navigate("/agentie/abonament")}><CreditCard size={17} />{t("subscription_management")}</DropdownMenuItem>}
                  <DropdownMenuItem onClick={() => navigate("/contact")}><Mail size={17} />{t("contact_support")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}><LogOut size={17} />{t("logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto bg-[#faf9f6] px-4 py-6 sm:px-6 lg:px-9 lg:py-8"><div className="mx-auto max-w-[1440px]">
            {userData?.role === "agency" && !userData.agency_is_verified && !userData.agency_is_rejected && <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#ecdfc8] bg-[#fbf6ec] p-4 text-sm text-[#617082]"><Clock3 size={20} className="shrink-0 text-[#b88424]" aria-hidden="true" /><p className="min-w-0 flex-1">{t("agency_pending_dashboard_hint")}</p><NavLink to="/in-asteptare" className="font-semibold text-[#9b6b22] underline underline-offset-4">{t("agency_pending_view_status")}</NavLink></div>}
            {userData?.role === "agency" && !userData.agency_is_rejected && (canAccessDashboard || isProfilePage) ? <Outlet /> : <p role="status" className="text-sm text-[#617082]">{t("loading_profile")}</p>}
          </div></main>
        </div>

        {isChangePasswordOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10243a]/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isChangePasswordLoading) setIsChangePasswordOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="agency-change-password-title" className="w-full max-w-md rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_24px_70px_rgba(16,36,58,0.25)] sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4"><div><div className="mb-3 h-1 w-9 rounded-full bg-[#d6a044]" /><h2 id="agency-change-password-title" className="text-xl font-bold">{t("change_password")}</h2></div><button type="button" onClick={() => setIsChangePasswordOpen(false)} disabled={isChangePasswordLoading} aria-label={t("close")} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#617082] hover:bg-[#f2f4f5]"><X size={20} aria-hidden="true" /></button></div>
            <form onSubmit={submitPassword} className="space-y-4">
              {passwordFields.map(({ name, label }) => <div key={name}><label htmlFor={`agency-${name}`} className="mb-1.5 block text-sm font-semibold text-[#34485c]">{t(label)}</label><div className="relative"><input id={`agency-${name}`} type={showPasswords[name] ? "text" : "password"} name={name} value={formData[name]} onChange={(event) => setFormData((value) => ({ ...value, [name]: event.target.value }))} autoComplete={name === "current_password" ? "current-password" : "new-password"} placeholder={t("enter_password")} className="h-11 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 pr-11 focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20" required /><button type="button" onClick={() => setShowPasswords((value) => ({ ...value, [name]: !value[name] }))} aria-label={showPasswords[name] ? t("hide_password") : t("show_password")} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#7c8b9a]">{showPasswords[name] ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div></div>)}
              <button type="submit" disabled={isChangePasswordLoading} className="min-h-11 w-full rounded-xl bg-[#c88f2a] px-4 font-bold text-white hover:bg-[#ad751c] disabled:opacity-60">{isChangePasswordLoading ? t("processing") : t("confirm")}</button>
            </form>
          </div>
        </div>}

      </div>
    </UnreadCountContext.Provider>
  );
}
