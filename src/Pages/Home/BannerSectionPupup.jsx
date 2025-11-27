import { useState, useEffect, useRef } from "react";
import {
  useCreatePlanOneMutation,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

let isGoogleScriptLoaded = false;

export default function BannerSectionPopup({ closeForm, initialStep = 1 }) {
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    locationFrom: "",
    locationTo: "",
    startingDate: "",
    endingDate: "",
    adults: 0,
    children: 0,
    budget: "",
    touristSpots: "",
    description: "",
    uploadedFile: null,
    destinationType: "",
    typeOfAccommodation: "",
    minimumHotelStars: "",
    mealPlan: "",
    travelType: "",
    includeRoundTripFlight: false,
    confirmation: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showBudgetMessage, setShowBudgetMessage] = useState(false);
  const [hasWarningBeenShown, setHasWarningBeenShown] = useState(false);
  const budgetRef = useRef(null);
  const [isPopupOpened, setIsPopupOpened] = useState(false);
  const [createPlan] = useCreatePlanOneMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    trigger,
  } = useForm();
  const locationFromRef = useRef(null);
  const locationToRef = useRef(null);
  const touristSpotsRef = useRef(null);

  // Define the event handlers
  const handleBudgetClick = () => {
    if (isPopupOpened && !showBudgetMessage && !hasWarningBeenShown) {
      setShowBudgetMessage(true);
    }
  };

  const handleOkClick = () => {
    setShowBudgetMessage(false);
    setHasWarningBeenShown(true);
  };

  useEffect(() => {
    // Reset states when popup is opened
    setIsPopupOpened(true);
    setShowBudgetMessage(false);
    setHasWarningBeenShown(false);

    // Load existing plan or pending plan data
    const pendingPlan = localStorage.getItem("pendingPlan");
    if (state?.id) {
      // Load data from state (existing plan)
      setValue("name", state?.name || "");
      setValue("email", state?.email || "");
      setValue("phoneNumber", state?.phone_number || "");
      setValue("locationFrom", state?.location_from || "");
      setValue("locationTo", state?.location_to || "");
      setValue(
        "startingDate",
        state?.start_date
          ? new Date(state?.start_date).toISOString().split("T")[0]
          : ""
      );
      setValue(
        "endingDate",
        state?.end_date
          ? new Date(state?.end_date).toISOString().split("T")[0]
          : ""
      );
      setValue("adults", state?.adult_count || 0);
      setValue("children", state?.child_count || 0);
      setValue("budget", state?.budget || "");
      setValue("touristSpots", state?.tourist_spots || "");
      setValue("description", state?.description || "");
      setValue("destinationType", state?.destination_type || "");
      setValue("typeOfAccommodation", state?.type_of_accommodation || "");
      setValue("minimumHotelStars", state?.minimum_star_hotel || "");
      setValue("mealPlan", state?.meal_plan || "");
      setValue("travelType", state?.travel_type || "");
      setValue("confirmation", !!state?.is_confirmed_request);
      Object.entries(state || {}).forEach(([key, value]) => {
        const mappedKey =
          {
            phone_number: "phoneNumber",
            location_from: "locationFrom",
            location_to: "locationTo",
            start_date: "startingDate",
            end_date: "endingDate",
            adult_count: "adults",
            child_count: "children",
            tourist_spots: "touristSpots",
            destination_type: "destinationType",
            type_of_accommodation: "typeOfAccommodation",
            minimum_star_hotel: "minimumHotelStars",
            meal_plan: "mealPlan",
            travel_type: "travelType",
            is_confirmed_request: "confirmation",
          }[key] || key;
        updateFormData(mappedKey, value);
      });
    } else if (pendingPlan) {
      // Load data from pendingPlan
      const parsed = JSON.parse(pendingPlan);
      Object.entries(parsed).forEach(([key, value]) => {
        setValue(key, value);
        updateFormData(key, value);
      });
    }
  }, [state?.id, setValue]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!isGoogleScriptLoaded && !window.google) {
        isGoogleScriptLoaded = true;
        console.log("Loading Google Maps script...");
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBIVSr8DMIg5U5P_oRIDt1j_Q32ceDQddc&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("Google Maps script loaded successfully");
        };
        script.onerror = () => {
          console.error("Failed to load Google Maps API");
          toast.error(t("google_maps_load_failed") || "Failed to load Google Maps API");
        };
        document.head.appendChild(script);
      }
    };
    loadGoogleMaps();
    return () => {};
  }, [t]);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API is not available");
        toast.error(t("google_maps_not_available") || "Google Maps Places API is not available");
        return;
      }
      console.log("Initializing autocomplete for all fields...");
      if (locationFromRef.current) {
        console.log("Setting up autocomplete for locationFrom");
        const fromAutocomplete = new window.google.maps.places.Autocomplete(
          locationFromRef.current
        );
        fromAutocomplete.addListener("place_changed", () => {
          const place = fromAutocomplete.getPlace();
          const locationValue = place.formatted_address || place.name;
          console.log("locationFrom selected:", locationValue);
          setValue("locationFrom", locationValue);
          updateFormData("locationFrom", locationValue);
        });
      } else {
        console.warn("locationFromRef is null");
      }
      if (locationToRef.current) {
        console.log("Setting up autocomplete for locationTo");
        const toAutocomplete = new window.google.maps.places.Autocomplete(
          locationToRef.current
        );
        toAutocomplete.addListener("place_changed", () => {
          const place = toAutocomplete.getPlace();
          const locationValue = place.formatted_address || place.name;
          console.log("locationTo selected:", locationValue);
          setValue("locationTo", locationValue);
          updateFormData("locationTo", locationValue);
        });
      } else {
        console.warn("locationToRef is null");
      }
      
    };
    if (window.google) {
      setTimeout(initAutocomplete, 100);
    }
  }, [setValue, currentStep]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = async (step) => {
    let fieldsToValidate = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["startingDate", "endingDate", "adults", "children"];
        break;
      case 2:
        fieldsToValidate = [
          "locationFrom",
          "locationTo",
          "budget",
          "touristSpots",
        ];
        break;
      case 3:
        fieldsToValidate = [
          "typeOfAccommodation",
          "minimumHotelStars",
          "mealPlan",
        ];
        break;
      case 4:
        fieldsToValidate = ["travelType", "destinationType"];
        break;
      case 5:
        fieldsToValidate = ["name", "email", "phoneNumber", "confirmation"];
        break;
      default:
        return true;
    }
    const result = await trigger(fieldsToValidate);
    if (!result) {
      toast.error(t("fill_all_required") || "Please fill all required fields before proceeding.");
    }
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data, status) => {
    console.log("onSubmit called with data:", data, "status:", status);
    const accessToken = localStorage.getItem("access_token");
    console.log("Access Token:", accessToken);
    if (!accessToken) {
      localStorage.setItem("pendingPlan", JSON.stringify(data));
      toast.error(t("please_login") || "Please log in to create a plan");
      navigate("/register", { state: { fromLogin: true } });
      return;
    }
    if (data.endingDate < data.startingDate) {
      toast.error(t("end_date_after_start") || "End date must be after start date");
      return;
    }
    if (!data.adults && !data.children) {
      toast.error(t("at_least_one_person") || "At least one adult or child is required");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("name", data.name);
    formDataToSend.append("email", data.email);
    formDataToSend.append("phone_number", data.phoneNumber);
    formDataToSend.append("location_from", data.locationFrom);
    formDataToSend.append("location_to", data.locationTo);
    formDataToSend.append("start_date", data.startingDate);
    formDataToSend.append("end_date", data.endingDate);
    formDataToSend.append("adult_count", data.adults || 0);
    formDataToSend.append("child_count", data.children || 0);
    formDataToSend.append("budget", data.budget || "");
    formDataToSend.append("description", data.description || "");
    formDataToSend.append("travel_type", data.travelType || "");
    formDataToSend.append("destination_type", data.destinationType || "");
    formDataToSend.append(
      "type_of_accommodation",
      data.typeOfAccommodation || ""
    );
    formDataToSend.append("minimum_star_hotel", data.minimumHotelStars || "");
    formDataToSend.append("meal_plan", data.mealPlan || "");
    formDataToSend.append("status", status);
    formDataToSend.append("tourist_spots", data.touristSpots || "");
    formDataToSend.append(
      "is_confirmed_request",
      data.confirmation ? "true" : "false"
    );
    if (selectedFile) {
      formDataToSend.append("spot_picture", selectedFile);
    }
    console.log("FormData to send:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }
    try {
      if (status === "draft") {
        setIsSavingDraft(true);
      } else {
        setIsPublishing(true);
      }
      let response;
      if (state?.id) {
        response = await updatePlan({
          id: state.id,
          updates: formDataToSend,
        }).unwrap();
        console.log("Update Plan Response:", response);
      } else {
        response = await createPlan(formDataToSend).unwrap();
        console.log("Create Plan Response:", response);
      }

      toast.success(
        t("plan_submitted_success") || "Your data successfully submitted! When approved by admin, this tour plan will be published.",
        {
          autoClose: 4000,
          style: {
            background: "linear-gradient(135deg, #FF6600, #e55600)",
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
            secondary: "#FF6600",
          },
        }
      );

      reset();
      setSelectedFile(null);
      console.log("Navigating to /user and closing form");
      localStorage.removeItem("pendingPlan");
      navigate("/user");
      closeForm();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        t("error_submitting") || `Error ${state?.id ? "updating" : "creating"} plan: ${error.message}`
      );
    } finally {
      if (status === "draft") {
        setIsSavingDraft(false);
      } else {
        setIsPublishing(false);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    updateFormData("uploadedFile", file);
  };

  const handlepupupClose = () => {
    localStorage.removeItem("pendingPlan");
    closeForm();
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const { ref: fromFormRef, ...fromRest } = register("locationFrom", {
    required: t("location_from_required") || "Location (From) is required",
  });

  const { ref: toFormRef, ...toRest } = register("locationTo", {
    required: t("location_to_required") || "Location (To) is required",
  });

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden sm:max-w-lg xs:max-w-xs transition-all duration-300">
      <div className="bg-gradient-to-r from-[#FF6600] to-[#e55600] p-3 sm:p-4">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm font-semibold text-white">
            {t("step_of", { current: currentStep, total: totalSteps })}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white">
            {Math.round(progressPercentage)}% {t("complete")}
          </span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 sm:h-3">
          <div
            className="bg-white h-2 sm:h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="p-3 sm:p-4 xs:p-2 relative" style={{ zIndex: 1000 }}>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-3 sm:mb-4 text-center">
          {t("create_your_tour_plan")}
        </h2>
        {currentStep === 1 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                 {t("starting_date")}
                </label>
                <input
                  {...register("startingDate", {
                    required: t("starting_date_required") || "Starting Date is required",
                  })}
                  type="date"
                  defaultValue={formData.startingDate}
                  onChange={(e) =>
                    updateFormData("startingDate", e.target.value)
                  }
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.startingDate && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.startingDate.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("ending_date")}
                </label>
                <input
                  {...register("endingDate", {
                    required: t("ending_date_required") || "Ending Date is required",
                  })}
                  type="date"
                  defaultValue={formData.endingDate}
                  onChange={(e) => updateFormData("endingDate", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.endingDate && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.endingDate.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("adults")}
                </label>
                <input
                  {...register("adults", {
                    required: t("adults_required") || "At least one adult or child is required",
                    min: { value: 0, message: t("adults_negative") || "Adults cannot be negative" },
                  })}
                  type="number"
                  placeholder={t("adults_placeholder") || "Adults"}
                  defaultValue={formData.adults}
                  onChange={(e) => updateFormData("adults", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.adults && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.adults.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("children")}
                </label>
                <input
                  {...register("children", {
                    min: { value: 0, message: t("children_negative") || "Children cannot be negative" },
                  })}
                  type="number"
                  placeholder={t("children_placeholder") || "Children"}
                  defaultValue={formData.children}
                  onChange={(e) => updateFormData("children", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.children && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.children.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                 {t("location_from")}
                </label>
                <input
                  {...fromRest}
                  type="text"
                  placeholder={t("starting_location_placeholder") || "Starting location"}
                  defaultValue={formData.locationFrom}
                  onChange={(e) => {
                    updateFormData("locationFrom", e.target.value);
                    setValue("locationFrom", e.target.value);
                  }}
                  ref={(e) => {
                    fromFormRef(e);
                    locationFromRef.current = e;
                  }}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.locationFrom && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.locationFrom.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                 {t("location_to")}
                </label>
                <input
                  {...toRest}
                  type="text"
                  placeholder={t("destination_placeholder") || "Destination"}
                  defaultValue={formData.locationTo}
                  onChange={(e) => {
                    updateFormData("locationTo", e.target.value);
                    setValue("locationTo", e.target.value);
                  }}
                  ref={(e) => {
                    toFormRef(e);
                    locationToRef.current = e;
                  }}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.locationTo && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.locationTo.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                 {t("budget")}
                </label>
                <input
                  {...register("budget", {
                    required: t("budget_required") || "Budget is required",
                    validate: (value) =>
                      value.trim() !== "" || t("budget_empty") || "Budget cannot be empty",
                  })}
                  type="text"
                  placeholder={t("budget_placeholder") || "Budget (EUR)"}
                  defaultValue={formData.budget}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFormData("budget", value);
                    setValue("budget", value, { shouldValidate: true });
                  }}
                  onClick={handleBudgetClick}
                  ref={budgetRef}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.budget && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.budget.message}
                  </span>
                )}
                {showBudgetMessage && (
                  <div className="fixed inset-x-0 top-0 flex items-center justify-center z-50 pt-4">
                    <div className="bg-white rounded-lg p-4 flex flex-col items-end space-y-4 lg:w-96 w-72">
                      <p className="lg:text-[15px] text-[13px] text-gray-700">
                       {t("budget_warning_message")}
                      </p>
                      <button
                        onClick={handleOkClick}
                        className="bg-[#FF6600] hover:bg-[#e55600] text-white font-semibold py-1 px-4 rounded-lg text-[14px]"
                      >
                       {t("ok")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("tourist_spots")}
                </label>
                <input
                  {...register("touristSpots", {
                    required: t("tourist_spots_required") || "Tourist Spots is required",
                  })}
                  type="text"
                  placeholder={t("tourist_spots_placeholder") || "Mare, Monumenti, Ristorante..."}
                  defaultValue={formData.touristSpots}
                  onChange={(e) => {
                    updateFormData("touristSpots", e.target.value);
                    setValue("touristSpots", e.target.value);
                    console.log("touristSpots input changed:", e.target.value);
                  }}
                  ref={(e) => {
                    touristSpotsRef.current = e;
                  }}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                  style={{ zIndex: 1001 }}
                />
                {errors.touristSpots && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.touristSpots.message}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t("description_optional") || "Description (Optional)"}
              </label>
              <textarea
                {...register("description")}
                placeholder={t("description_placeholder") || "Vorremmo una settimana di relax al mare con due bambini, in hotel con piscina."}
                rows="4"
                defaultValue={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none text-xs sm:text-sm transition-all duration-200"
              ></textarea>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("type_of_accommodation")}
                </label>
                <select {...register("typeOfAccommodation", { required: t("accommodation_required") || "Accommodation is required" })}>
                  <option value="">{t("select_accommodation") || "Select Accommodation"}</option>
                  <option value="hotel">{t("hotel")}</option>
                  <option value="resort">{t("resort")}</option>
                  <option value="homestay">{t("homestay")}</option>
                  <option value="apartment">{t("apartment")}</option>
                  <option value="hostel">{t("hostel")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("minimum_hotel_stars")}
                </label>
                <select {...register("minimumHotelStars")}>
                  <option value="">{t("select_stars") || "Select Stars"}</option>
                  {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} {t("star", { count: s })}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t("meal_plan")}
              </label>
              <select {...register("mealPlan", { required: t("meal_plan_required") || "Meal plan is required" })}>
                <option value="">{t("select_meal_plan") || "Select Meal Plan"}</option>
                <option value="none">{t("no_meals")}</option>
                <option value="breakfast">{t("breakfast")}</option>
                <option value="half-board">{t("half_board")}</option>
                <option value="full-board">{t("full_board")}</option>
              </select>
            </div>
          </>
        )}
        {currentStep === 4 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("travel_type")}
                </label>
                <select
                  {...register("travelType", {
                    required: t("travel_type_required") || "Travel Type is required",
                  })}
                  defaultValue={formData.travelType}
                  onChange={(e) => updateFormData("travelType", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                >
                  <option value="">{t("select_travel_type") || "Select Travel Type"}</option>
                  <option value="family">{t("family_trip") || "Family Trip"}</option>
                  <option value="solo">{t("solo_travel") || "Solo Travel"}</option>
                  <option value="couple">{t("couple") || "Couple"}</option>
                  <option value="group">{t("group_travel") || "Group Travel"}</option>
                  <option value="business">{t("business_travel") || "Business Travel"}</option>
                </select>
                {errors.travelType && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.travelType.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("destination_type")}
                </label>
                <select
                  {...register("destinationType", {
                    required: t("destination_type_required") || "Destination Type is required",
                  })}
                  defaultValue={formData.destinationType}
                  onChange={(e) =>
                    updateFormData("destinationType", e.target.value)
                  }
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                >
                  <option value="">{t("select_destination_type") || "Select Destination Type"}</option>
                  <option value="beach">{t("beach_trips") || "Beach trips"}</option>
                  <option value="mountain">{t("mountain_adventures") || "Mountain adventures"}</option>
                  <option value="relax">{t("relaxing_tours") || "Relaxing tours"}</option>
                  <option value="group">{t("group_packages") || "Group packages"}</option>
                </select>
                {errors.destinationType && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.destinationType.message}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                {t("review_your_information") || "Review Your Information"}
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>
                  <span className="font-medium">{t("from") || "From:"}</span>{" "}
                  {formData.locationFrom || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("to") || "To:"}</span>{" "}
                  {formData.locationTo || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("dates") || "Dates:"}</span>{" "}
                  {formData.startingDate && formData.endingDate
                    ? `${formData.startingDate} to ${formData.endingDate}`
                    : t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("travelers") || "Travelers:"}</span>{" "}
                  {formData.adults || formData.children
                    ? `${formData.adults || 0} ${t("adults")}, ${
                        formData.children || 0
                      } ${t("children")}`
                    : t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("budget") || "Budget:"}</span>{" "}
                  {formData.budget || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("tourist_spots") || "Tourist Spots:"}</span>{" "}
                  {formData.touristSpots || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("accommodation") || "Accommodation:"}</span>{" "}
                  {formData.typeOfAccommodation || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("hotel_stars") || "Hotel Stars:"}</span>{" "}
                  {formData.minimumHotelStars || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("meal_plan") || "Meal Plan:"}</span>{" "}
                  {formData.mealPlan || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("travel_type") || "Travel Type:"}</span>{" "}
                  {formData.travelType || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("destination_type") || "Destination Type:"}</span>{" "}
                  {formData.destinationType || t("not_specified") || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">{t("flight") || "Flight:"}</span>{" "}
                  {formData.includeRoundTripFlight
                    ? t("included") || "Included"
                    : t("not_included") || "Not included"}
                </p>
              </div>
            </div>
          </div>
        )}
        {currentStep === 5 && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t("name")}
              </label>
              <input
                {...register("name", { required: t("name_required") || "Name is required" })}
                type="text"
                placeholder={t("full_name") || "Full name"}
                defaultValue={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                {...register("email", {
                  required: t("email_required") || "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: t("invalid_email") || "Invalid email address",
                  },
                })}
                type="email"
                placeholder={t("email") || "Email"}
                defaultValue={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t("phone_number")}
              </label>
              <input
                {...register("phoneNumber", {
                  required: t("phone_required") || "Phone Number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: t("invalid_phone") || "Invalid phone number",
                  },
                })}
                type="tel"
                placeholder={t("phone_number") || "Phone number"}
                defaultValue={formData.phoneNumber}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              />
              {errors.phoneNumber && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>
            <div className="flex items-start">
              <input
                {...register("confirmation", {
                  required: t("confirmation_required") || "You must confirm the request",
                })}
                type="checkbox"
                id="confirmation"
                checked={formData.confirmation}
                onChange={(e) =>
                  updateFormData("confirmation", e.target.checked)
                }
                className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded mt-1"
              />
              <label
                htmlFor="confirmation"
                className="ml-2 text-xs sm:text-sm text-gray-700"
              >
                {t("confirmation_text") || "I confirm this is a travel request, and all provided information is valid and does not include any third party."}
              </label>
              {errors.confirmation && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.confirmation.message}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2 sm:mb-0 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-2 py-1 sm:px-2 sm:py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-xs sm:text-sm transition-all duration-200 w-full sm:w-auto"
              >
                {t("previous") || "Previous"}
              </button>
            )}
            <button
              onClick={handlepupupClose}
              className="px-2 py-1 sm:px-2.1 sm:py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-xs sm:text-sm transition-all duration-200 w-full sm:w-auto"
            >
              {t("cancel") || "Cancel"}
            </button>
          </div>
          <div className="w-full sm:w-auto">
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="bg-[#FF6600] hover:bg-[#e55600] text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg text-xs sm:text-sm w-full sm:w-auto transition-all duration-200"
              >
                {t("next") || "Next"}
              </button>
            ) : (
              <button
                onClick={handleSubmit((data) => onSubmit(data, "published"))}
                disabled={
                  isSavingDraft || isPublishing || !formData.confirmation
                }
                className="bg-[#FF6600] hover:bg-[#e55600] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-1.5 sm:py-1.01 px-1 sm:px-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto transition-all duration-200"
              >
                {isPublishing ? t("publishing") || "Publishing..." : t("publish_now") || "Publish Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}