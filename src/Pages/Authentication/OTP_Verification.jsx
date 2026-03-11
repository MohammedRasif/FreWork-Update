import React, { useState } from "react";
import { Lock, X } from "lucide-react"; // ← added X icon
import { Link, useLocation, useNavigate } from "react-router-dom";
import img from "../../assets/img/Mask group (3).png";
import {
  useOtpVerifyMutation,
  useReSendOtpMutation,
} from "@/redux/features/baseApi";
import { useTranslation } from "react-i18next";

const OTP_Verification = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showTouristPopup, setShowTouristPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [regVerify, { isLoading }] = useOtpVerifyMutation();
  const [reSend, { isLoading: ResendLoading }] = useReSendOtpMutation();
  const openTouristPopup = () => {
    const userType = localStorage.getItem("userType");

    if (userType === "tourist") {
      setShowSuccessPopup(false);
      setShowTouristPopup(true);

      setTimeout(() => {
        setShowTouristPopup(false);

        navigate("/user/modifica-profilo", {
          state: { email: location.state?.email },
        });
      }, 5000);
    }
  };
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      return alert(t("enter_4_digit_otp"));
    }

    if (!location.state?.email) {
      return alert(t("no_email_found"));
    }

    try {
      const res = await regVerify({
        otp,
        email: location.state.email,
      }).unwrap();

      if (res.access && res.refresh) {
        localStorage.setItem("access_token", res.access);
        localStorage.setItem("refresh_token", res.refresh);

        const userType = localStorage.getItem("userType");

        setShowSuccessPopup(true);

        if (userType === "tourist") {
          setShowSuccessPopup(true);

          setTimeout(() => {
            openTouristPopup();
          }, 300000);
        } else if (userType === "agency") {
          setTimeout(() => {
            setShowSuccessPopup(false);

            navigate("/in-attesa", {
              state: { email: location.state?.email },
            });
          }, 4000);
        }
      } else {
        alert(t("otp_verification_failed"));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.data?.message || t("otp_verification_failed"));
    }
  };

  const closeSuccessPopup = () => {
  openTouristPopup();
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Left image */}
      <div className="w-full bg-blue-900 md:w-1/2 h-[30vh] md:h-screen relative">
        <img
          src={img}
          className="absolute inset-0 w-full h-full mx-auto object-cover opacity-70"
          alt={t("background")}
        />
      </div>

      {/* Right form */}
      <div className="w-full md:w-1/2 min-h-[100vh] md:h-screen relative bg-blue-50 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-xl space-y-8">
          <form className="backdrop-blur-sm bg-white/60 p-10 mb-10 rounded-lg border border-blue-200 shadow-xl">
            <h2 className="text-3xl font-bold text-blue-600 mb-10 text-center">
              {t("verify_your_otp")}
            </h2>
            <div className="form-control w-full mb-6">
              <div className="relative">
                <input
                  type="number"
                  placeholder={t("enter_your_otp")}
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={4}
                  className="input input-bordered border-blue-200 w-full pl-10 bg-white/70 text-blue-900 placeholder-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                  size={18}
                />
              </div>
            </div>

            <div className="pb-2">
              <button
                onClick={handleOtpSubmit}
                disabled={isLoading}
                className="btn bg-blue-500 hover:bg-blue-600 text-white rounded-full w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("verifying") : t("next")}
              </button>

              <div className="flex mx-auto justify-center">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await reSend({
                        email: location.state.email,
                      }).unwrap();
                      alert(res.message || t("otp_resent_success"));
                    } catch (error) {
                      alert(error.data?.message || t("error_sending_otp"));
                    }
                  }}
                  disabled={ResendLoading}
                  className="font-semibold mt-4 text-sm text-blue-500 hover:text-blue-600 hover:underline hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ResendLoading ? t("sending") : t("resend_code")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Thank You Success Popup – appears for all on OTP success */}
      {showSuccessPopup && (
        <div className="backdrop-blur-[5px] fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-lg w-[90%] relative">
            {/* Close button */}
            <button
              onClick={closeSuccessPopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={28} />
            </button>

            <h3 className="text-2xl md:text-3xl font-bold text-green-600 mb-4">
              {t("thank_you_for_registering") || "Thank you for registering!"}
            </h3>
            <p className="text-gray-700 text-lg mb-6">
              {t("registration_success_message") ||
                "Your account has been successfully created."}
            </p>

            {/* You can add Google ad, link, button etc. here */}
            <div className="mt-6">
              {/* Example placeholder for future ad/link */}
              <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-500">
                Google Ad / Banner space
              </div>

              <a
                href="https://example.com"
                target="_blank"
                className="btn btn-outline btn-primary mt-4"
              >
                Visit our website
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Old tourist-specific popup (7-second auto close) */}
      {showTouristPopup && (
        <div className="backdrop-blur-[5px] fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-12 md:p-16 text-center max-w-xl">
            <p className="text-blue-600 font-semibold text-2xl">
              {t("complete_profile_now")}
            </p>
            <p className="text-gray-600 mt-2 text-xl pb-1">
              {t("access_full_dashboard")}
            </p>
            <p className="text-gray-600 mt-2 text-xl">{t("please_wait")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTP_Verification;
