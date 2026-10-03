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
  FaStar,
} from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n.js";
import { localizedContent } from "@/lib/localizedContent";


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
      navigate("/autentificare");
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
      navigate(role === "tourist" ? "/cont/mesaje" : "/agentie/mesaje");
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
    <article className="flex w-full min-w-0 flex-col gap-5 overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white p-4 shadow-[0_10px_35px_rgba(23,43,67,0.05)] sm:p-5 lg:flex-row lg:gap-6">
      <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-[16px] bg-[#f4eee4] lg:h-auto lg:min-h-[218px] lg:w-[220px]">
        <img
          src={plan.spot_picture_url || PlanImage1}
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }}
          alt={t("plan_image_alt")}
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="col-span-2 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a36f1d]">{t("created_plan")}</p>
            <h4 className="break-words text-xl font-bold leading-snug tracking-tight text-[#172b43] sm:text-2xl">
              {plan.location_from} {t("to")} {plan.location_to}
            </h4>
            <p className="text-sm text-[#617082]">
              {t("dates")}:{" "}
              <span className="font-medium text-[#34485c]">
                {new Date(plan.start_date).toLocaleDateString(i18n.language === "ro" ? "ro-RO" : "ru-RU")} —{" "}
                {new Date(plan.end_date).toLocaleDateString(i18n.language === "ro" ? "ro-RO" : "ru-RU")}
              </span>
            </p>
            <p className="text-sm text-[#617082]">
              <span className="text-sm text-[#617082]">
                <span className="font-medium">{t("total")}:</span>{" "}
                {plan.total_members}{" "}
                {plan.total_members === 1 ? t("person") : t("persons")}
              </span>
            </p>

            <p className="text-sm text-[#617082]">
              <span className="font-medium">{t("category")}:</span>{" "}
              <span className="font-medium text-[#34485c]">
                {plan.destination_type === "beach"
                  ? t("beach")
                  : plan.destination_type === "mountain"
                  ? t("mountain")
                  : plan.destination_type === "relax"
                  ? t("relaxation")
                  : plan.destination_type === "group"
                  ? t("group")
                  : t("na")}
              </span>
            </p>
            <p className="flex flex-wrap items-center gap-2 text-sm text-[#617082]">
              {t("approval_status")}:{" "}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                  plan.approval_status === "Rifiutato"
                    ? "bg-[#fceceb] text-[#a34b43]"
                    : plan.approval_status === "In attesa"
                    ? "bg-[#fff4dd] text-[#986919]"
                    : "bg-[#e9f3ed] text-[#397055]"
                }`}
              >
                {localizedContent(plan.approval_status, t)}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 md:items-end">
            <div className="flex w-full items-start justify-between gap-3 md:w-auto md:justify-end">
              <div className="flex flex-col md:items-end">
                <span className="text-xs font-medium text-[#718092]">{t("budget")}</span>
                <span className="text-xl font-bold text-[#172b43]">€{plan.budget}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label={t("settings")} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#617082] transition-colors hover:bg-[#f7f3ec] hover:text-[#172b43]">
                    <EllipsisVertical size={19} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl border-[#e9e6e0]" align="end">
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
                    to={"/cont/creeaza-cerere"}
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

            <div className="flex flex-wrap items-center gap-2">
              <Dialog className="">
                <DialogTrigger asChild>
                  <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d8dfe5] bg-white px-4 text-sm font-bold text-[#172b43] transition-colors hover:bg-[#f7f3ec]">{t("view")}</button>
                </DialogTrigger>
                <Overlay className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" />

                <DialogContent className="max-h-[85vh] max-w-3xl overflow-auto rounded-[22px] border-[#e9e6e0] p-5 sm:p-7">
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

                          {/* <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaLocationArrow className="w-6 h-5 text-gray-900" />
                            <span>
                              <span className="font-medium">
                                {t("departure_from")}:
                              </span>{" "}
                              {plan.location_from || t("na")}
                            </span>
                          </p> */}

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <MdOutlineNoMeals className="w-6 h-5 text-gray-900" />
                            <span>
                              <span className="font-medium">
                                {t("meal_plan")}:
                              </span>{" "}
                              {plan.meal_plan === "breakfast"
                                ? t("breakfast")
                                : plan.meal_plan === "half-board"
                                ? t("half_board")
                                : plan.meal_plan === "full-board"
                                ? t("full_board")
                                : "N/A"}
                            </span>
                          </p>

                          <div className="flex items-center space-x-2">
                            <p className="text-md text-gray-600 flex items-center gap-2">
                              <IoBed className="w-6 h-5 text-black" />
                              <span>
                                <span className="font-medium">
                                  {t("type_of_accommodation")}:
                                </span>{" "}
                                {plan.type_of_accommodation === "hotel"
                                  ? t("hotel")
                                  : plan.type_of_accommodation === "resort"
                                  ? t("resort")
                                  : plan.type_of_accommodation === "homestay"
                                  ? t("homestay")
                                  : plan.type_of_accommodation === "apartment"
                                  ? t("apartment")
                                  : plan.type_of_accommodation === "hostel"
                                  ? t("hostel")
                                  : "N/A"}
                              </span>
                            </p>
                            <p className="text-md text-gray-600 flex items-center gap-2">
                              {plan.minimum_star_hotel
                                ? "⭐".repeat(Number(plan.minimum_star_hotel))
                                : t("na")}
                            </p>
                          </div>

                          {/* <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaClock className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">
                                {t("duration")}:
                              </span>{" "}
                              {plan.duration
                                ? `${plan.duration} ${
                                    Number(plan.duration) === 1
                                      ? t("day")
                                      : t("days")
                                  }`
                                : "N/A"}
                            </span>
                          </p> */}

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
                          {plan.description}
                        </p>
                        <p className="text-sm text-[#70798F]">
                          {t("interested_tourist_points")}:{" "}
                          <span className="text-[#343E4B] font-medium">
                            {plan.tourist_spots || t("na")}
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
                        alt={t("plan_image_alt")}
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
                                    className="sm:w-5 sm:h-5 text-[#DD9E2C]"
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
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] cursor-pointer text-white rounded-full hover:bg-[#C2851C] transition"
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
                <Button disabled={updateLoading} onClick={handlePublishToggle} className="min-h-10 rounded-xl bg-[#c88f2a] px-4 text-sm font-bold text-white hover:bg-[#ad751c]">
                  {updateLoading ? t("publishing") : t("publish_now")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
