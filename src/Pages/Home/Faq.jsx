"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const AnimatedFaq = () => {
  const { t, ready } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(-1)

  // Super safe way to get the FAQ array
  const faqDataRaw = t("faq", { returnObjects: true })
  const faqData = Array.isArray(faqDataRaw) ? faqDataRaw : []

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index)
  }

  // Show loading or empty state if translations not ready
  if (!ready || faqData.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center text-gray-500">
        Caricamento FAQ...
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="uppercase text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-10 py-8 tracking-wider"
      >
        {t("faq_title")}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="space-y-4 max-w-4xl mx-auto"
      >
        {faqData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              onClick={() => toggleItem(index)}
              className="px-6 py-5 flex justify-between items-center cursor-pointer select-none bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition"
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 pr-4">
                {item.question}
              </h3>
              <motion.div
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-600" />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default AnimatedFaq