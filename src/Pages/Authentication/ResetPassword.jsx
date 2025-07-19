import React, { useState } from "react";
import { Lock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import img from "../../assets/img/Mask group (3).png";
import { useNewPasswordMutation } from "@/redux/features/withAuth";
import { useUpdatePasswordMutation } from "@/redux/features/baseApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const email = location.state?.email || "";

  const [setNew, { isLoading }] = useUpdatePasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match!");
    }

    if (!email) {
      return alert(
        "No email found. Please go back and enter your email again."
      );
    }

    try {
      // ✅ Send the new password & email to your API
      const res = await setNew({
        email,
        password: newPassword,
      }).unwrap();

      // ✅ Check response and navigate
      console.log("Password reset response:", res);
      alert(res.message || "Password successfully reset!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(
        error.data?.message || "Error resetting password. Please try again."
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
          alt="Background"
        />
      </div>

      {/* Right form section */}
      <div className="w-full md:w-1/2 min-h-[100vh] md:h-screen relative bg-blue-50 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-xl space-y-8">
          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-sm bg-white/60 p-10 mb-10 rounded-lg border border-blue-200 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-blue-600 mb-10 text-center">
              Reset your Password
            </h2>

            {/* New Password */}
            <div className="form-control w-full mb-6">
              <div className="relative">
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input input-bordered border-blue-200 w-full pl-10 bg-white/70 text-blue-900 placeholder-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                  size={18}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-control w-full mb-6">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input input-bordered border-blue-200 w-full pl-10 bg-white/70 text-blue-900 placeholder-blue-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                  size={18}
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pb-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn bg-blue-500 hover:bg-blue-600 text-white rounded-full w-full text-base disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
