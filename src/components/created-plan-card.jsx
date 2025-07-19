import {
  CheckCircle,
  EllipsisVertical,
  SquarePen,
  Trash,
  MoveLeft,
  Edit,
} from "lucide-react";
import PlanImage1 from "../assets/img/plan-image-1.png";
import CardViewImage from "../assets/img/card-view-image.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { Overlay } from "@radix-ui/react-dialog"; // Import Overlay
import {
  useDeletePlanMutation,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { Link } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";

export default function CreatedPlanCard({ plan, setCreatedPlans }) {
  console.log(plan);
  const [updatePlan, { isLoading: updateLoading }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: deleteLoading }] = useDeletePlanMutation();

  const handlePublishToggle = async () => {
    try {
      const updatedPlan = await updatePlan({
        id: plan.id,
        updates: {
          status: plan.status === "published" ? "draft" : "published",
        },
      }).unwrap();

      setCreatedPlans((prevPlans) =>
        prevPlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
      );

      console.log(`Plan status updated successfully!`);
    } catch (error) {
      console.error("Error updating plan status:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deletePlan(plan.id).unwrap();

      setCreatedPlans((prevPlans) => prevPlans.filter((p) => p.id !== plan.id));

      console.log(`Plan deleted successfully!`);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-[0_3px_7.3px_0px_#0000001A] flex flex-col md:flex-row gap-4">
      {/* left image */}
      <div className="w-full md:w-[168px] h-[200px] md:h-[147px] rounded-md overflow-hidden">
        <img
          src={plan.spot_picture_url || PlanImage1}
          alt="Plan Image"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* right content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* text section */}
          <div className="col-span-2 space-y-2">
            <h4 className="text-xl font-semibold text-[#343E4B] capitalize">
              {plan.location_from} to {plan.location_to}
            </h4>
            <p className="text-sm text-[#70798F]">
              Dates:{" "}
              <span className="text-[#343E4B] font-medium">
                {new Date(plan.start_date).toLocaleDateString()} —{" "}
                {new Date(plan.end_date).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm text-[#70798F]">
              Total members:{" "}
              <span className="text-[#343E4B] font-medium">
                {plan.total_members}
              </span>
            </p>
            <p className="text-sm text-[#70798F]">
              Category:{" "}
              <span className="text-[#343E4B] font-medium">
                {plan.destination_type}
              </span>
            </p>
          </div>

          {/* actions section */}
          <div className="flex flex-col justify-between items-end gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[#343E4B] font-medium">
                  Budget ${plan.budget}
                </span>
                <span className="text-xs text-[#70798F]">
                  {plan.total_members} person
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer">
                    <EllipsisVertical className="text-[#70798F]" size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem
                    disabled={updateLoading}
                    onClick={handlePublishToggle}
                  >
                    <CheckCircle size={20} className="mr-2" />
                    {updateLoading
                      ? "Updating..."
                      : plan.status === "published"
                      ? "Unpublish Plan"
                      : "Publish Plan"}
                  </DropdownMenuItem>
                  <Link
                    to={"/user/CreatePlan"}
                    state={{ from: "edit", id: plan.id }}
                  >
                    <DropdownMenuItem>
                      <Edit size={20} className="mr-2" /> Edit
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    disabled={deleteLoading}
                    onClick={handleDelete}
                  >
                    <Trash size={20} className="mr-2" />
                    {deleteLoading ? "Deleting..." : "Delete Plan"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* buttons */}
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">View</Button>
                </DialogTrigger>
                <Overlay className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" />
                
                <DialogContent className="max-w-3xl">
                  <DialogClose >
                      <button className="flex justify-start hover:cursor-pointer w-10"><IoArrowBackSharp size={20}/></button>
                    </DialogClose>
                  <DialogHeader>
                    <h3 className="text-xl font-semibold">{plan.location_from} to {plan.location_to}</h3>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Larger image section */}
                   

                    {/* Plan details */}
                    <div>
                      <p className="text-sm text-[#70798F]">
                        Willing to go on: <span className="text-[#343E4B] font-medium">{new Date(plan.start_date).toLocaleDateString()}</span>
                      </p>
                      <p className="text-sm text-[#70798F]">
                        Duration: <span className="text-[#343E4B] font-medium">{plan.duration || '10 Days'}</span>
                      </p>
                      <p className="text-sm text-[#70798F] mb-3">
                        Category: <span className="text-[#343E4B] font-medium">{plan.destination_type}</span>
                      </p>
                      {/* <p className="text-sm text-[#70798F]">
                        Budget: <span className="text-[#343E4B] font-medium">${plan.budget} USD</span>
                      </p>
                      <p className="text-sm text-[#70798F]">
                        Total Members: <span className="text-[#343E4B] font-medium">{plan.total_members} Person</span>
                      </p> */}
                      <p className="text-sm text-[#70798F] mb-2">
                      {plan.description || 'Lorem Ipsum is simply dummy text... see more'}
                      </p>
                      <p className="text-sm text-[#70798F]">
                        Interested Tourist Points: <span className="text-[#343E4B] font-medium">{plan.tourist_spots || 'Location, Location, Location, Location, Location'}</span>
                      </p>
                    </div>
                     <div className="w-full h-[300px] rounded-md overflow-hidden">
                      <img
                        src={plan.spot_picture_url || PlanImage1}
                        alt="Plan Image"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    
                  </div>
                </DialogContent>
              </Dialog>
              {plan.status !== "published" && (
                <Button disabled={updateLoading} onClick={handlePublishToggle}>
                  {updateLoading ? "Publishing..." : "Publish Now"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}