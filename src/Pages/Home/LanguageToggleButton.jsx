import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n.js"; 

const spring = {
  type: "spring",
  stiffness: 700,
  damping: 30,
};

const LanguageToggleButton = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const changeHandler = (lng) => {
      setCurrentLang(lng);
    };

    i18n.on("languageChanged", changeHandler);

    // Cleanup
    return () => {
      i18n.off("languageChanged", changeHandler);
    };
  }, []);

  const isItalian = currentLang === "ita";

  const toggleLanguage = () => {
    const newLang = isItalian ? "en" : "ita";
    i18n.changeLanguage(newLang);
  };

  return (
    <motion.div
      className="w-[150px] h-11 bg-gray-200 rounded-full flex justify-between items-center py-1 cursor-pointer relative shadow-md"
      onClick={toggleLanguage}
      layout
      transition={spring}
    >
      <motion.div
        className="w-[72px] h-9 rounded-full absolute top-[5px] flex justify-center items-center font-bold text-white shadow-lg bg-[#8280FF]"
        animate={{ x: isItalian ? 75 : 5 }}
        transition={spring}
      />

      <motion.span
        className={`text-sm w-1/2 pl-2 pt-[1px] text-center z-10 font-semibold ${
          isItalian ? "text-gray-500" : "text-white"
        }`}
      >
        {t("English")}
      </motion.span>

      <motion.span
        className={`text-sm w-1/2 pt-[1px] text-center z-10 font-semibold ${
          isItalian ? "text-white" : "text-gray-500"
        }`}
      >
        {t("Italian")}
      </motion.span>
    </motion.div>
  );
};

export default LanguageToggleButton;