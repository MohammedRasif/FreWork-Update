import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

function Faq() {
  const { t, ready } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(-1);
  const translatedQuestions = t("faq", { returnObjects: true });
  const questions = Array.isArray(translatedQuestions) ? translatedQuestions : [];

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
        <div>
          <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
          <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-[#172b43] sm:text-4xl">{t("faq_title")}</h2>
        </div>
        <div className="space-y-3">
          {!ready || questions.length === 0
            ? <p className="rounded-[20px] border border-[#e9e6e0] bg-[#faf9f6] p-6 text-[#617082]">{t("loading_faq")}</p>
            : questions.map((item, index) => {
              const isOpen = activeIndex === index;
              return (
                <div key={index} className="overflow-hidden rounded-[20px] border border-[#e9e6e0] bg-white shadow-[0_8px_26px_rgba(23,43,67,0.035)]">
                  <h3>
                    <button
                      type="button"
                      id={`faq-question-${index}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => setActiveIndex(isOpen ? -1 : index)}
                      className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left text-base font-bold leading-6 text-[#243b50] transition-colors hover:bg-[#faf9f6] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#c88f2a] sm:px-6"
                    >
                      <span>{item.question}</span>
                      <ChevronDown size={20} className={`mt-0.5 shrink-0 text-[#b98427] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={!isOpen} className="border-t border-[#edf0f2] px-5 py-5 text-sm leading-7 text-[#586879] sm:px-6 sm:text-base">{item.answer}</div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

export default Faq;
