import { useEffect } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function SectionLinks({ sections, label, onSelect }) {
  return (
    <nav aria-label={label}>
      <ol className="space-y-1">
        {sections.map(({ id, number, title }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={onSelect}
              className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm leading-5 text-[#536477] transition-colors hover:bg-[#f7f2e9] hover:text-[#172b43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b98427]"
            >
              <span className="w-6 shrink-0 font-bold tabular-nums text-[#b98427]">{number.padStart(2, "0")}</span>
              <span className="min-w-0">{title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function LegalLayout({ title, documentTitle, documentIntro, documentLanguage, otherPage, sections, children }) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = `TreiOferte | ${title}`;
  }, [title, i18n.language]);

  return (
    <main className="legal-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <header className="bg-[#172b43] px-5 pb-24 pt-12 text-white sm:px-8 sm:pb-28 sm:pt-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-white/65">
            <Link to="/" className="hover:text-white">{t("home")}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="text-white">{title}</span>
          </nav>
          <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <h1 className="max-w-4xl break-words text-[clamp(1.4rem,7vw,1.875rem)] font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <Link to={otherPage.href} className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#d6a044] hover:text-[#e8ba66] lg:self-auto">
              {otherPage.label} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto -mt-10 grid max-w-7xl items-start gap-7 px-5 pb-20 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-9 lg:px-10">
        <aside className="min-w-0 lg:sticky lg:top-28">
          <div className="hidden max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded-[22px] border border-[#e9e6e0] bg-white p-4 shadow-[0_12px_35px_rgba(23,43,67,0.07)] lg:block">
            <h2 className="px-3 pb-3 pt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#9b6b22]">{t("legal_contents")}</h2>
            <SectionLinks sections={sections} label={t("legal_contents")} />
          </div>
          <details className="group rounded-[20px] border border-[#e9e6e0] bg-white shadow-[0_12px_35px_rgba(23,43,67,0.07)] lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-bold marker:hidden [&::-webkit-details-marker]:hidden">
              {t("legal_contents")}
              <ChevronRight size={18} className="text-[#b98427] transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div className="max-h-80 overflow-y-auto border-t border-[#eee9df] px-2 py-2">
              <SectionLinks sections={sections} label={t("legal_contents")} onSelect={(event) => { event.currentTarget.closest("details").open = false; }} />
            </div>
          </details>
        </aside>

        <div className="min-w-0">
          <div lang={documentLanguage} className="mb-5 rounded-[22px] border border-[#e9e6e0] bg-white px-6 py-7 shadow-[0_12px_35px_rgba(23,43,67,0.05)] sm:px-9 sm:py-9">
            <div className="mb-4 h-1 w-10 rounded-full bg-[#d6a044]" />
            <h2 className="break-words text-[15px] font-semibold leading-[1.5] min-[370px]:text-[17px] sm:text-2xl sm:font-bold sm:leading-snug">{documentTitle}</h2>
            {documentIntro && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#617082]">{documentIntro}</p>}
          </div>
          <article lang={documentLanguage} className="legal-article space-y-5">{children}</article>
          <p className="mt-10 text-center text-sm text-[#718092]">{t("copyright_2026")}</p>
        </div>
      </div>
    </main>
  );
}

export default LegalLayout;
