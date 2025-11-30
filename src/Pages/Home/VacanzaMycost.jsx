import img from "../../assets/img/Group.png";
import img1 from "../../assets/img/hello.png";
import img2 from "../../assets/img/discount 1.png";
import img3 from "../../assets/img/booking.png";
import { useTranslation } from "react-i18next";

const VacanzaMycost = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      <div className="text-center pt-1 md:pt-16">
        {/* <p className="text-gray-700 text-[14px] md:text-lg lg:mb-4 font-medium">
          {t("what_we_offer")}
        </p> */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-[#3F4C65]">
          {t("lets_use_vacanzamycost")}
        </h1>
      </div>
      <div className="relative">
        <img
          src={img}
          alt="Background"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[25vh] sm:h-[60vh] md:h-[80vh] z-0 object-contain hidden md:block"
        />
        <div className="absolute top-0 left-0 w-full h-full z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center min-h-[20vh] md:h-[60vh] px-1 py-0">
          <div className="flex flex-row gap-4 items-center justify-center space-x-6 md:space-x-20 lg:space-x-32 w-full overflow-x-auto h-full">
            <div className="flex flex-col items-center text-center md:rounded-full lg:shadow-xl p-3 md:p-8 w-[80px] md:w-[290px] lg:bg-white">
              <div className="relative">
                <div className="w-16 h-16 md:w-28 md:h-28 flex items-center justify-center">
                  <img
                    src={img1}
                    alt="Publish Request"
                    className="h-12 md:h-24"
                  />
                </div>
              </div>
              <h3 className="text-[13px] md:text-2xl font-semibold text-cyan-600 mb-1 md:mb-4">
                {t("publish_requests")}
              </h3>
              <p className="text-gray-600 text-[10px] md:text-base leading-relaxed font-medium hidden md:block">
                {t("enter_travel_request")}
                <br />
                {t("in_just_a_few_clicks")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center md:rounded-full lg:shadow-xl p-3 md:p-8 w-[80px] md:w-[300px] lg:bg-white">
              <div className="relative">
                <div className="w-16 h-16 md:w-28 md:h-28 flex items-center justify-center ">
                  <img
                    src={img2}
                    alt="Personalized Offers"
                    className="h-12 md:h-24"
                  />
                </div>
              </div>
              <h3 className="text-[13px] md:text-2xl font-semibold text-cyan-600 mb-1 md:mb-4">
                {t("receive_personalized_offers")}
              </h3>
              <p className="text-gray-600 text-[10px] md:text-base leading-relaxed font-medium hidden md:block">
                {t("get_convenient_proposals")}
                <br />
                {t("from_travel_agencies")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center md:rounded-full lg:shadow-xl p-3 md:p-8 w-[80px] md:w-[280px] lg:bg-white lg:-mt-0 -mt-4">
              <div className="relative">
                <div className="w-16 h-16 md:w-28 md:h-28 flex items-center justify-center lg:mt-0 mt-3">
                  <img
                    src={img3}
                    alt="Free Booking"
                    className="h-14 md:h-24"
                  />
                </div>
              </div>
              <h3 className="text-[13px] md:text-2xl font-semibold text-cyan-600 mb-1 md:mb-4">
                {t("choose_and_go")}
              </h3>
              <p className="text-gray-600 text-[10px] md:text-base leading-relaxed font-medium hidden md:block">
                {t("easily_contact_agency")}
                <br />
                {t("and_book_directly")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacanzaMycost;