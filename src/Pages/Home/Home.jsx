import React from "react";
import Banner from "./Banner";
import VacanzaMycost from "./VacanzaMycost";
import Published from "./Published";
import Agencies from "./Agencies";
import EasyandFast from "./EasyandFast";

const Home = () => {
  return (
    <div className="roboto pt-16">
      <Banner />
      <VacanzaMycost />
      <Published/>
      <Agencies/>
      <EasyandFast/>
    </div>
  );
};

export default Home;
