import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import img from "../../assets/img/Mask group (3).png";
import {
  useOtpVerifyMutation,
  useReSendOtpMutation,
} from "@/redux/features/baseApi";

const OTP_Verification = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [regVerify, { isLoading }] = useOtpVerifyMutation();
  const [reSend, { isLoading: ResendLoading }] = useReSendOtpMutation();
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    // Validate OTP input
    if (!otp || otp.length < 4) {
      return alert("Please enter a 4-digit OTP.");
    }

    // Make sure we have email
    if (!location.state?.email) {
      return alert("No email found. Please try again.");
    }

    try {
      const res = await regVerify({
        otp,
        email: location.state.email,
      }).unwrap();

      console.log("OTP verify response:", res); // check the shape

      if (res.access && res.refresh) {
        localStorage.setItem("access_token", res.access);
        localStorage.setItem("refresh_token", res.refresh);
        navigate(location.state?.to ? "/reset_password" : "/login", {
          state: {
            email: location.state.email,
          },
        }); // Redirect only if successful
      } else {
        alert("OTP verification failed. Check the code or try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left image section */}
      <div className="w-full bg-blue-900 md:w-1/2 h-[30vh] md:h-screen relative">
        <img
          src={img}
          className="absolute inset-0 w-full h-full mx-auto object-cover opacity-70"
          alt="Background"
        />
      </div>

      {/* Right form section */}
      <div className="w-full md:w-1/2 min-h-[100vh] md:h-screen relative bg-blue-50 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-xl space-y-8">
          <form className="backdrop-blur-sm bg-white/60 p-10 mb-10 rounded-lg border border-blue-200 shadow-xl">
            <h2 className="text-3xl font-bold text-blue-600 mb-10 text-center">
              Verify your OTP
            </h2>
            <div className="form-control w-full mb-6">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter your OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={4}
                  className="input input-bordered border-blue-200 w-full pl-10 bg-white/70 text-blue-900 placeholder-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 "
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                  size={18}
                />
              </div>
            </div>

            <div className="pb-2">
              <button
                onClick={(e) => handleOtpSubmit(e)}
                className="btn bg-blue-500 hover:bg-blue-600 text-white rounded-full w-full text-base"
              >
                Next
              </button>

              <div className="flex mx-auto justify-center">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await reSend({
                        email: location.state.email,
                      }).unwrap();
                      alert(res.message || "OTP resent successfully!");
                    } catch (error) {
                      alert(error.data?.message || "Error sending OTP again.");
                    }
                  }}
                  disabled={ResendLoading}
                  className="font-semibold mt-4 text-sm text-blue-500 hover:text-blue-600 hover:underline hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ResendLoading ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTP_Verification;
