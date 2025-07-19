import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircleSharp, IoCheckmarkDoneSharp } from "react-icons/io5";
import img from "../../assets/img/Vector 63.png";

const AdminPricing = () => {
  const plans = [
    {
      name: "Free User",
      limit: "5",
      limitUnit: "Query/Day",
      features: [
        "Includes general source databases",
        "Limited free queries per bot day",
        "No access to specific, company, or private databases",
      ],
    },
    {
      name: "Premium User",
      limit: "No limit,",
      limitUnit: "Query/Day",
      features: [
        "Includes general source databases",
        "Unlimited queries per bot daily",
        "Company-Specific Personal Database",
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-center">
        Pricing and Packages
      </h1>
      <h1 className="text-[16px] text-center font-medium text-gray-600">
        Find your best package here
      </h1>
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

      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          <AnimatePresence mode="wait">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-white rounded-lg overflow-hidden flex flex-col h-full border border-gray-200 roboto transition-transform transform hover:scale-105 ${
                  plan.highlighted ? "border-2 border-[#3776E2]" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-3/4 rounded-r-lg my-10 relative">
                    <img
                      src={img}
                      alt="Plan background"
                      className="w-full h-auto"
                    />
                    <h3 className="absolute top-4 left-4 text-slate-700 font-bold text-xl z-10">
                      {plan.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-slate-700">
                        {plan.limit}
                      </span>
                      <span className="text-base text-slate-500 ml-2 mb-1">
                        {plan.limitUnit}
                      </span>
                    </div>
                    <p className="text-slate-500 text-base mt-1">
                      Measurable results
                    </p>
                  </div>

                  <button
                    className={`w-full py-3 rounded-md text-lg font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-[#3776E2] text-white hover:bg-[#00669e]"
                        : "bg-[#3776E2] text-white hover:bg-[#00669e]"
                    }`}
                  >
                    Select
                  </button>

                  <p className="text-slate-500 text-base mb-6 mt-4">
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
                      {plan.features.map((feature, i) => (
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
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPricing;
