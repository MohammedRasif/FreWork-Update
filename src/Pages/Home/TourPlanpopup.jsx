import { useState } from "react";
import { X } from "lucide-react";
import { IoIosSend } from "react-icons/io";
import { useTranslation } from "react-i18next";

const TourPlanPopup = ({
  tour,
  onClose,
  handleMessage,
  handleAcceptOffer,
  isAcceptLoading,
  userData,
  tourPlanPublicUser,
  handleSubmitOffer,
  isOfferBudgetLoading,
}) => {
  const { t } = useTranslation();
  const [offerForm, setOfferForm] = useState({
    budget: "",
    comment: "",
    discount: "",
    applyDiscount: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isOfferSubmitting || isOfferBudgetLoading) return;

    setIsOfferSubmitting(true);

    try {
      await handleSubmitOffer(
        tour.id,
        offerForm.budget,
        offerForm.comment,
        offerForm,
        selectedFile
      );

      setOfferForm({
        budget: "",
        comment: "",
        discount: "",
        applyDiscount: false,
      });
      setSelectedFile(null);
      onClose();
    } catch {
    } finally {
      setIsOfferSubmitting(false);
    }
  };

  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243a]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="tour-offer-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-white/20 bg-white shadow-[0_28px_80px_rgba(8,24,42,0.35)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e9edf0] bg-white px-6 py-5 sm:px-8">
          <h2 id="tour-offer-title" className="text-xl font-bold text-[#172b43]">
            {t("send_offer")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#647386] transition-colors hover:bg-[#f1f5f7] hover:text-[#172b43]"
            aria-label={t("close")}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex-1 w-full">
            <h3 className="mb-5 text-lg font-bold text-[#24364b]">
              {t("place_your_offer")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="budget"
                  className="mb-2 block text-sm font-bold text-[#24364b]"
                >
                  {t("offer")}
                </label>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  value={offerForm.budget}
                  onChange={handleOfferChange}
                  placeholder={t("enter_budget_placeholder")}
                  required
                  className="min-h-12 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="mb-2 block text-sm font-bold text-[#24364b]"
                >
                  {t("message")}
                </label>
                <textarea
                  name="comment"
                  id="comment"
                  value={offerForm.comment}
                  onChange={handleOfferChange}
                  rows="4"
                  placeholder={t("enter_message_placeholder")}
                  required
                  className="w-full resize-none rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 py-3 focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="mb-2 block text-sm font-bold text-[#24364b]"
                >
                  {t("upload_file_optional")}
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="sr-only"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label htmlFor="file" className="flex min-h-12 cursor-pointer items-center rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-sm text-[#536477] hover:border-[#bd8525]">
                  <span className="truncate">{selectedFile ? selectedFile.name : t("choose_file")}</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="applyDiscount"
                    id="applyDiscount"
                    checked={offerForm.applyDiscount}
                    onChange={handleOfferChange}
                    className="h-4 w-4 rounded border-[#dce2e8] accent-[#c88f2a]"
                  />
                  <span className="ml-2 text-sm font-medium text-[#24364b]">
                    {t("apply_additional_discount")}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {t("discount_tip")}
                </p>
              </div>

              <div>
                <label
                  htmlFor="discount"
                  className="mb-2 block text-sm font-bold text-[#24364b]"
                >
                  {t("discount_percent")}
                </label>
                <input
                  type="number"
                  name="discount"
                  id="discount"
                  value={offerForm.discount}
                  onChange={handleOfferChange}
                  placeholder={t("discount_placeholder")}
                  className="min-h-12 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20 disabled:bg-[#f0f2f3]"
                  disabled={!offerForm.applyDiscount}
                />
              </div>

              <button
                type="submit"
                disabled={
                  isOfferSubmitting ||
                  isOfferBudgetLoading ||
                  !offerForm.budget ||
                  !offerForm.comment.trim()
                }
                className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white transition-colors ${
                  isOfferSubmitting ||
                  isOfferBudgetLoading ||
                  !offerForm.budget ||
                  !offerForm.comment.trim()
                    ? "cursor-not-allowed bg-[#d7dcdf] text-[#647386]"
                    : "bg-[#c88f2a] hover:bg-[#ad751c]"
                }`}
              >
                <IoIosSend size={20} />
                {isOfferSubmitting || isOfferBudgetLoading
                  ? t("submitting")
                  : t("submit_offer")}
              </button>
            </form>
          </div>

          {tour.offers && tour.offers.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-bold text-[#24364b]">
                {t("offers")}
              </h3>
              {tour.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col rounded-xl border border-[#e9edf0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                    <img
                      src={
                        offer.agency?.logo_url ||
                        "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                      }
                      alt={`${offer.agency?.agency_name || t("agency")} avatar`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        {offer.agency?.agency_name || t("unknown_agency")}
                      </span>
                      
                      {offer.file_name && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {t("file")}: {offer.file_name}
                        </p>
                      )}
                      {offer.apply_discount && offer.discount > 0 && (
                        <p className="text-xs sm:text-sm text-green-600">
                          {t("discount")}: {offer.discount}% {t("off")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex gap-2">
                      {tour.user === userData?.user_id && (
                        <button
                          onClick={() => handleAcceptOffer(offer.id, tour.id)}
                          disabled={isAcceptLoading}
                          className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                            isAcceptLoading
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-[#c88f2a] text-white hover:bg-[#ad751c]"
                          }`}
                        >
                          {t("accept")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourPlanPopup;
