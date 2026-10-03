import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const storageKey = "vmc_cookie_consent";
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem(storageKey);

    if (!consent) {
      setShowBanner(true);
    } else if (consent === "accepted") {
      initTrackingScripts();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(storageKey, "accepted");
    setShowBanner(false);
    initTrackingScripts();
  };

  const handleReject = () => {
    localStorage.removeItem(storageKey);
    setShowBanner(false);
  };

  const initTrackingScripts = () => {
    console.log("Tracking scripts start here");
  };

  if (!showBanner) return null;

  return (
    <div className="vmc-cookie-banner show">
      <div className="vmc-cookie-content">
        <h4>{t("cookie_title")}</h4>
        <p>
          {t("cookie_desc")}{" "}
          <a href="/politica-de-confidentialitate">{t("privacy_policy")}</a>
        </p>
      </div>

      <div className="vmc-cookie-actions">
        <button className="vmc-btn vmc-btn-outline cursor-pointer" onClick={handleReject}>
          {t("decline")}
        </button>

        <button className="vmc-btn vmc-btn-primary bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] cursor-pointer" onClick={handleAccept}>
          {t("accept_all")}
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
