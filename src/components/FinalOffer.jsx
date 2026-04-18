export default function FinalOfferForm({
  isOpen,
  startingDate,
  endingDate,
  totalMembers,
  amount,
  onStartingDateChange,
  onEndingDateChange,
  onTotalMembersChange,
  onAmountChange,
  onBack,
  onReset,
  onConfirm,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xs" onClick={onBack} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-medium text-gray-600 mb-1">Offer Confirmation</h1>
            <h2 className="text-xl font-semibold text-gray-900">Tour from Dhaka to Chittagong</h2>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Date Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Starting Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Starting Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startingDate}
                    onChange={(e) => onStartingDateChange(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-[#DD9E2C] text-gray-500"
                    placeholder="Select date"
                  />
                 
                </div>
              </div>

              {/* Ending Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ending Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endingDate}
                    onChange={(e) => onEndingDateChange(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-[#DD9E2C] text-gray-500"
                    placeholder="Select date"
                  />
                  
                </div>
              </div>
            </div>

            {/* Input Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Member */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Member</label>
                <input
                  type="number"
                  placeholder="Enter here"
                  value={totalMembers}
                  onChange={(e) => onTotalMembersChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-[#DD9E2C]"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-[#DD9E2C]"
                />
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-8">
            <button
              onClick={onConfirm}
              className="w-full bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] cursor-pointer text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:ring-offset-2"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
