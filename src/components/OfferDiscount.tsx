"use client"

interface OfferDiscountFormProps {
  isOpen: boolean
  discountType: "price" | "percent"
  discountValue: string
  description: string
  onDiscountTypeChange: (value: "price" | "percent") => void
  onDiscountValueChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export default function OfferDiscountForm({
  isOpen,
  discountType,
  discountValue,
  description,
  onDiscountTypeChange,
  onDiscountValueChange,
  onDescriptionChange,
  onClose,
  onConfirm,
}: OfferDiscountFormProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={onClose} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h1 className="text-xl font-semibold text-center mb-6 text-gray-900">Offer Discount</h1>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Set Maximum Discount */}
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-4">Set Maximum Discount</h2>

              {/* Radio Group */}
              <div className="flex gap-6 mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    value="price"
                    checked={discountType === "price"}
                    onChange={(e) => onDiscountTypeChange(e.target.value as "price" | "percent")}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Price</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    value="percent"
                    checked={discountType === "percent"}
                    onChange={(e) => onDiscountTypeChange(e.target.value as "price" | "percent")}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Percent</span>
                </label>
              </div>

              {/* Discount Value Input */}
              <div>
                <input
                  type="text"
                  placeholder={discountType === "price" ? "Enter price" : "Enter percent"}
                  value={discountValue}
                  onChange={(e) => onDiscountValueChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-base font-medium text-gray-900 mb-4">Describe here</h2>
              <textarea
                placeholder="Enter here"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-6">
            <button
              onClick={onConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
