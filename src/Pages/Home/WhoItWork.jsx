import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Faq from "./Faq";
import {
  CheckCircle,
  Shield,
  Zap,
  Phone,
  Star,
  Gift,
  Users,
} from "lucide-react";

const WhoItWork = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const steps = [
    {
      number: "1",
      icon: <Users className="w-8 h-8" />,
      title: t("howItWorks.1.title"),
      desc: t("howItWorks.1.desc"),
    },
    {
      number: "2",
      icon: <Gift className="w-8 h-8" />,
      title: t("howItWorks.2.title"),
      desc: t("howItWorks.2.desc"),
    },
    {
      number: "3",
      icon: <Star className="w-8 h-8" />,
      title: t("howItWorks.3.title"),
      desc: t("howItWorks.3.desc"),
    },
    {
      number: "4",
      icon: <Phone className="w-8 h-8" />,
      title: t("howItWorks.4.title"),
      desc: t("howItWorks.4.desc"),
    },
    {
      number: "5",
      icon: <CheckCircle className="w-8 h-8" />,
      title: t("howItWorks.5.title"),
      desc: t("howItWorks.5.desc"),
    },
    {
      number: "6",
      icon: <Shield className="w-8 h-8" />,
      title: t("howItWorks.6.title"),
      desc: t("howItWorks.6.desc"),
    },
    {
      number: "7",
      icon: <Zap className="w-8 h-8" />,
      title: t("howItWorks.7.title"),
      desc: t("howItWorks.7.desc"),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 pt-24">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
        {t("howItWorks.pageTitle")}
      </h1>
      <p className="text-center text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
        {t("howItWorks.subtitle")}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="absolute -top-6 left-8 bg-[#8280FF] text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl">
              {step.number}
            </div>

            <div className="flex justify-center mb-6 text-[#8280FF] mt-4">
              {step.icon}
            </div>

            <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
              {step.title}
            </h3>

            <p className="text-gray-600 text-center leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
      <Faq />
    </div>
  );
};

export default WhoItWork;
