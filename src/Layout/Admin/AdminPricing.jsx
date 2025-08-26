import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircleSharp, IoCheckmarkDoneSharp } from "react-icons/io5";
import img from "../../assets/img/Vector 63.png";
import { useNavigate } from "react-router-dom";
import {
  useShowSubscriptionDataQuery,
  useSubscriptionMutation,
} from "@/redux/features/withAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const { data: subscriptionData, isLoading } = useShowSubscriptionDataQuery();
  const [subscription, { isLoading: isSubscribing, error: subscriptionError }] =
    useSubscriptionMutation();
  const navigate = useNavigate();

  // Handle subscription error toast with useEffect to prevent duplicates
  useEffect(() => {
    if (subscriptionError) {
      const errorMessage =
        subscriptionError?.data?.detail || "Failed to process subscription";
      toast.error(errorMessage, {
        toastId: "subscription-error",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }, [subscriptionError]);

  // Customized Free User plan
  const freePlan = {
    name: "Free User",
    limit: "5",
    limitUnit: "Query/Day",
    price: "0/month",
    features: [
      "Includes general source databases",
      "Limited free queries per bot day",
      "No access to specific, company, or private databases",
    ],
  };

  // Function to handle plan selection
  const handleSelectPlan = async (planName) => {
    console.log(`Selected plan: ${planName}`);
    if (planName === "premium") {
      // Check for access_token in localStorage
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.log("No access token found, redirecting to /login");
        toast.info("Please log in to subscribe to the Premium plan.", {
          toastId: "login-required",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        navigate("/login", { state: { from: "/admin/pricing" } });
        return;
      }

      try {
        console.log("Attempting to trigger subscription mutation...");
        const response = await subscription({ plan_id: "premium" }).unwrap();
        console.log("Subscription response:", response);
        // Check for checkout_url in response and redirect
        if (response?.checkout_url) {
          console.log("Redirecting to checkout URL:", response.checkout_url);
          window.location.href = response.checkout_url;
        } else {
          toast.success("Subscription successful!", {
            toastId: "subscription-success",
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } catch (error) {
        console.error("Subscription error:", error);
        // Error toast is handled by useEffect
      }
    } else {
      console.log("Free plan selected, no mutation needed.");
      toast.info("Free plan selected!", {
        toastId: "free-plan-selected",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <section className="pt-5 roboto bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="uppercase text-center text-3xl sm:text-4xl font-medium text-gray-600 mb-3 sm:mb-5 tracking-wider">
          Pricing and Packages
        </h1>
        <h1 className="text-[16px] text-center font-medium text-gray-600 mb-5">
          Find your best package here
        </h1>

        {/* Membership Info */}
        <div className="flex items-center justify-between border border-gray-400 m-5 p-3 rounded-md">
          <div>
            <h1 className="text-[16px] text-gray-700 font-medium">
              Date of Starting
            </h1>
            <h1 className="text-[13px] text-gray-700">12 July, 2025</h1>
          </div>
          <div>
            <h1 className="text-[16px] text-gray-700 font-medium">
              Membership (Current)
            </h1>
            <h1 className="text-[13px] text-gray-700">Freebie</h1>
          </div>
          <div>
            <h1 className="text-[16px] text-gray-700 font-medium">Date of end</h1>
            <h1 className="text-[13px] text-gray-700">12 July, 2025</h1>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <p className="text-center text-gray-600">Loading plans...</p>
        )}

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-16">
          <AnimatePresence mode="wait">
            {/* Free Plan Card */}
            <motion.div
              key="free-plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="bg-white w-[38vh] rounded-lg shadow-xl overflow-hidden flex flex-col h-full border border-gray-300 roboto transition-transform transform hover:scale-105"
            >
              <div className="relative">
                <div className="w-3/4 rounded-r-lg my-10 relative">
                  <img
                    src={img}
                    alt="Plan background"
                    className="w-full h-auto"
                  />
                  <h3 className="absolute top-4 left-4 text-slate-700 font-bold text-xl z-10">
                    {freePlan.name}
                  </h3>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold text-slate-700">
                      {freePlan.price}
                    </span>
                  </div>
                  <p className="text-slate-500 text-base mt-1">
                    Measurable results
                  </p>
                </div>
                <button
                  className="w-full bg-[#3776E2] text-white py-3 rounded-md mb-4 hover:bg-[#00669e] transition-colors cursor-pointer text-lg font-semibold"
                  onClick={() => handleSelectPlan("free")}
                  disabled={isSubscribing}
                >
                  Select
                </button>
                <p className="text-slate-500 text-base mb-6">
                  Contact us for more Details
                </p>
                <div className="mb-4 flex-grow">
                  <div className="flex items-center mb-3">
                    <span className="text-slate-700 font-semibold text-lg">
                      Features
                    </span>
                    <div className="ml-2 text-[#3776E2]">
                      <IoCheckmarkCircleSharp size={20} />
                    </div>
                  </div>
                  <ul className="space-y-3 text-base text-slate-600">
                    {freePlan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <IoCheckmarkDoneSharp
                          className="text-[#3776E2] mt-1 mr-2 flex-shrink-0"
                          size={20}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Premium Plan Card */}
            {!isLoading && subscriptionData?.premium && (
              <motion.div
                key="premium-plan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white w-[38vh] rounded-lg shadow-xl overflow-hidden flex flex-col h-full border border-gray-300 roboto transition-transform transform hover:scale-105"
              >
                <div className="relative">
                  <div className="w-3/4 rounded-r-lg my-10 relative">
                    <img
                      src={img}
                      alt="Plan background"
                      className="w-full h-auto"
                    />
                    <h3 className="absolute top-4 left-4 text-slate-700 font-bold text-xl z-10">
                      {subscriptionData.premium.name}
                    </h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-slate-700">
                        {subscriptionData.premium.price}
                      </span>
                    </div>
                    <p className="text-slate-500 text-base mt-1">
                      Measurable results
                    </p>
                  </div>
                  <button
                    className="w-full bg-[#3776E2] text-white py-3 rounded-md mb-4 hover:bg-[#00669e] transition-colors cursor-pointer text-lg font-semibold"
                    onClick={() => handleSelectPlan("premium")}
                    disabled={isSubscribing || isLoading}
                  >
                    {isSubscribing ? "Subscribing..." : "Select"}
                  </button>
                  <p className="text-slate-500 text-base mb-6">
                    Contact us for more Details
                  </p>
                  <div className="mb-4 flex-grow">
                    <div className="flex items-center mb-3">
                      <span className="text-slate-700 font-semibold text-lg">
                        Features
                      </span>
                      <div className="ml-2 text-[#3776E2]">
                        <IoCheckmarkCircleSharp size={20} />
                      </div>
                    </div>
                    <ul className="space-y-3 text-base text-slate-600">
                      {Array.isArray(subscriptionData.premium.features) &&
                      subscriptionData.premium.features.length > 0 ? (
                        subscriptionData.premium.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <IoCheckmarkDoneSharp
                              className="text-[#3776E2] mt-1 mr-2 flex-shrink-0"
                              size={20}
                            />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start">
                          <IoCheckmarkDoneSharp
                            className="text-[#3776E2] mt-1 mr-2 flex-shrink-0"
                            size={20}
                          />
                          <span>No features available</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default AdminPricing;