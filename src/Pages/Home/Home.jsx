import React from "react";
import Banner from "./Banner";
import VacanzaMycost from "./VacanzaMycost";
import Published from "./Published";
import Agencies from "./Agencies";
import EasyandFast from "./EasyandFast";
import { Helmet } from "react-helmet-async";

const Home = () => {
  return (
    <div className="roboto pt-16">
      <Helmet>
        <title> vacanzamycost.it | Home</title>
      </Helmet>
      <Banner />
      <VacanzaMycost />
      <Published />
      <Agencies />
      <EasyandFast />
    </div>
  );
};

export default Home;
