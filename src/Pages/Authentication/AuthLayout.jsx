import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import landscape from "../../assets/img/Mask group (3).png";
import BrandWordmark from "@/components/BrandWordmark";
import LanguageToggleButton from "../Home/LanguageToggleButton";

export const authInputClass = "h-12 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-[#172b43] placeholder:text-[#96a2af] focus:border-[#bd8525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20";

function AuthLayout({ title, description, children, wide = false }) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = `TreiOferte | ${title}`;
  }, [title, i18n.language]);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#172b43] lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <aside className="sticky top-0 hidden h-screen overflow-hidden bg-[#172b43] lg:block">
        <img src={landscape} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10243a]/95 via-[#10243a]/45 to-[#10243a]/15" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white xl:p-14">
          <div className="mb-6 h-1 w-12 rounded-full bg-[#d6a044]" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e4b154]">TreiOferte</p>
          <h2 className="mt-3 max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">{t("auth_panel_title")}</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/80">{t("auth_panel_description")}</p>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col px-4 pb-12 pt-5 sm:px-8 sm:pt-7 lg:px-10 xl:px-16">
        <div className="mx-auto flex w-full max-w-[620px] items-center justify-between gap-4">
          <NavLink to="/" className="inline-flex min-h-14 shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c88f2a] focus-visible:ring-offset-2 sm:min-h-16" aria-label="TreiOferte">
            <BrandWordmark className="sm:text-[28px]" />
          </NavLink>
          <LanguageToggleButton />
        </div>

        <div className="mx-auto flex w-full max-w-[620px] flex-1 items-center py-9 sm:py-12">
          <div className={`w-full rounded-[24px] border border-[#e9e6e0] bg-white p-6 shadow-[0_18px_55px_rgba(23,43,67,0.08)] sm:p-9 ${wide ? "xl:p-10" : ""}`}>
            <div className="mb-5 h-1 w-10 rounded-full bg-[#d6a044]" />
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#617082] sm:text-base">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
