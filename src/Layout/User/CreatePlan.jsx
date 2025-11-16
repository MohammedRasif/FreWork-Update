import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  useCreatePlanOneMutation,
  useGetOneDetailQuery,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { Toaster, toast } from "react-hot-toast";
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
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const locationFromRef = useRef(null);
  const locationToRef = useRef(null);
  const touristSpotsRef = useRef(null);
  const budgetRef = useRef(null);
  const [showBudgetMessage, setShowBudgetMessage] = useState(false);
  const [isPopupOpened, setIsPopupOpened] = useState(false);

  const { data: oldData, isLoading: isFetching } = useGetOneDetailQuery(
    state?.id,
    { skip: !state?.id }
  );

  useEffect(() => {
    if (state?.id && oldData) {
      setValue("name", oldData.name || "");
      setValue("email", oldData.email || "");
      setValue("phoneNumber", oldData.phone_number || "");
      setValue("locationFrom", oldData.location_from || "");
      setValue("locationTo", oldData.location_to || "");
      setValue(
        "startingDate",
        oldData.start_date
          ? new Date(oldData.start_date).toISOString().split("T")[0]
          : ""
      );
      setValue(
        "endingDate",
        oldData.end_date
          ? new Date(oldData.end_date).toISOString().split("T")[0]
          : ""
      );
      setValue("adult", oldData.adult_count || 0);
      setValue("child", oldData.child_count || 0);
      setValue("budget", oldData.budget || "");
      setValue("touristSpots", oldData.tourist_spots || "");
      setValue("description", oldData.description || "");
      setValue("travelType", oldData.travel_type || "");
      setValue("destinationType", oldData.destination_type || "");
      setValue("typeOfAccommodation", oldData.type_of_accommodation || "");
      setValue("minimum_star_hotel", oldData.minimum_star_hotel || "");
      setValue("mealPlan", oldData.meal_plan || "");
      setValue("confirmation", !!oldData.is_confirmed_request);
    }
    setIsPopupOpened(true);
  }, [state?.id, oldData, setValue]);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API is not available");
        toast.error(t("google_maps_error"));
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
        toast.error(t("google_maps_load_error"));
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
    if (data.endingDate < data.startingDate) {
      toast.error(t("end_date_after_start"));
      return;
    }

    if (!data.adult && !data.child) {
      toast.error(t("at_least_one_person"));
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone_number", data.phoneNumber);
    formData.append("location_from", data.locationFrom);
    formData.append("location_to", data.locationTo);
    formData.append("start_date", data.startingDate);
    formData.append("end_date", data.endingDate);
    formData.append("adult_count", data.adult || 0);
    formData.append("child_count", data.child || 0);
    formData.append("budget", data.budget);
    formData.append("description", data.description);
    formData.append("travel_type", data.travelType);
    formData.append("destination_type", data.destinationType);
    formData.append("type_of_accommodation", data.typeOfAccommodation);
    formData.append("minimum_star_hotel", data.minimumHotelStars);
    formData.append("meal_plan", data.mealPlan);
    formData.append("status", status);
    formData.append("tourist_spots", data.touristSpots);
    formData.append(
      "is_confirmed_request",
      data.confirmation ? "true" : "false"
    );

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
      if (state?.id) {
        response = await update({
          id: state.id,
          updates: formData,
        }).unwrap();
      } else {
        response = await createPlan(formData).unwrap();
      }

      toast.success(t("plan_created_success"), {
        duration: 4000,
        style: {
          background: "linear-gradient(135deg, #3b82f6, #10b981)",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          maxWidth: "400px",
        },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#3b82f6",
        },
      });

      reset();
      setSelectedFile(null);
      navigate("/user");
    } catch (error) {
      toast.error(t("error_creating_plan", { action: state?.id ? t("updating") : t("creating") }));
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

  if (isFetching && state?.id) {
    return <FullScreenInfinityLoader />;
  }

  const { ref: fromFormRef, ...fromRest } = register("locationFrom", {
    required: t("location_from_required"),
  });
  const { ref: toFormRef, ...toRest } = register("locationTo", {
    required: t("location_to_required"),
  });

  return (
    <div className="p-6">
      <div className="mx-auto">
        <Toaster />
        <div className="flex items-center mb-8">
          <NavLink to="/user">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <FiArrowLeft className="w-5 h-5" />
              <span className="text-md">{t("back")}</span>
            </button>
          </NavLink>
        </div>

        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          {state?.id ? t("edit_tour_plan") : t("create_tour_plan")}
        </h1>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("name")}
              </label>
              <input
                type="text"
                placeholder={t("enter_full_name")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {t("email")}
              </label>
              <input
                type="email"
                placeholder={t("enter_email")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("typeOfAccommodation", {
                    required: t("accommodation_required"),
                  })}
                >
                  <option value="" disabled selected>
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
                  {t("destination_type")}
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("destinationType", {
                    required: t("destination_required"),
                  })}
                >
                  <option value="" disabled selected>
                    {t("select_destination")}
                  </option>
                  <option value="beach">{t("beach_trips")}</option>
                  <option value="mountain">{t("mountain_adventures")}</option>
                  <option value="relax">{t("relaxing_tours")}</option>
                  <option value="group">{t("group_packages")}</option>
                </select>
                {errors.destinationType && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.destinationType.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  {t("minimum_hotel_stars")}
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("minimumHotelStars")}
                >
                  <option value="" disabled selected>
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
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  {...register("startingDate", {
                    required: t("starting_date_required"),
                  })}
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {errors.startingDate && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.startingDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("ending_date")}
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  {...register("endingDate", {
                    required: t("ending_date_required"),
                  })}
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {errors.endingDate && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.endingDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex w-full gap-4">
              <div className="flex-1">
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  {t("adult")}
                </label>
                <input
                  type="number"
                  placeholder={t("enter_adults")}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("adult", {
                    min: {
                      value: 0,
                      message: t("adults_cannot_be_negative"),
                    },
                  })}
                />
                {errors.adult && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.adult.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  {t("child")}
                </label>
                <input
                  type="number"
                  placeholder={t("enter_children")}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("child", {
                    min: {
                      value: 0,
                      message: t("children_cannot_be_negative"),
                    },
                  })}
                />
                {errors.child && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.child.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("budget")}
              </label>
              {showBudgetMessage && isPopupOpened && (
                <p className="text-sm text-gray-600 mb-2">
                  {t("budget_message")}
                </p>
              )}
              <input
                type="number"
                placeholder="EUR"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("budget", {
                  required: t("budget_required"),
                  min: { value: 0, message: t("budget_cannot_be_negative") },
                  validate: (value) =>
                    (value !== null && value !== "") || t("budget_required"),
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("budget", value === "" ? null : Number(value), {
                    shouldValidate: true,
                  });
                }}
                onClick={handleBudgetClick}
                ref={budgetRef}
              />
              {errors.budget && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.budget.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("tourist_spots")}
              </label>
              <input
                type="text"
                placeholder={t("search_tourist_spot")}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={(e) => {
                  touristSpotsRef.current = e;
                }}
              />
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                {t("meal_plan")}
              </label>
              <select
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("mealPlan", { required: t("meal_plan_required") })}
              >
                <option value="" disabled selected>
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
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                {...register("description")}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 mt-8">
            <input
              type="checkbox"
              id="confirmation"
              className="mt-1 w-4 h-4 text-blue-600 border border-blue-600 rounded focus:ring-blue-500 hover:cursor-pointer checkbox checkbox-xs checked:text-blue-600"
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
              onClick={handleSubmit((data) => onSubmit(data, "draft"))}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isSavingDraft || isPublishing}
            >
              {isSavingDraft ? t("saving") : t("save_for_future")}
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "published"))}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              disabled={isSavingDraft || isPublishing}
            >
              {isPublishing ? t("publishing") : t("publish_now")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlan;