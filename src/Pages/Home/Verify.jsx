"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"

const SubscriptionSuccess = () => {
    const [showIcon, setShowIcon] = useState(false)
    const [showText, setShowText] = useState(false)

    useEffect(() => {
        // Start icon animation after component mounts
        const iconTimer = setTimeout(() => {
            setShowIcon(true)
        }, 300)

        // Show text after icon animation
        const textTimer = setTimeout(() => {
            setShowText(true)
        }, 1800)

        return () => {
            clearTimeout(iconTimer)
            clearTimeout(textTimer)
        }
    }, [])

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="text-center max-w-md mx-auto">
                {/* Animated Success Icon */}
                <div className="mb-8 flex justify-center">
                    <div
                        className={`relative transition-all duration-[2500ms] ease-out ${showIcon ? "scale-100 opacity-100" : "scale-0 opacity-0"
                            }`}
                    >
                        {/* Outer Circle with Pulse Animation */}
                        <div className="relative">
                            <div
                                className={`w-44 h-44 rounded-full border-4 flex items-center justify-center transition-all duration-[2500ms] ${showIcon ? "animate-pulse" : ""
                                    }`}
                                style={{ borderColor: "#EB5A8E" }}
                            >
                                {/* Inner Circle */}
                                <div
                                    className="w-36 h-36 rounded-full flex items-center justify-center relative overflow-hidden"
                                    style={{ backgroundColor: "#EB5A8E" }}
                                >
                                    {/* Checkmark Icon */}
                                    <svg
                                        className={`w-24 h-24 text-white transition-all duration-1000 delay-1000 ${showIcon ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                            className="animate-[draw_1s_ease-in-out_1.5s_forwards]"
                                            style={{
                                                strokeDasharray: "20",
                                                strokeDashoffset: showIcon ? "0" : "20",
                                                transition: "stroke-dashoffset 1s ease-in-out 1.5s",
                                            }}
                                        />
                                    </svg>
                                    {/* Ripple Effect */}
                                    <div
                                        className={`absolute inset-0 rounded-full transition-all duration-1000 ${showIcon ? "scale-150 opacity-0" : "scale-100 opacity-30"
                                            }`}
                                        style={{ backgroundColor: "#EB5A8E" }}
                                    ></div>
                                </div>
                            </div>

                            {/* Outer Glow Effect */}
                            <div
                                className={`absolute inset-0 rounded-full blur-xl transition-all duration-[2500ms] ${showIcon ? "scale-150 opacity-20" : "scale-100 opacity-0"
                                    }`}
                                style={{ backgroundColor: "#EB5A8E" }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Success Text */}
                <div
                    className={`transition-all duration-1000 ease-out ${showText ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                        }`}
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Success!</h1>
                    <p className="text-xl text-gray-600 mb-6">Your subscription has been</p>
                    <p className="text-2xl font-semibold text-gray-800 mb-8">Successfully Verified</p>

                    {/* Continue Button */}
                    <NavLink to="http://localhost:5173/dashboard/membership">
                        <div className="mt-8">
                            <button
                                className="px-8 py-3 text-white font-semibold rounded-full transition-all duration-200 transform hover:scale-105 cursor-pointer"
                                style={{
                                    backgroundColor: "#EB5A8E",
                                    boxShadow: "0 4px 15px rgba(235, 90, 142, 0.3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#D14A7C"
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#EB5A8E"
                                }}
                            >
                                Continue to Dashboard
                            </button>
                        </div>
                    </NavLink>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 rounded-full transition-all duration-[3000ms] ${showIcon ? "animate-float" : "opacity-0"
                                }`}
                            style={{
                                backgroundColor: "#EB5A8E",
                                left: `${20 + i * 15}%`,
                                top: `${30 + (i % 2) * 40}%`,
                                animationDelay: `${i * 0.5}s`,
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                0%,
                100% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-20px);
                }
                }
                .animate-float {
                animation: float 3s ease-in-out infinite;
                }
      `}</style>
        </div>
    )
}

export default SubscriptionSuccess