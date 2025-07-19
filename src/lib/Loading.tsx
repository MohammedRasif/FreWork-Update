"use client";

export default function FullScreenInfinityLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main infinity loader */}
      <div className="relative w-96 h-48 md:w-[600px] md:h-72 lg:w-[800px] lg:h-96">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Infinity track with glow */}
          <path
            d="M40 50 C40 30, 60 30, 70 50 C80 70, 120 70, 130 50 C140 30, 160 30, 160 50 C160 70, 140 70, 130 50 C120 30, 80 30, 70 50 C60 70, 40 70, 40 50 Z"
            stroke="url(#trackGradient)"
            strokeWidth="2"
            fill="none"
            className="drop-shadow-lg"
          />

          {/* Large animated particles */}
          <circle r="6" fill="url(#gradient1)" className="drop-shadow-lg">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path="M40 50 C40 30, 60 30, 70 50 C80 70, 120 70, 130 50 C140 30, 160 30, 160 50 C160 70, 140 70, 130 50 C120 30, 80 30, 70 50 C60 70, 40 70, 40 50"
            />
          </circle>

          <circle r="5" fill="url(#gradient2)" className="drop-shadow-lg">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              begin="1.3s"
              path="M40 50 C40 30, 60 30, 70 50 C80 70, 120 70, 130 50 C140 30, 160 30, 160 50 C160 70, 140 70, 130 50 C120 30, 80 30, 70 50 C60 70, 40 70, 40 50"
            />
          </circle>

          <circle r="5" fill="url(#gradient3)" className="drop-shadow-lg">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              begin="2.6s"
              path="M40 50 C40 30, 60 30, 70 50 C80 70, 120 70, 130 50 C140 30, 160 30, 160 50 C160 70, 140 70, 130 50 C120 30, 80 30, 70 50 C60 70, 40 70, 40 50"
            />
          </circle>

          {/* Smaller trailing particles */}
          <circle r="3" fill="rgba(255,255,255,0.8)" className="drop-shadow-md">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M40 50 C40 30, 60 30, 70 50 C80 70, 120 70, 130 50 C140 30, 160 30, 160 50 C160 70, 140 70, 130 50 C120 30, 80 30, 70 50 C60 70, 40 70, 40 50"
            />
          </circle>

          <circle r="2" fill="rgba(255,255,255,0.6)" className="drop-shadow-sm">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin="0.5s"
              path="M40 50 C40 30, 60 30, 70 50 C80 70, 120 70, 130 50 C140 30, 160 30, 160 50 C160 70, 140 70, 130 50 C120 30, 80 30, 70 50 C60 70, 40 70, 40 50"
            />
          </circle>

          <circle r="2" fill="rgba(255,255,255,0.6)" className="drop-shadow-sm">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin="1.5s"
              path="M40 50 C40 30, 60 30, 70 50 C80 70, 120 70, 130 50 C140 30, 160 30, 160 50 C160 70, 140 70, 130 50 C120 30, 80 30, 70 50 C60 70, 40 70, 40 50"
            />
          </circle>

          {/* Gradients */}
          <defs>
            <linearGradient
              id="trackGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.5)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.5)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
            </linearGradient>
            <radialGradient id="gradient1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <radialGradient id="gradient2">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6D28D9" />
            </radialGradient>
            <radialGradient id="gradient3">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#DB2777" />
              <stop offset="100%" stopColor="#BE185D" />
            </radialGradient>
          </defs>
        </svg>

        {/* Glowing center effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full opacity-20 animate-pulse blur-sm" />
        </div>
      </div>

      {/* Optional loading text */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="text-black text-xl font-light tracking-wider animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
}
