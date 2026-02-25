import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import img from "../../assets/img/Mask group (3).png";
import { useVerifyEmailMutation } from "@/redux/features/baseApi";
import { useTranslation } from "react-i18next";

const EmailVerification = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [verify, { isLoading }] = useVerifyEmailMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return alert(t("enter_email"));
    }

    try {
      const res = await verify({ email }).unwrap();
      console.log("Verify response:", res);

      navigate("/verifica-otp", { state: { email, to: "/recupero-password" } });
    } catch (error) {
      console.error("Error verifying email:", error);
      alert(
        error.data?.message || t("error_verifying_email")
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left image section */}
      <div className="w-full bg-blue-900 md:w-1/2 h-[30vh] md:h-screen relative">
        <img
          src={img}
          className="absolute inset-0 w-full h-full mx-auto object-cover opacity-70"
          alt={t("background")}
        />
      </div>

      {/* Right form section */}
      <div className="w-full md:w-1/2 min-h-[100vh] md:h-screen relative bg-blue-50 flex flex-col justify-center items-center">
        <div className="relative z-10 w-full max-w-xl p-8">
          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-sm bg-white/60 p-10 mb-10 rounded-lg border border-blue-200 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-blue-600 mb-10 text-center">
              {t("enter_your_email")}
            </h2>
            <div className="form-control w-full mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("enter_your_email_placeholder")}
                  className="input input-bordered border-blue-200 w-full pl-10 bg-white/70 text-blue-900 placeholder-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                  size={18}
                />
              </div>
            </div>

            <div className="pb-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn bg-blue-500 hover:bg-blue-600 text-white rounded-full w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("please_wait") : t("next")}
              </button>
              <div className="flex mx-auto justify-center">
                <Link
                  to="/login"
                  className="font-semibold mt-4 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                >
                  {t("back_to_login")}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;