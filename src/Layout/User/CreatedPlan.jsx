import CreatedPlanCard from "@/components/created-plan-card";
import { useGetPlansQuery } from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function CreatedPlan() {
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
        {createdPlans &&
          createdPlans.map((plan) => (
            <CreatedPlanCard
              setCreatedPlans={setCreatedPlans}
              key={plan.id}
              plan={plan}
            />
          ))}
      </div>
    </>
  );
}
