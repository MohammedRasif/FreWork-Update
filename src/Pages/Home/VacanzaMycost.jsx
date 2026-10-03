import { ClipboardList, MessagesSquare, PlaneTakeoff } from "lucide-react";
import { useTranslation } from "react-i18next";

const VacanzaMycost = () => {
  const { t } = useTranslation();
  const steps = [
    {
      icon: ClipboardList,
      title: t("publish_requests"),
      description: t("enter_travel_request"),
    },
    {
      icon: MessagesSquare,
      title: t("receive_personalized_offers"),
      description: `${t("get_convenient_proposals")} ${t("from_travel_agencies")}`,
    },
    {
      icon: PlaneTakeoff,
      title: t("choose_and_go"),
      description: `${t("easily_contact_agency")} ${t("and_book_directly")}`,
    },
  ];

  return (
    <section className="bg-[#faf9f6] px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 max-w-2xl sm:mb-12">
          <div className="mb-4 h-1 w-12 rounded-full bg-[#d6a044]" />
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#172b43] sm:text-4xl lg:text-[44px]">
            {t("lets_use_vacanzamycost")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(24,42,60,0.04)] sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]">
                  <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span className="text-sm font-bold tracking-[0.16em] text-[#a8b0ba]">0{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold leading-snug text-[#172b43] sm:text-2xl">{title}</h3>
              <p className="mt-3 text-base leading-7 text-[#5a6878]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VacanzaMycost;
