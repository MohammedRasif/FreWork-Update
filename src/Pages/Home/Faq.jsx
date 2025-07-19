"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const AnimatedFaq = () => {
  const [activeIndex, setActiveIndex] = useState(0) // Default first item open

  const faqData = [
    {
      question: "How does the AI-powered project setup work?",
      answer:
        "Absolutely, we implement enterprise-grade security measures including end-to-end encryption, regular security audits, and compliance with GDPR, HIPAA, and other regulations. Your data is stored in SOC 2 compliant data centers.",
    },
    {
      question: "Can I integrate with other tools we already use?",
      answer:
        "Yes, our platform supports integrations with a wide range of tools, including Slack, Trello, and Google Workspace, ensuring seamless workflow management.",
    },
    {
      question: "How long does it take to set up?",
      answer:
        "Setup typically takes less than 15 minutes with our AI-powered onboarding process, guiding you step-by-step.",
    },
    {
      question: "Can I customize the platform for my industry?",
      answer:
        "Absolutely, our platform offers industry-specific templates and customization options to fit your needs.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide 24/7 customer support via chat, email, and phone, along with a dedicated account manager for premium users.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial with full access to all features, no credit card required.",
    },
    {
      question: "How often do you release updates?",
      answer: "We release updates quarterly, with regular bug fixes and new features based on user feedback.",
    },
  ]

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const answerVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  }

  const chevronVariants = {
    closed: {
      rotate: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    open: {
      rotate: 180,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  }

  return (
    <div className="container mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="uppercase text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 sm:mb-10 py-6 sm:py-8 tracking-wider"
      >
        FREQUENTLY ASKED QUESTIONS
      </motion.h1>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3 sm:space-y-4">
        {faqData.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              onClick={() => toggleItem(index)}
              className="py-3 sm:py-4 px-4 sm:px-6 text-gray-800 text-base sm:text-lg font-semibold flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-300"
              whileHover={{ backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{item.question}</span>
              <motion.div
                variants={chevronVariants}
                animate={activeIndex === index ? "open" : "closed"}
                className="w-5 h-5 flex-shrink-0"
              >
                <ChevronDown />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  variants={answerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="overflow-hidden"
                >
                  <motion.div
                    className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 text-sm sm:text-base border-t border-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <p>{item.answer}</p>
                  </motion.div>
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
