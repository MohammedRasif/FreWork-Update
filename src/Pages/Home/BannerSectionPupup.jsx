import { useState, useEffect, useRef } from "react";
import {
  useCreatePlanOneMutation,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaLocationDot } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import { GoChevronDown } from "react-icons/go";

let isGoogleScriptLoaded = false;

export default function BannerSectionPopup({ closeForm, initialStep = 1 }) {
  const totalSteps = 6;
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
    budget: "5000",
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
  } = useForm({
    defaultValues: { budget: "5000" },
  });
  const locationFromRef = useRef(null);
  const locationToRef = useRef(null);
  const touristSpotsRef = useRef(null);

  // UI-only display step (1-3) mapped from internal step
  // Navigation: currentStep 1 → UI 1, currentStep 5 → UI 2, currentStep 6 → UI 3
  const uiStep = currentStep <= 4 ? 1 : currentStep === 5 ? 2 : 3;
  const totalUiSteps = 3;
  const progressPercentage = (uiStep / totalUiSteps) * 100;

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
          : "",
      );
      setValue(
        "endingDate",
        state?.end_date
          ? new Date(state?.end_date).toISOString().split("T")[0]
          : "",
      );
      setValue("adults", state?.adult_count || 0);
      setValue("children", state?.child_count || 0);
      setValue("budget", state?.budget || "5000");
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
          toast.error(
            t("google_maps_load_failed") || "Failed to load Google Maps API",
          );
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
        return;
      }
      console.log("Initializing autocomplete for locationTo (Where To)...");

      // locationFromRef is a hidden input — skip it (Google can't attach to hidden inputs).
      // We auto-mirror locationFrom = locationTo on place selection below.

      if (locationToRef.current) {
        console.log("Setting up autocomplete for locationTo");
        const toAutocomplete = new window.google.maps.places.Autocomplete(
          locationToRef.current,
        );
        toAutocomplete.addListener("place_changed", () => {
          const place = toAutocomplete.getPlace();
          const locationValue = place.formatted_address || place.name;
          console.log("locationTo selected:", locationValue);
          setValue("locationTo", locationValue);
          updateFormData("locationTo", locationValue);
          // Also set locationFrom to the same value so the backend field is filled
          setValue("locationFrom", locationValue);
          updateFormData("locationFrom", locationValue);
        });
      } else {
        console.warn("locationToRef is null");
      }
    };

    // If Google is already loaded, init immediately (with small delay for DOM)
    if (window.google) {
      setTimeout(initAutocomplete, 100);
    } else {
      // Wait for the script's onload then retry
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          setTimeout(initAutocomplete, 100);
        }
      }, 300);
      return () => clearInterval(interval);
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
      toast.error(
        t("fill_all_required") ||
          "Please fill all required fields before proceeding.",
      );
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
      navigate("/registrazione", { state: { fromLogin: true } });
      return;
    }
    if (data.endingDate < data.startingDate) {
      toast.error(
        t("end_date_after_start") || "End date must be after start date",
      );
      return;
    }
    if (!data.adults && !data.children) {
      toast.error(
        t("at_least_one_person") || "At least one adult or child is required",
      );
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
      data.typeOfAccommodation || "",
    );
    formDataToSend.append("minimum_star_hotel", data.minimumHotelStars || "");
    formDataToSend.append("meal_plan", data.mealPlan || "");
    formDataToSend.append("status", status);
    formDataToSend.append("tourist_spots", data.touristSpots || "");
    formDataToSend.append(
      "is_confirmed_request",
      data.confirmation ? "true" : "false",
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

      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "apertura_popup");
        console.log("Google Analytics event 'apertura_popup' sent using gtag");
      }
      toast.success(
        t("plan_submitted_success") ||
          "Your data successfully submitted! When approved by admin, this tour plan will be published.",
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
        },
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
        t("error_submitting") ||
          `Error ${state?.id ? "updating" : "creating"} plan: ${error.message}`,
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

  // locationFrom is a hidden field — no required validation (auto-filled from locationTo)
  const { ref: fromFormRef, ...fromRest } = register("locationFrom");

  const { ref: toFormRef, ...toRest } = register("locationTo", {
    required: t("location_to_required") || "Location (To) is required",
  });

  // ─── UI STEP 1: Plan Your Trip (internal steps 1 & 2) ───────────────────────
  const handleUiStep1Next = async () => {
    // Pre-fill hidden fields with safe defaults before validation
    if (!formData.children) {
      setValue("children", 0);
      updateFormData("children", 0);
    }
    // If locationFrom is empty, mirror locationTo into it
    if (!formData.locationFrom && formData.locationTo) {
      setValue("locationFrom", formData.locationTo);
      updateFormData("locationFrom", formData.locationTo);
    }
    // touristSpots is hidden — set a placeholder so validation passes
    if (!formData.touristSpots) {
      setValue("touristSpots", "N/A");
      updateFormData("touristSpots", "N/A");
    }

    // Only validate the VISIBLE fields on this screen
    const visibleFields = ["startingDate", "endingDate", "adults", "locationTo", "budget"];
    const result = await trigger(visibleFields);
    if (!result) {
      toast.error(
        t("fill_all_required") || "Please fill all required fields before proceeding."
      );
      return;
    }
    // Advance to UI step 2 (internal step 5 — name/email/phone)
    setCurrentStep(5);
  };

  // ─── UI STEP 2: Almost Done (internal step 5 — name/email/phone/confirmation) ─
  const handleUiStep2Next = async () => {
    const valid = await validateStep(5);
    if (!valid) return;
    setCurrentStep(6); // go to optional step UI
  };

  // ─── UI STEP 3: Improve Your Offers (optional — internal steps 3 & 4) ────────
  // "Add details" — validate & submit with optional data
  const handleAddDetails = async () => {
    // validate accommodation / stars / meal plan
    const step3Valid = await validateStep(3);
    if (!step3Valid) return;
    // validate travel type / destination type
    const step4Valid = await validateStep(4);
    if (!step4Valid) return;
    handleSubmit((data) => onSubmit(data, "published"))();
  };

  // "Skip for now" — auto-confirm and submit without optional data
  const handleSkipDetails = () => {
    // clear optional fields so they are empty in submission
    setValue("typeOfAccommodation", "");
    setValue("minimumHotelStars", "");
    setValue("mealPlan", "");
    setValue("travelType", "");
    setValue("destinationType", "");
    setValue("description", "");
    handleSubmit((data) => onSubmit(data, "published"))();
  };

  // Star rating helper
  const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-xl focus:outline-none transition-transform hover:scale-110"
        >
          <span style={{ color: star <= value ? "#DD9E2C" : "#d1d5db" }}>★</span>
        </button>
      ))}
    </div>
  );

  // Pill button helper
  const PillButton = ({ label, active, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
        active
          ? "bg-[#DD9E2C] text-white border-[#DD9E2C]"
          : "bg-white text-gray-600 border-gray-300 hover:border-[#DD9E2C]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* ── Progress Header ─────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
            STEP {uiStep} OF {totalUiSteps}
          </span>
          <button
            onClick={handlepupupClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {/* <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${progressPercentage}%`,
              background: "linear-gradient(90deg, #DD9E2C, #C2851C)",
            }}
          />
        </div> */}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 relative" style={{ zIndex: 1000 }}>
        {uiStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Plan Your Trip ✈️
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:flex items-center gap-4">
              {/* Where To (locationTo) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                WHERE TO?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black"><FaLocationDot />
</span>
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
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent text-sm transition-all duration-200"
                />
              </div>
              {errors.locationTo && (
                <span className="text-red-500 text-xs mt-1">{errors.locationTo.message}</span>
              )}
            </div>

            {/* Hidden locationFrom — set same as locationTo or leave blank */}
            <input
              {...fromRest}
              type="hidden"
              ref={(e) => {
                fromFormRef(e);
                locationFromRef.current = e;
              }}
            />

            {/* Dates row */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                  WHEN WILL YOU TRAVEL?
                </label>
                <div className="relative">
                  <input
                    {...register("startingDate", {
                      required: t("starting_date_required") || "Starting Date is required",
                    })}
                    type="date"
                    defaultValue={formData.startingDate}
                    onChange={(e) => updateFormData("startingDate", e.target.value)}
                    className="date-input w-full pl-3 pr-2 py-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-0 focus:border-transparent text-sm transition-all duration-200"                  />
                </div>
                {errors.startingDate && (
                  <span className="text-red-500 text-xs mt-1">{errors.startingDate.message}</span>
                )}
              </div>
              {/* <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  ENDING DATE
                </label>
                <input
                  {...register("endingDate", {
                    required: t("ending_date_required") || "Ending Date is required",
                  })}
                  type="date"
                  defaultValue={formData.endingDate}
                  onChange={(e) => updateFormData("endingDate", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.endingDate && (
                  <span className="text-red-500 text-xs mt-1">{errors.endingDate.message}</span>
                )}
              </div> */}
            </div>

            {/* Travelers row */}
            <div>
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                HOW MANY TRAVELERS?
              </label>
              <div className="flex items-center gap-4">
                {/* Adults counter */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-[6px]">
                  <button
                    type="button"
                    onClick={() => {
                      const val = Math.max(0, (parseInt(formData.adults) || 0) - 1);
                      updateFormData("adults", val);
                      setValue("adults", val);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 cursor-pointer  transition-colors font-bold text-lg leading-none"
                  >
                    −
                  </button>
                  <input
                    {...register("adults", {
                      required: t("adults_required") || "At least one adult or child is required",
                      min: { value: 0, message: t("adults_negative") || "Adults cannot be negative" },
                    })}
                    type="number"
                    value={formData.adults}
                    onChange={(e) => {
                      updateFormData("adults", e.target.value);
                      setValue("adults", e.target.value);
                    }}
                    className="w-8 text-center bg-transparent text-base font-semibold focus:outline-none border-none"
                    style={{ MozAppearance: "textfield" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = (parseInt(formData.adults) || 0) + 1;
                      updateFormData("adults", val);
                      setValue("adults", val);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 cursor-pointer  transition-colors font-bold text-lg leading-none"
                  >
                    +
                  </button>
                </div>

                {/* Children (hidden but preserved) */}
                <input
                  {...register("children", {
                    min: { value: 0, message: t("children_negative") || "Children cannot be negative" },
                  })}
                  type="hidden"
                  value={formData.children}
                />
              </div>
              {errors.adults && (
                <span className="text-red-500 text-xs mt-1">{errors.adults.message}</span>
              )}
            </div>
            </div>

            {/* Budget Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                  WHAT'S YOUR BUDGET?
                </label>
                <span className="text-base font-bold text-gray-800">
                  ${parseInt(formData.budget || 5000).toLocaleString()}
                </span>
              </div>
              <input
                {...register("budget", {
                  required: t("budget_required") || "Budget is required",
                })}
                type="range"
                min={0}
                max={50000}
                step={500}
                value={formData.budget || 5000}
                onClick={handleBudgetClick}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFormData("budget", value);
                  setValue("budget", value, { shouldValidate: true });
                }}
                ref={budgetRef}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #DD9E2C ${((parseInt(formData.budget || 5000)) / 50000) * 100}%, #e5e7eb ${((parseInt(formData.budget || 5000)) / 50000) * 100}%)`,
                }}
              />
              {errors.budget && (
                <span className="text-red-500 text-xs mt-1">{errors.budget.message}</span>
              )}
            </div>

            {/* Hidden touristSpots — no required validation, pre-filled in handleUiStep1Next */}
            <input
              {...register("touristSpots")}
              type="hidden"
              ref={(e) => { touristSpotsRef.current = e; }}
            />

            {/* Budget warning popup */}
            {showBudgetMessage && (
              <div className="fixed inset-x-0 top-0 flex items-center justify-center z-50 pt-4">
                <div className="bg-white rounded-lg p-4 flex flex-col items-end space-y-4 shadow-2xl lg:w-96 w-72">
                  <p className="lg:text-[15px] text-[13px] text-gray-800 leading-relaxed">
                    💰{" "}
                    <span className="font-bold">Budget totale del gruppo</span>
                    <br />
                    Inserisci il{" "}
                    <span className="font-bold">budget massimo complessivo per</span>{" "}
                    il tuo viaggio.
                    <br />
                    <br />
                    <span className="font-bold">Minimo per pubblicare: 3.000 €</span>
                    <br />{" "}
                    <span className="font-bold pr-1">VacanzaMyCost</span>
                    seleziona solo richieste di alto profilo per garantire proposte
                    d'élite dalle migliori agenzie specializzate.{" "}
                    <br /> Con budget inferiori,{" "}
                    <span className="font-bold">
                      non è possibile garantire un servizio su misura di qualità.
                    </span>
                  </p>
                  <button
                    onClick={handleOkClick}
                    className="bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] cursor-pointer transition-colors text-white font-semibold py-1 px-4 rounded-lg text-[14px]"
                  >
                    {t("ok")}
                  </button>
                </div>
              </div>
            )}

            {/* Next button */}
            <button
              type="button"
              onClick={handleUiStep1Next}
              className="w-full py-2.5 cursor-pointer rounded-lg text-white font-bold text-[16px] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg, #DD9E2C, #C2851C)" }}
            >
              Next Step
            </button>
          </div>
        )}


        {uiStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-8 h-8 rounded-full border cursor-pointer border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft />
              </button>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Almost Done !
              </h2>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                FULL NAME
              </label>
              <input
                {...register("name", {
                  required: t("name_required") || "Name is required",
                })}
                type="text"
                placeholder={t("full_name") || "Full name"}
                defaultValue={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent text-sm transition-all duration-200"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
              )}
            </div>

            {/* Email + Phone row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                  EMAIL ADDRESS
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
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.email && (
                  <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                  PHONE NUMBER
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
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.phoneNumber && (
                  <span className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</span>
                )}
              </div>
            </div>

            {/* Hidden confirmation — auto-checked when user taps Send Request */}
            <input
              {...register("confirmation", {
                required: t("confirmation_required") || "You must confirm the request",
              })}
              type="hidden"
              value={formData.confirmation ? "true" : "false"}
            />

            {/* Send Request button */}
            <button
              type="button"
              onClick={async () => {
                // auto-set confirmation to true
                updateFormData("confirmation", true);
                setValue("confirmation", true);
                await handleUiStep2Next();
              }}
              className="w-full py-2.5 rounded-[7px] text-white cursor-pointer font-bold text-[16px] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg, #DD9E2C, #C2851C)" }}
            >
              Send Request
            </button>
          </div>
        )}
        {uiStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="w-8 h-8 rounded-full border cursor-pointer border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft />
              </button>
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Improve Your Offers{" "}
                <span style={{ color: "#DD9E2C" }}>✨</span>
              </h2>
            </div>

            {/* Trip Type */}
            <div>
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                TRIP TYPE
              </label>
              <div className="relative">
                <select
                  {...register("travelType")}
                  defaultValue={formData.travelType}
                  onChange={(e) => {
                    updateFormData("travelType", e.target.value);
                    setValue("travelType", e.target.value);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent text-sm appearance-none transition-all duration-200"
                >
                  <option value="">{t("select_travel_type") || "Select Travel Type"}</option>
                  <option value="family">{t("family_trip") || "Family Trip"}</option>
                  <option value="solo">{t("solo_travel") || "Solo Travel"}</option>
                  <option value="couple">{t("couple") || "Couple"}</option>
                  <option value="group">{t("group_travel") || "Group Travel"}</option>
                  <option value="business">{t("business_travel") || "Business Travel"}</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-800"><GoChevronDown />
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                    ACCOMMODATION PREFERENCES
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["hotel", "resort", "homestay", "apartment", "hostel"].map((opt) => (
                      <PillButton
                        key={opt}
                        label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                        active={formData.typeOfAccommodation === opt}
                        onClick={() => {
                          updateFormData("typeOfAccommodation", opt);
                          setValue("typeOfAccommodation", opt);
                        }}
                      />
                    ))}
                  </div>
                  {/* hidden register field */}
                  <input {...register("typeOfAccommodation")} type="hidden" value={formData.typeOfAccommodation} />
                </div>
                <div className="flex-shrink-0">
                  <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                    MINIMUM STAR
                  </label>
                  <StarRating
                    value={parseInt(formData.minimumHotelStars) || 0}
                    onChange={(s) => {
                      updateFormData("minimumHotelStars", s);
                      setValue("minimumHotelStars", s);
                    }}
                  />
                  <input {...register("minimumHotelStars")} type="hidden" value={formData.minimumHotelStars} />
                </div>
              </div>
            </div>

            {/* Meal Plan */}
            <div>
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                MEAL PLAN
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "none", label: "No meal" },
                  { value: "breakfast", label: "Breakfast" },
                  { value: "half-board", label: "Breakfast & Dinner" },
                  { value: "full-board", label: "All meal" },
                ].map((opt) => (
                  <PillButton
                    key={opt.value}
                    label={opt.label}
                    active={formData.mealPlan === opt.value}
                    onClick={() => {
                      updateFormData("mealPlan", opt.value);
                      setValue("mealPlan", opt.value);
                    }}
                  />
                ))}
              </div>
              <input {...register("mealPlan")} type="hidden" value={formData.mealPlan} />
            </div>

            {/* Destination Type (hidden — still preserved) */}
            <input
              {...register("destinationType")}
              type="hidden"
              value={formData.destinationType}
            />

            {/* Description (optional) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                DESCRIPTION <span className="normal-case font-normal">(OPTIONAL)</span>
              </label>
              <textarea
                {...register("description")}
                placeholder={t("description_placeholder") || "Write something..."}
                rows={3}
                defaultValue={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent resize-none text-sm transition-all duration-200"
              />
            </div>

            {/* Add Details button */}
            <button
              type="button"
              onClick={handleAddDetails}
              disabled={isSavingDraft || isPublishing}
              className="w-full py-2.5 rounded-md text-white font-bold text-[16px] cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(90deg, #DD9E2C, #C2851C)" }}
            >
              {isPublishing ? t("publishing") || "Publishing..." : "Add details"}
            </button>

            {/* Skip for now button */}
            <button
              type="button"
              onClick={handleSkipDetails}
              disabled={isSavingDraft || isPublishing}
              className="w-full py-2.5 rounded-md bg-white border border-gray-200 cursor-pointer text-gray-700 font-bold text-[16px] transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>

      {/* Slider thumb styling */}
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #DD9E2C;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #DD9E2C;
        }
        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #DD9E2C;
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #DD9E2C;
        }
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}