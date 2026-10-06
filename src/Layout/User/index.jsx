import { ArrowUpRight, CalendarDays, CheckCircle2, ClipboardList, Heart, Plus, Send } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const tabs = [
  { path: "/cont", label: "created_plan", icon: ClipboardList },
  { path: "/cont/cereri-publicate", label: "published_plans", icon: Send },
  { path: "/cont/cereri-acceptate", label: "accepted_offers", icon: CheckCircle2 },
  { path: "/cont/favorite", label: "favourite_agencies", icon: Heart },
];

function HomeLayout({ children }) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const activeTab = tabs.find((tab) => tab.path === pathname) || tabs[0];
  const date = new Intl.DateTimeFormat(i18n.language === "ru" ? "ru-RU" : "ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <div className="user-plan-page min-w-0">
      <section className="flex flex-col justify-between gap-5 rounded-[26px] bg-[#172b43] px-6 py-7 text-white sm:gap-7 sm:px-9 sm:py-10 xl:flex-row xl:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 h-1 w-11 rounded-full bg-[#d6a044] sm:mb-5" />
          <h2 className="text-[28px] font-bold leading-tight tracking-tight sm:text-4xl">{t("welcome")}</h2>
          <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base sm:leading-7">{t("share_plan_subtitle")}</p>
        </div>
        <Link to="/cont/creeaza-cerere" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#c88f2a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#ad751c] xl:self-auto">
          <Plus size={18} aria-hidden="true" />{t("create_plan")}
        </Link>
      </section>

      <nav aria-label={t("my_all_plans")} className="mt-5 grid grid-cols-2 gap-2 rounded-[20px] border border-[#e9e6e0] bg-white p-2 shadow-[0_10px_35px_rgba(23,43,67,0.04)] sm:mt-6 xl:grid-cols-4">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = path === activeTab.path;
          return <Link key={path} to={path} aria-current={active ? "page" : undefined} className={`flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-center text-xs font-semibold leading-tight transition-colors sm:gap-2 sm:px-3 sm:text-sm ${active ? "bg-[#172b43] text-white shadow-sm" : "text-[#536477] hover:bg-[#f7f3ec] hover:text-[#172b43]"}`}>
            <Icon size={17} className="shrink-0" aria-hidden="true" /><span className="min-w-0">{t(label)}</span>
          </Link>;
        })}
      </nav>

      <div className="mt-8 grid min-w-0 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_260px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div><div className="mb-3 h-1 w-10 rounded-full bg-[#d6a044]" /><h3 className="text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">{t(activeTab.label)}</h3></div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#718092] sm:text-sm"><CalendarDays size={16} className="text-[#b98427]" aria-hidden="true" />{date}</span>
          </div>
          {children}
        </section>
        <aside className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427]"><Heart size={19} aria-hidden="true" /></div>
          <h3 className="mt-4 text-base font-bold text-[#172b43]">{t("need_fast_response")}</h3>
          <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#9b6b22] hover:underline">{t("click_here")}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </aside>
      </div>
    </div>
  );
}

export default HomeLayout;
