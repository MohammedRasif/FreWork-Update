import Footer from "@/Pages/Home/Footer";
import Navbar from "@/Pages/Home/Navbar";
import React from "react";
import { Outlet } from "react-router-dom";

const Main = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Main;
