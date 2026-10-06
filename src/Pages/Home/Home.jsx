import React, { useEffect } from "react";
import Banner from "./Banner";
import VacanzaMycost from "./VacanzaMycost";
import Published from "./Published";
import Agencies from "./Agencies";
import EasyandFast from "./EasyandFast";
import { useTranslation } from "react-i18next";


const Home = () => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    document.title = `TreiOferte | ${t("home")}`;
  }, [i18n.language, t]);
  return (
    <div className="home-page bg-[#faf9f6] pt-[72px] xl:pt-[82px]">
      <Banner />
      <VacanzaMycost />
      <Published />
      <Agencies />
      <EasyandFast />
    </div>
  );
};

export default Home;
