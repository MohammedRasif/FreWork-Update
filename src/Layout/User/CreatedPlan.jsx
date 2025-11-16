import CreatedPlanCard from "@/components/created-plan-card";
import { useGetPlansQuery } from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CreatedPlan() {
  const { t } = useTranslation();
  const { data: createdPlan, isLoading } = useGetPlansQuery();
  const [createdPlans, setCreatedPlans] = useState([]);

  useEffect(() => {
    if (!isLoading && createdPlan) {
      setCreatedPlans(createdPlan);
    }
  }, [createdPlan, isLoading]);

  return (
    <>
      <div className="w-full h-auto p-4 space-y-4">
        {isLoading ? (
          <div className="w-full bg-white rounded-xl p-4 shadow-[0_3px_7.3px_0px_#0000001A] flex justify-center items-center">
            <p className="text-[#70798F] text-lg">{t("fetching_plans")}</p>
          </div>
        ) : createdPlans && createdPlans.length > 0 ? (
          createdPlans.map((plan) => (
            <CreatedPlanCard
              setCreatedPlans={setCreatedPlans}
              key={plan.id}
              plan={plan}
            />
          ))
        ) : (
          <div className="w-full rounded-xl p-4 flex justify-center h-auto items-center">
            <p className="text-[#70798F] text-lg">{t("no_plans_available")}</p>
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
}