import { NavLink } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, Clock3, LockKeyhole, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import agencyImage from "../../assets/img/contact.jpg";

const EasyandFast = () => {
  const { t } = useTranslation();
  const benefits = [
    { icon: Wallet, title: "no_commission", description: "no_commission_desc" },
    { icon: Clock3, title: "fast_replies", description: "fast_replies_desc" },
    { icon: BadgeCheck, title: "verified_agencies", description: "verified_agencies_desc" },
    { icon: LockKeyhole, title: "verified_agencies_contact", description: "verified_agencies_desc_decide" },
  ];

  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl sm:mb-12">
          <div className="mb-4 h-1 w-12 rounded-full bg-[#d6a044]" />
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#172b43] sm:text-4xl lg:text-[44px]">
            {t("why_use_vacanza")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex min-w-0 gap-5 rounded-[22px] border border-[#e9edf0] bg-[#f8fafb] p-6 sm:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0f2] text-[#243e51]">
                <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold leading-snug text-[#1d334a] sm:text-xl">{t(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5b6978] sm:text-base">{t(description)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 overflow-hidden rounded-[28px] bg-[#172b43] text-white shadow-[0_24px_65px_rgba(23,43,67,0.13)] lg:mt-24 lg:grid lg:grid-cols-2">
          <div className="relative min-h-[250px] sm:min-h-[360px] lg:min-h-full">
            <img src={agencyImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#172b43]/35 to-transparent" />
          </div>
          <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.13em] text-[#e4b154]">{t("start_earning")}</p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t("add_your_agency")}</h2>
            <p className="mt-6 text-base leading-7 text-white/80">{t("agency_desc_1")}</p>
            <p className="mt-3 text-base leading-7 text-white/80">{t("agency_desc_2")}</p>
            <NavLink to="/pentru-agentii" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d49a36] px-6 py-3 font-bold text-[#172b43] transition-colors hover:bg-[#ebae47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {t("for_agencies")} <ArrowUpRight size={18} aria-hidden="true" />
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EasyandFast;
