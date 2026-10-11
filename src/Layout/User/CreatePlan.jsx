import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  useCreatePlanOneMutation,
  useGetOneDetailQuery,
  useGetPlansQuery,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { toast } from "react-toastify";
import FullScreenInfinityLoader from "@/lib/Loading";
import { useTranslation } from "react-i18next";

// Global flag to ensure Google Maps script loads only once
let isGoogleScriptLoaded = false;

const CreatePlan = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [createPlan] = useCreatePlanOneMutation();
  const [update] = useUpdatePlanMutation();
  const location = useLocation();
  const state = location.state;
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const editSlug = state?.slug || state?.plan?.slug || searchParams.get("slug");
  const editId = state?.id || state?.plan?.id || searchParams.get("id");

  // Modified by takmim: Fetch user plans to resolve slug when only id is provided
  const { data: userPlans } = useGetPlansQuery();
  const matchedPlan = userPlans?.find(
    (p) =>
      (editId && String(p.id) === String(editId)) ||
      (editSlug && p.slug === editSlug) ||
      p.slug === editId
  );

  // Modified by takmim: Backend API /tour-plans/<lookup>/ requires slug for lookup
  const targetSlug =
    editSlug ||
    state?.plan?.slug ||
    matchedPlan?.slug ||
    (isNaN(Number(editId)) ? editId : null);

  const isEditMode = Boolean(targetSlug || editId || state?.from === "edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const locationFromRef = useRef(null);
  const locationToRef = useRef(null);
  const budgetRef = useRef(null);
  const [showBudgetMessage, setShowBudgetMessage] = useState(false);
  const [isPopupOpened, setIsPopupOpened] = useState(false);

  // Modified by takmim: Fetch plan details by targetSlug from API
  const { data: oldData, isLoading: isFetching } = useGetOneDetailQuery(
    targetSlug,
    { skip: !targetSlug }
  );

  // Modified by takmim: Extract plan data from API response or passed state/matchedPlan
  const planData =
    (oldData && (oldData.data || oldData)) || state?.plan || matchedPlan;

  // Modified by takmim: Helper to convert date to YYYY-MM-DD avoiding UTC timezone shifts
  const formatToDateInput = (val) => {
    if (!val) return "";
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      return val.substring(0, 10);
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Modified by takmim: Auto-fill all travel plan form fields when editing
  useEffect(() => {
    if (planData) {
      const formattedDate = formatToDateInput(
        planData.start_date || planData.startingDate
      );
      const cleanTouristSpots =
        planData.tourist_spots &&
        planData.tourist_spots !== "N/A" &&
        planData.tourist_spots !== "none"
          ? planData.tourist_spots
          : planData.touristSpots &&
            planData.touristSpots !== "N/A" &&
            planData.touristSpots !== "none"
          ? planData.touristSpots
          : "";
      const stars = String(
        planData.minimum_star_hotel || planData.minimumHotelStars || ""
      );

      const formValues = {
        name:
          planData.name ||
          planData.user?.name ||
          localStorage.getItem("name") ||
          "",
        email:
          planData.email ||
          planData.user?.email ||
          localStorage.getItem("email") ||
          "",
        phoneNumber:
          planData.phone_number ||
          planData.phoneNumber ||
          planData.user?.phone_number ||
          "",
        locationFrom: planData.location_from || planData.locationFrom || "",
        locationTo: planData.location_to || planData.locationTo || "",
        startingDate: formattedDate,
        budget:
          planData.budget !== undefined && planData.budget !== null
            ? planData.budget
            : "",
        description: planData.description || "",
        travelType: planData.travel_type || planData.travelType || "",
        typeOfAccommodation:
          planData.type_of_accommodation || planData.typeOfAccommodation || "",
        minimumHotelStars: stars,
        mealPlan: planData.meal_plan || planData.mealPlan || "",
        touristSpots: cleanTouristSpots,
        confirmation: Boolean(
          planData.is_confirmed_request ?? planData.confirmation ?? true
        ),
      };

      reset(formValues);

      // Explicitly set each field to ensure react-hook-form tracking
      Object.entries(formValues).forEach(([key, val]) => {
        setValue(key, val);
      });

      if (locationFromRef.current && formValues.locationFrom) {
        locationFromRef.current.value = formValues.locationFrom;
      }
      if (locationToRef.current && formValues.locationTo) {
        locationToRef.current.value = formValues.locationTo;
      }
      if (budgetRef.current && formValues.budget !== "") {
        budgetRef.current.value = formValues.budget;
      }
    }
    setIsPopupOpened(true);
  }, [planData, reset, setValue]);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        return;
      }

      if (locationFromRef.current) {
        const fromAutocomplete = new window.google.maps.places.Autocomplete(
          locationFromRef.current
        );
        fromAutocomplete.addListener("place_changed", () => {
          const place = fromAutocomplete.getPlace();
          const locationValue = place.formatted_address || place.name;
          setValue("locationFrom", locationValue);
        });
      }

      if (locationToRef.current) {
        const toAutocomplete = new window.google.maps.places.Autocomplete(
          locationToRef.current
        );
        toAutocomplete.addListener("place_changed", () => {
          const place = toAutocomplete.getPlace();
          const locationValue = place.formatted_address || place.name;
          setValue("locationTo", locationValue);
        });
      }
    };

    if (!isGoogleScriptLoaded && !window.google) {
      isGoogleScriptLoaded = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBIVSr8DMIg5U5P_oRIDt1j_Q32ceDQddc&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initAutocomplete, 100);
      };
      script.onerror = () => {
        isGoogleScriptLoaded = false;
      };
      document.head.appendChild(script);
    } else if (window.google) {
      setTimeout(initAutocomplete, 100);
    }
  }, [setValue, t]);

  useEffect(() => {
    const handleFocusChange = (e) => {
      if (budgetRef.current && e.target !== budgetRef.current) {
        setShowBudgetMessage(false);
      }
    };
    document.addEventListener("focus", handleFocusChange, true);
    return () => {
      document.removeEventListener("focus", handleFocusChange, true);
    };
  }, []);

  const onSubmit = async (data, status) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone_number", data.phoneNumber);
    formData.append("location_from", data.locationFrom);
    formData.append("location_to", data.locationTo);
    formData.append("start_date", data.startingDate);
    formData.append("budget", data.budget);
    formData.append("description", data.description);
    formData.append("travel_type", data.travelType || planData?.travel_type || "solo");
    formData.append("type_of_accommodation", data.typeOfAccommodation);
    formData.append("minimum_star_hotel", data.minimumHotelStars);
    formData.append("meal_plan", data.mealPlan);
    formData.append("tourist_spots", data.touristSpots || "");
    formData.append("status", status);
    formData.append(
      "is_confirmed_request",
      data.confirmation ? "true" : "false"
    );

    // Modified by takmim: Preserve additional plan fields when editing
    if (planData?.end_date) {
      formData.append("end_date", planData.end_date);
    }
    if (planData?.adult_count !== undefined && planData?.adult_count !== null) {
      formData.append("adult_count", planData.adult_count);
    }
    if (planData?.child_count !== undefined && planData?.child_count !== null) {
      formData.append("child_count", planData.child_count);
    }
    if (planData?.destination_type) {
      formData.append("destination_type", planData.destination_type);
    }

    if (selectedFile) {
      formData.append("spot_picture", selectedFile);
    }

    try {
      if (status === "draft") {
        setIsSavingDraft(true);
      } else {
        setIsPublishing(true);
      }

      let response;
      if (isEditMode) {
        const lookup =
          targetSlug ||
          editSlug ||
          planData?.slug ||
          matchedPlan?.slug ||
          editId;
        response = await update({
          id: lookup,
          slug: lookup,
          updates: formData,
        }).unwrap();
      } else {
        response = await createPlan(formData).unwrap();
      }

      toast.success(t("plan_created_success"), { autoClose: 4000 });

      reset();
      setSelectedFile(null);
      navigate("/cont");
    } catch (error) {
      console.error("Error updating plan:", error);
      const errorMsg =
        error?.data?.error ||
        error?.data?.detail ||
        (typeof error?.data === "string" ? error.data : null) ||
        t("error_creating_plan", { action: isEditMode ? t("updating") : t("creating") });
      toast.error(errorMsg);
    } finally {
      if (status === "draft") {
        setIsSavingDraft(false);
      } else {
        setIsPublishing(false);
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleBudgetClick = () => {
    if (isPopupOpened && !showBudgetMessage) {
      setShowBudgetMessage(true);
    }
  };

  const handleOkClick = () => {
    setShowBudgetMessage(false);
  };

  if (isFetching && targetSlug && !planData) {
    return <FullScreenInfinityLoader />;
  }

  const { ref: fromFormRef, ...fromRest } = register("locationFrom", {
    required: t("location_from_required"),
  });
  const { ref: toFormRef, ...toRest } = register("locationTo", {
    required: t("location_to_required"),
  });
  // Modified by takmim: Register budget with form ref preserved alongside budgetRef
  const { ref: budgetFormRef, ...budgetRest } = register("budget", {
    required: t("budget_required"),
    min: { value: 0, message: t("budget_cannot_be_negative") },
    validate: (value) =>
      (value !== null && value !== "") || t("budget_required"),
  });

  return (
    <div className="user-create-plan mx-auto max-w-5xl">
      <div className="mx-auto">

        <div className="mb-6 flex items-center">
          <NavLink to="/cont">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold text-[#617082] transition-colors hover:text-[#172b43]">
              <FiArrowLeft className="w-5 h-5" />
              <span className="text-md">{t("back")}</span>
            </button>
          </NavLink>
        </div>

        <div className="mb-6 h-1 w-10 rounded-full bg-[#d6a044]" />
        <h1 className="mb-7 text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">
          {isEditMode ? t("edit_tour_plan") : t("create_tour_plan")}
        </h1>

        <form className="space-y-6 rounded-[22px] border border-[#e9e6e0] bg-white p-5 shadow-[0_10px_35px_rgba(23,43,67,0.05)] sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("name")}
              </label>
              <input
                type="text"
                placeholder={t("enter_full_name")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...register("name", { required: t("name_required") })}
              />
              {errors.name && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("email_address_label")}
              </label>
              <input
                type="email"
                placeholder={t("enter_email")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...register("email", {
                  required: t("email_required"),
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: t("invalid_email"),
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("phone_number")}
              </label>
              <input
                type="tel"
                placeholder={t("enter_phone_number")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...register("phoneNumber", {
                  required: t("phone_required"),
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: t("invalid_phone"),
                  },
                })}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
            <div className="flex flex-row gap-4">
              <div>
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  {t("accommodation_type")}
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                  {...register("typeOfAccommodation", {
                    required: t("accommodation_required"),
                  })}
                >
                  <option value="" disabled>
                    {t("select_accommodation")}
                  </option>
                  <option value="hotel">{t("hotel")}</option>
                  <option value="resort">{t("resort")}</option>
                  <option value="homestay">{t("homestay")}</option>
                  <option value="apartment">{t("apartment")}</option>
                  <option value="hostel">{t("hostel")}</option>
                </select>
                {errors.typeOfAccommodation && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.typeOfAccommodation.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  {t("minimum_hotel_stars")}
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                  {...register("minimumHotelStars")}
                >
                  <option value="" disabled>
                    {t("select_star_rating")}
                  </option>
                  <option value="1">{t("1_star")}</option>
                  <option value="2">{t("2_stars")}</option>
                  <option value="3">{t("3_stars")}</option>
                  <option value="4">{t("4_stars")}</option>
                  <option value="5">{t("5_stars")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("location_from")}
              </label>
              <input
                type="text"
                placeholder={t("enter_here")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...fromRest}
                ref={(e) => {
                  fromFormRef(e);
                  locationFromRef.current = e;
                }}
              />
              {errors.locationFrom && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.locationFrom.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("location_to")}
              </label>
              <input
                type="text"
                placeholder={t("enter_here")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...toRest}
                ref={(e) => {
                  toFormRef(e);
                  locationToRef.current = e;
                }}
              />
              {errors.locationTo && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.locationTo.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("starting_date")}
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] pr-10"
                  {...register("startingDate", {
                    required: t("starting_date_required"),
                  })}
                />
              </div>
              {errors.startingDate && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.startingDate.message}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[16px] font-medium text-gray-700">
                  {t("points_of_travel")}
                </label>
                <span className="text-xs text-gray-500">
                  ({t("optional")})
                </span>
              </div>
              <input
                type="text"
                placeholder={t("enter_here")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...register("touristSpots")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("budget")}
              </label>
              {showBudgetMessage && isPopupOpened && (
                <p className="text-sm text-gray-600 mb-2">
                  {t("budget_message")}
                </p>
              )}
              {/* Modified by takmim: Attach both budgetFormRef and budgetRef */}
              <input
                type="number"
                placeholder="EUR"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...budgetRest}
                ref={(e) => {
                  budgetFormRef(e);
                  budgetRef.current = e;
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("budget", value === "" ? null : Number(value), {
                    shouldValidate: true,
                  });
                }}
                onClick={handleBudgetClick}
              />
              {errors.budget && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.budget.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("meal_plan")}
              </label>
              <select
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C]"
                {...register("mealPlan", { required: t("meal_plan_required") })}
              >
                <option value="" disabled>
                  {t("select_meal_plan")}
                </option>
                <option value="none">{t("no_meals")}</option>
                <option value="breakfast">{t("breakfast")}</option>
                <option value="half-board">{t("half_board")}</option>
                <option value="full-board">{t("full_board")}</option>
              </select>
              {errors.mealPlan && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.mealPlan.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("description")}
              </label>
              <textarea
                placeholder={t("description_placeholder")}
                rows={4}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] resize-none"
                {...register("description")}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 mt-8">
            <input
              type="checkbox"
              id="confirmation"
              className="mt-1 w-4 h-4 text-[#DD9E2C] border border-[#DD9E2C] rounded focus:ring-[#DD9E2C] hover:cursor-pointer checkbox checkbox-xs checked:text-[#DD9E2C]"
              {...register("confirmation", {
                required: t("confirm_information"),
              })}
            />
            <label
              htmlFor="confirmation"
              className="text-[15px] text-gray-600 leading-relaxed"
            >
              {t("confirmation_text")}
            </label>
          </div>
          {errors.confirmation && (
            <p className="text-red-500 text-[14px] mt-1">
              {errors.confirmation.message}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mt-8 pt-6">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, planData?.status || "published"))}
              className="min-h-12 rounded-xl bg-[#c88f2a] px-8 py-3 font-bold text-white transition-colors hover:bg-[#ad751c]"
              disabled={isSavingDraft || isPublishing}
            >
              {isPublishing
                ? t("publishing")
                : isEditMode
                ? t("save_changes") || t("edit")
                : t("publish_now")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlan;
