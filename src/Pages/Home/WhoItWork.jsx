import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, CheckCircle2, Gift, Phone, ShieldCheck, Star, Users, Zap } from "lucide-react";
import Faq from "./Faq";

const stepIcons = [Users, Gift, Star, Phone, CheckCircle2, ShieldCheck, Zap];

function StepDescription({ description }) {
  return (
    <div className="space-y-1.5 text-sm leading-6 text-[#586879]">
      {description.split("\n").map((line, index) => {
        const text = line.trim();
        if (!text) return null;
        if (text.startsWith("–")) {
          return <p key={index} className="flex items-start gap-2 pl-1"><span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c88f2a]" aria-hidden="true" /><span>{text.slice(1).trim()}</span></p>;
        }
        return <p key={index}>{text}</p>;
      })}
    </div>
  );
}

function WhoItWork() {
  const { t, i18n } = useTranslation();

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { document.title = `TreiOferte | ${t("who_work")}`; }, [i18n.language, t]);

  return (
    <main className="how-it-works-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <section className="bg-[#172b43] px-5 pb-20 pt-14 text-white sm:px-8 sm:pb-24 sm:pt-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("howItWorks.pageTitle")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{t("howItWorks.subtitle")}</p>
          </div>
          <Link to="/" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#d49a36] px-6 py-3 font-bold text-[#172b43] transition-colors hover:bg-[#ebae47] lg:self-auto">{t("create_request")} <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-2xl">
            <div className="mb-4 h-1 w-12 rounded-full bg-[#d6a044]" />
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t("how_steps_title")}</h2>
          </div>
          <ol className="grid gap-x-5 gap-y-9 pt-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
            {stepIcons.map((Icon, index) => (
              <li key={index} className="min-w-0 md:last:col-span-2 lg:last:col-span-1 lg:last:col-start-2">
                <article className="relative flex h-full min-w-0 flex-col rounded-[24px] border border-[#e9e6e0] bg-white px-6 pb-7 pt-9 shadow-[0_10px_35px_rgba(23,43,67,0.04)] sm:px-7">
                  <span className="absolute -top-5 left-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#c88f2a] text-lg font-bold text-white shadow-[0_6px_16px_rgba(200,143,42,0.25)]" aria-hidden="true">{index + 1}</span>
                  <span className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]"><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></span>
                  <h3 className="mb-4 mt-4 break-words text-center text-lg font-bold leading-snug text-[#172b43] sm:text-xl">{t(`howItWorks.${index + 1}.title`)}</h3>
                  <StepDescription description={t(`howItWorks.${index + 1}.desc`)} />
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Faq />

      <section className="bg-[#faf9f6] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-[28px] bg-[#172b43] px-7 py-10 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-end lg:px-14">
          <div className="max-w-2xl">
            <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
            <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{t("how_ready_title")}</h2>
            <p className="mt-3 text-base leading-7 text-white/75">{t("how_ready_description")}</p>
          </div>
          <Link to="/" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#d49a36] px-6 py-3 font-bold text-[#172b43] transition-colors hover:bg-[#ebae47]">{t("create_request")} <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}

export default WhoItWork;
