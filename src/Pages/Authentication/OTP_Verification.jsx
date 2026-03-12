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
            navigate("/in-attesa", {
              state: { email: location.state?.email },
            });
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

      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[6px] z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative">
            {/* Background image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="beach background"
                className="w-full h-full object-cover opacity-40"
              />
            </div>
            {/* Content */}
            <div className="relative px-8 py-10 md:px-12 md:py-12 text-center">
              {/* Close button */}
              <button
                onClick={closeSuccessPopup}
                className="absolute top-4 right-5 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* Green checkmark */}
              <div className="mx-auto mb-6 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="4"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Main title */}
              <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-3">
                {t("request_received_successfully")}
                {/* fallback: "Richiesta ricevuta con successo!" */}
              </h2>

              {/* Thank you text */}
              <p className="text-gray-700 text-lg mb-8 font-medium">
                {t("thank_you_for_choosing_vacanzamycost")}
              </p>

              <hr className="my-6 border-gray-200" />

              {/* What's next section */}
              <div className="text-left space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">
                  {t("what_happens_next")}
                  {/* fallback: "Cosa succede ora?" */}
                </h3>

                <p>
                  {t("expert_will_verify_details")}
                  {/* fallback: "Un nostro esperto verificherà personalmente i dettagli della tua richiesta." */}
                </p>

                <p>
                  {t("you_will_receive_verification_call")}
                  {/* fallback: "Riceverai una breve chiamata di verifica a breve per confermare i dati." */}
                </p>

                <p>
                  {t("request_sent_to_agencies")}
                  {/* fallback: "Una volta verificata, la tua richiesta verrà inviata alle 3 migliori agenzie di viaggio specializzate, che prepareranno le tue offerte personalizzate." */}
                </p>
              </div>

              {/* Closing text */}
              <p className="mt-8 text-gray-800 font-medium text-lg">
                {t("see_you_soon")}
                {/* fallback: "A presto!" */}
              </p>

              {/* Close button */}
              <button
                onClick={closeSuccessPopup}
                className="mt-8 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("close")}
                {/* fallback: "Chiudi" */}
              </button>
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
