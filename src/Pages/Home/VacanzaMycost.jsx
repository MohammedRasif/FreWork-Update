import { ClipboardList, MessagesSquare, PlaneTakeoff } from "lucide-react";
import { useTranslation } from "react-i18next";

const VacanzaMycost = () => {
  const { t } = useTranslation();
  const steps = [
    {
      icon: ClipboardList,
      title: t("publish_requests"),
      mobileTitle: t("home_mobile.steps.publish"),
      description: t("enter_travel_request"),
    },
    {
      icon: MessagesSquare,
      title: t("receive_personalized_offers"),
      mobileTitle: t("home_mobile.steps.receive"),
      description: `${t("get_convenient_proposals")} ${t("from_travel_agencies")}`,
    },
    {
      icon: PlaneTakeoff,
      title: t("choose_and_go"),
      mobileTitle: t("home_mobile.steps.choose"),
      description: `${t("easily_contact_agency")} ${t("and_book_directly")}`,
    },
  ];

  return (
    <section className="bg-[#faf9f6] px-5 py-10 md:px-8 md:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 max-w-2xl md:mb-12">
          <div className="mb-4 h-1 w-12 rounded-full bg-[#d6a044]" />
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#172b43] md:text-4xl lg:text-[44px]">
            {t("lets_use_vacanzamycost")}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          {steps.map(({ icon: Icon, title, mobileTitle, description }, index) => (
            <div key={title} className="min-w-0 rounded-2xl border border-[#e9e6e0] bg-white px-1 py-4 shadow-[0_10px_35px_rgba(24,42,60,0.04)] md:rounded-[22px] md:p-8">
              <div className="mb-2 flex items-center justify-center md:mb-7 md:justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427] md:h-14 md:w-14 md:rounded-2xl">
                  <Icon size={28} strokeWidth={1.8} className="h-5 w-5 md:h-7 md:w-7" aria-hidden="true" />
                </div>
                <span className="hidden text-sm font-bold tracking-[0.16em] text-[#a8b0ba] md:inline">0{index + 1}</span>
              </div>
              <h3 className="break-normal text-center text-[clamp(10px,3.125vw,12px)] font-bold leading-snug text-[#172b43] md:text-left md:text-2xl"><span className="md:hidden">{mobileTitle}</span><span className="hidden md:inline">{title}</span></h3>
              <p className="mt-3 hidden text-base leading-7 text-[#5a6878] md:block">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VacanzaMycost;
