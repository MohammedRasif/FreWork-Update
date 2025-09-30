import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaListUl } from "react-icons/fa";
import { MapPin, Navigation, Utensils, BedDouble, Clock4, ShieldCheck, X } from "lucide-react";
import { MdOutlineNoMeals, MdVerifiedUser } from "react-icons/md";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";

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
  const [offerForm, setOfferForm] = useState({
    budget: "",
    comment: "",
    discount: "",
    applyDiscount: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsOfferSubmitting(true);
    await handleSubmitOffer(tour.id, offerForm.budget, offerForm.comment, offerForm, selectedFile);
    setIsOfferSubmitting(false);
    setOfferForm({ budget: "", comment: "", discount: "", applyDiscount: false });
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Send Offer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Place Your Offer</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="budget"
                  className="block text-md font-medium text-gray-700 mb-1"
                >
                  Offer
                </label>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  value={offerForm.budget}
                  onChange={handleOfferChange}
                  placeholder="Enter your budget (e.g., 6000)"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-md font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  name="comment"
                  id="comment"
                  value={offerForm.comment}
                  onChange={handleOfferChange}
                  rows="4"
                  placeholder="Enter your message"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="block text-md font-medium text-gray-700 mb-1"
                >
                  Upload File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  accept="image/*,.pdf,.doc,.docx"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="applyDiscount"
                    id="applyDiscount"
                    checked={offerForm.applyDiscount}
                    onChange={handleOfferChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-md text-gray-700">
                    Apply an additional discount
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Website suggests extra discount, increases conversions by 30%. Check to offer more.
                </p>
              </div>

              <div>
                <label
                  htmlFor="discount"
                  className="block text-md font-medium text-gray-700 mb-1"
                >
                  Discount
                </label>
                <input
                  type="number"
                  name="discount"
                  id="discount"
                  value={offerForm.discount}
                  onChange={handleOfferChange}
                  placeholder="Enter discount percentage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={!offerForm.applyDiscount}
                />
              </div>

              <button
                type="submit"
                disabled={
                  isOfferSubmitting ||
                  isOfferBudgetLoading ||
                  !offerForm.budget ||
                  !offerForm.comment.trim() ||
                  !selectedFile
                }
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                  isOfferSubmitting ||
                  isOfferBudgetLoading ||
                  !offerForm.budget ||
                  !offerForm.comment.trim() ||
                  !selectedFile
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                }`}
              >
                <IoIosSend size={20} />
                {isOfferSubmitting || isOfferBudgetLoading ? "Submitting..." : "Submit Offer"}
              </button>
            </form>
          </div>

          {tour.offers && tour.offers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Offers</h3>
              {tour.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-3 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                    <img
                      src={
                        offer.agency?.logo_url ||
                        "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                      }
                      alt={`${offer.agency?.agency_name || "Unknown Agency"} avatar`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        {offer.agency?.agency_name || "Unknown Agency"}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {offer.message}
                      </p>
                      {offer.file_name && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          File: {offer.file_name}
                        </p>
                      )}
                      {offer.apply_discount && offer.discount > 0 && (
                        <p className="text-xs sm:text-sm text-green-600">
                          Discount: {offer.discount}% off
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-semibold text-lg sm:text-xl">
                      💰 ${offer.offered_budget || "N/A"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMessage({ other_user_id: offer.agency?.user })}
                        disabled={
                          isOfferBudgetLoading ||
                          isAcceptLoading ||
                          !offer.agency?.user
                        }
                        className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                          isOfferBudgetLoading ||
                          isAcceptLoading ||
                          !offer.agency?.user
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#3776E2] text-white hover:bg-blue-700 hover:cursor-pointer"
                        }`}
                      >
                        Message
                      </button>
                      {tour.user === userData?.user_id && (
                        <button
                          onClick={() => handleAcceptOffer(offer.id, tour.id)}
                          disabled={isAcceptLoading}
                          className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                            isAcceptLoading
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-[#3776E2] text-white hover:bg-blue-700"
                          }`}
                        >
                          Accept
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