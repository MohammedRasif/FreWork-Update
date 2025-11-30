import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n.js";

const LanguageToggleButton = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  useEffect(() => {
    const changeHandler = (lng) => {
      setCurrentLang(lng);
    };
    i18n.on("languageChanged", changeHandler);
    return () => i18n.off("languageChanged", changeHandler);
  }, []);

  const isItalian = currentLang === "ita" || currentLang === "it";

  const toggleLanguage = () => {
    const newLang = isItalian ? "en" : "ita";
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      onClick={toggleLanguage}
      className="w-[75px] h-9 bg-gray-200 rounded-full flex justify-between items-center py-1 cursor-pointer relative shadow-md"
    >
      {/* Sliding Ball - Without framer-motion, using only Tailwind */}
      <div
        className={`w-[30px] h-7 rounded-full absolute top-[5px] flex justify-center items-center font-bold text-white shadow-lg bg-[#8280FF] transition-all duration-300 ease-in-out ${
          isItalian ? "left-[40px]" : "left-[8px]"
        }`}
      />

      {/* EN */}
      <span
        className={`text-sm w-1/2 pl-2 pt-[1px] text-center z-10 font-semibold ${
          isItalian ? "text-gray-500" : "text-white"
        }`}
      >
        En
      </span>

      {/* IT */}
      <span
        className={`text-sm w-1/2 pt-[1px] text-center z-10 font-semibold ${
          isItalian ? "text-white" : "text-gray-500"
        }`}
      >
        It
      </span>
    </div>
  );
};

export default LanguageToggleButton;