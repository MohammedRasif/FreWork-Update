import CreatedPlanCard from "@/components/created-plan-card";
import { useGetPlansQuery } from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, Plus } from "lucide-react";

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
      <div className="w-full space-y-4">
        {isLoading ? (
          <div className="flex min-h-48 w-full items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 shadow-[0_10px_35px_rgba(23,43,67,0.04)]" role="status">
            <p className="text-sm font-medium text-[#617082]">{t("fetching_plans")}</p>
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
          <div className="flex min-h-64 w-full flex-col items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white px-6 py-10 text-center shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]"><ClipboardList size={26} aria-hidden="true" /></div>
            <p className="text-base font-semibold text-[#172b43]">{t("no_plans_available")}</p>
            <Link to="/cont/creeaza-cerere" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#c88f2a] px-4 text-sm font-bold text-white hover:bg-[#ad751c]"><Plus size={17} aria-hidden="true" />{t("create_plan")}</Link>
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
}
