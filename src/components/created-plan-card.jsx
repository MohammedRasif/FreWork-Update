import {
  CheckCircle,
  EllipsisVertical,
  SquarePen,
  Trash,
  MoveLeft,
  Edit,
  MessageSquare,
  Check,
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
import { Overlay } from "@radix-ui/react-dialog";
import {
  useDeletePlanMutation,
  useInviteToChatMutation,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBackSharp, IoBed } from "react-icons/io5";
import { FaMoneyBillWave } from "react-icons/fa";
import { MdOutlineNoMeals, MdVerified, MdVerifiedUser } from "react-icons/md";
import { toast } from "react-toastify";
import {
  FaClock,
  FaEuroSign,
  FaList,
  FaLocationArrow,
  FaLocationDot,
} from "react-icons/fa6";
import { useTranslation } from "react-i18next";

export default function CreatedPlanCard({ plan, setCreatedPlans }) {
  const { t } = useTranslation();
  const [updatePlan, { isLoading: updateLoading }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: deleteLoading }] = useDeletePlanMutation();
  const [invite, { isLoading: isInviteLoading, isError: isInviteError }] =
    useInviteToChatMutation();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const currentUserId = parseInt(localStorage.getItem("user_id"));

  const handleMessage = async (offer) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const otherUserId = offer?.agency?.user;

    if (!otherUserId) {
      toast.error(t("recipient_id_not_found"));
      return;
    }

    try {
      await invite({ other_user_id: otherUserId });
      toast.success(t("chat_invitation_sent"));
      navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
    } catch (error) {
      console.error("Invite error:", error);
      toast.error(t("failed_to_send_chat"));
    }
  };

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
    } catch (error) {
      console.error("Error updating plan status:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("confirm_delete_plan"))) return;
    try {
      await deletePlan(plan.id).unwrap();

      setCreatedPlans((prevPlans) => prevPlans.filter((p) => p.id !== plan.id));
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-[0_3px_7.3px_0px_#0000001A] flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-[168px] h-[200px] md:h-[147px] rounded-md overflow-hidden relative">
        <img
          src={
            plan.spot_picture_url ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
          }
          alt="Plan Image"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="col-span-2 space-y-2">
            <h4 className="text-xl font-semibold text-[#343E4B] capitalize">
              {plan.location_from} {t("to")} {plan.location_to}
            </h4>
            <p className="text-sm text-[#70798F]">
              {t("dates")}:{" "}
              <span className="text-[#343E4B] font-medium">
                {new Date(plan.start_date).toLocaleDateString()} —{" "}
                {new Date(plan.end_date).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm text-[#70798F]">
              {t("total_members")}:{" "}
              <span className="text-[#343E4B] font-medium">
                {plan.total_members}
              </span>
            </p>
            <p className="text-sm text-[#70798F]">
              {t("category")}:{" "}
              <span className="text-[#343E4B] font-medium">
                {plan.destination_type}
              </span>
            </p>
            <p className="text-sm text-[#70798F] flex items-center gap-1">
              {t("approval_status")}:{" "}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[14px] font-medium ${
                  plan.approval_status === "Rejected"
                    ? "bg-red-100 text-red-700"
                    : plan.approval_status === "Pending"
                    ? "bg-gray-100 text-black"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {plan.approval_status}
              </span>
            </p>
          </div>

          <div className="flex flex-col justify-between items-end gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[#343E4B] font-medium">
                  {t("budget")} €{plan.budget}
                </span>
                <span className="text-xs text-[#70798F]">
                  {plan.total_members}{" "}
                  {plan.total_members > 1 ? t("people") : t("person")}
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
                      ? t("updating")
                      : plan.status === "published"
                      ? t("unpublish_plan")
                      : t("publish_plan")}
                  </DropdownMenuItem>
                  <Link
                    to={"/user/CreatePlan"}
                    state={{ from: "edit", id: plan.id }}
                  >
                    <DropdownMenuItem>
                      <Edit size={20} className="mr-2" /> {t("edit")}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    disabled={deleteLoading}
                    onClick={handleDelete}
                  >
                    <Trash size={20} className="mr-2" />
                    {deleteLoading ? t("deleting") : t("delete_plan")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Dialog className="">
                <DialogTrigger asChild>
                  <Button variant="secondary">{t("view")}</Button>
                </DialogTrigger>
                <Overlay className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" />

                <DialogContent className="max-w-3xl h-[80vh] overflow-auto">
                  <DialogClose>
                    <button className="flex justify-start hover:cursor-pointer w-10">
                      <IoArrowBackSharp size={20} />
                    </button>
                  </DialogClose>
                  <DialogHeader>
                    <h3 className="text-xl font-semibold">
                      {plan.location_from} {t("to")} {plan.location_to}
                    </h3>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex  justify-between">
                      <div>
                        <div>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaLocationDot className="w-6 h-5 text-gray-900 size-4" />
                            <span>
                              <span className="font-medium">
                                {t("points_of_travel")}:
                              </span>{" "}
                              {plan.tourist_spots || t("none")}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaLocationArrow className="w-6 h-5 text-gray-900" />
                            <span>
                              <span className="font-medium">
                                {t("departure_from")}:
                              </span>{" "}
                              {plan.location_from || t("na")}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaList className="w-6 h-5 text-gray-900" />
                            <span>
                              <span className="font-medium">
                                {t("minimum_rating")}:
                              </span>{" "}
                              {plan.minimum_star_hotel || t("na")}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <MdOutlineNoMeals className="w-6 h-5 text-gray-900" />
                            <span>
                              <span className="font-medium">
                                {t("meal_plan")}:
                              </span>{" "}
                              {plan.meal_plan || t("na")}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <IoBed className="w-6 h-5 text-gray-900" />
                            <span>
                              <span className="font-medium">
                                {t("type_of_accommodation")}:
                              </span>{" "}
                              {plan.type_of_accommodation || t("na")}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaClock className="w-6 h-5 text-gray-900" />
                            <span>
                              <span className="font-medium">
                                {t("duration")}:
                              </span>{" "}
                              {plan.duration || t("na")}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <MdVerifiedUser className="w-7 h-6 text-green-500" />
                            <span>
                              <span className="font-medium">
                                {t("contact_verified")}
                              </span>
                            </span>
                          </p>
                        </div>

                        <p className="text-sm text-[#70798F] mb-2 py-5">
                          {plan.description }
                        </p>
                        <p className="text-sm text-[#70798F]">
                          {t("interested_tourist_points")}:{" "}
                          <span className="text-[#343E4B] font-medium">
                            {plan.tourist_spots || tող}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-black text-xl font-medium">
                          {t("budget")}: €{plan.budget}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-[300px] rounded-md overflow-hidden">
                      <img
                        src={plan.spot_picture_url || PlanImage1}
                        alt="Plan Image"
                        className="w-full h-full object-center"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">
                        {t("agencies_who_made_offers")}
                      </h1>
                      {plan?.offers?.map((offer) => (
                        <div className="flex items-center justify-between p-4 rounded-xl w-full">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                offer?.agency?.logo_url ||
                                "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                              }
                              alt={offer?.agency?.agency_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />

                            <div>
                              <div className="flex items-center gap-1">
                                <h2 className="font-semibold text-gray-900">
                                  {offer?.agency?.agency_name ||
                                    t("unknown_agency")}
                                </h2>
                                {offer?.agency?.is_verified && (
                                  <MdVerified
                                    size={20}
                                    className="sm:w-5 sm:h-5 text-blue-700"
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-gray-800 font-medium">
                              <FaEuroSign className="text-orange-500" />
                              {offer?.offered_budget}
                            </div>

                            <button
                              onClick={() => handleMessage(offer)}
                              className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                              disabled={isInviteLoading}
                            >
                              <MessageSquare size={16} /> {t("message")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {plan.status !== "published" && (
                <Button disabled={updateLoading} onClick={handlePublishToggle}>
                  {updateLoading ? t("publishing") : t("publish_now")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
