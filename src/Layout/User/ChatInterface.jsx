import { useGetChatListQuery } from "@/redux/features/withAuth";
import { useState, useEffect } from "react";
import { Search, BadgeCheck, MessagesSquare, Inbox, Archive, ArrowRight, LoaderCircle } from "lucide-react";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatAvatar from "./ChatAvatar";

export default function ChatInterface() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlChatId } = useParams();
  const basePath = location.pathname.startsWith("/agentie/") ? "/agentie/mesaje" : "/cont/mesaje";
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("activeChatTab") === "archived" ? "archived" : "inbox");
  const { data: chatList, isLoading, isError, refetch } = useGetChatListQuery(undefined, { pollingInterval: 3000 });

  useEffect(() => { localStorage.setItem("activeChatTab", activeTab); }, [activeTab]);

  useEffect(() => {
    if (urlChatId && Array.isArray(chatList) && !chatList.some(chat => String(chat.id) === urlChatId)) {
      navigate(basePath, { replace: true });
    }
  }, [urlChatId, chatList, basePath, navigate]);

  const chats = (Array.isArray(chatList) ? chatList : []).map(chat => ({
    id: String(chat.id),
    name: chat.other_participant_name || t("unknown_user"),
    image: chat.other_participant_image || null,
    lastMessage: chat.last_message || null,
    unreadCount: chat.unread_count || 0,
    active: chat.active || false,
    tourist_is_verified: chat.tourist_is_verified || false,
    other_user_id: chat.other_user_id || null,
    tour_plan_title: chat.tour_plan_title || t("no_tour_plan"),
    tour_plan_id: chat.tour_plan_id || null,
    is_archived: chat.is_archived || false,
    updatedAt: new Date(chat.last_message_time || chat.updated_at).getTime() || 0,
  })).sort((a, b) => b.updatedAt - a.updatedAt);
  const query = searchTerm.trim().toLocaleLowerCase();
  const filteredChats = chats.filter(chat =>
    (activeTab === "archived" ? chat.is_archived : !chat.is_archived) &&
    `${chat.name} ${chat.tour_plan_title}`.toLocaleLowerCase().includes(query)
  );
  const unreadTotal = chats.filter(chat => !chat.is_archived).reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <section className="messaging-page text-[#172b43]" aria-labelledby="messages-title">
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ecdfc8] bg-[#fbf5e9] text-[#b88424]"><MessagesSquare size={23} /></span>
        <div className="min-w-0">
          <h1 id="messages-title" className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("messages")}</h1>
          <p className="mt-1 text-sm leading-relaxed text-[#77818e]">{t("chat_page_intro")}</p>
        </div>
      </div>
      <div className="messaging-workspace flex overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
        <aside aria-label={t("conversations")} className={`${urlChatId ? "hidden md:flex" : "flex"} w-full min-w-0 flex-col border-[#eeeae3] md:w-[300px] md:shrink-0 md:border-r xl:w-[340px]`}>
          <div className="border-b border-[#eeeae3] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-semibold">{t("conversations")}</h2>
              {unreadTotal > 0 && <span className="rounded-full bg-[#fbf2df] px-2.5 py-1 text-xs font-semibold text-[#9b701f]" aria-label={t("chat_unread_count", { count: unreadTotal })}>{unreadTotal}</span>}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c96a2]" size={17} />
              <input type="search" aria-label={t("search_chats_or_tour_plans")} placeholder={t("chat_search_placeholder")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="chat-search h-11 w-full rounded-xl border border-[#e4e7eb] bg-[#fafbfc] pl-10 pr-3 text-sm outline-none transition focus:border-[#c88f2a] focus:ring-2 focus:ring-[#c88f2a]/15" />
            </div>
            <div className="mt-4 flex gap-1 rounded-xl bg-[#f5f4f1] p-1" aria-label={t("chat_filter")}>
              {[["inbox", Inbox], ["archived", Archive]].map(([tab, Icon]) => (
                <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-[#c88f2a] ${activeTab === tab ? "bg-[#172b43] text-white shadow-sm" : "text-[#77818e] hover:bg-white"}`}>
                  <Icon size={15} className="shrink-0" />{t(tab)}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2" aria-busy={isLoading}>
            {isLoading ? <div role="status" className="flex items-center justify-center gap-2 p-8 text-sm text-[#77818e]"><LoaderCircle size={18} className="animate-spin" />{t("loading")}</div>
              : isError ? <div role="alert" className="p-6 text-center text-sm text-[#77818e]"><p>{t("error_loading_chat")}</p><button type="button" className="mt-3 font-semibold text-[#9b701f] underline" onClick={refetch}>{t("chat_retry")}</button></div>
              : filteredChats.length === 0 ? <div className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-[#77818e]"><MessagesSquare size={28} className="text-[#c8b38d]" /><p>{t("no_chats_found")}</p></div>
              : filteredChats.map(chat => (
                <button type="button" key={chat.id} onClick={() => navigate(`${basePath}/${chat.id}`, { state: { agency: chat } })} aria-current={urlChatId === chat.id ? "page" : undefined} className={`group mb-1 flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-[#c88f2a] ${urlChatId === chat.id ? "border-[#ebd8b1] bg-[#fbf6ec]" : "border-transparent hover:bg-[#f8f7f4]"}`}>
                  <ChatAvatar name={chat.name} image={chat.image} active={chat.active} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5"><span className="truncate text-sm font-semibold">{chat.name}</span>{chat.tourist_is_verified && <BadgeCheck size={15} className="shrink-0 text-[#b88424]" aria-label={t("chat_verified")} />}{chat.unreadCount > 0 && <span className="ml-auto shrink-0 rounded-full bg-[#dd9e2c] px-1.5 py-0.5 text-[11px] font-bold text-white" aria-label={t("chat_unread_count", { count: chat.unreadCount })}>{chat.unreadCount}</span>}</span>
                    <span className="mt-1 block truncate text-xs font-medium text-[#a27b36]">{chat.tour_plan_title}</span>
                    <span className="mt-1.5 block truncate text-xs leading-relaxed text-[#77818e]">{chat.lastMessage || t("no_messages_yet")}</span>
                  </span>
                </button>
              ))}
          </div>
        </aside>
        <div className={`${urlChatId ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col bg-[#faf9f6]`}>
          {urlChatId ? <Outlet /> : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[30px] border border-[#e9dfcf] bg-white text-[#b88424] shadow-[0_8px_30px_rgba(23,43,67,0.04)]"><MessagesSquare size={38} strokeWidth={1.5} /><span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#faf9f6] bg-[#172b43] text-white"><ArrowRight size={16} /></span></span>
              <h2 className="max-w-sm text-xl font-semibold tracking-tight">{t("select_a_chat")}</h2>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#77818e]">{t("chat_empty_description")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
