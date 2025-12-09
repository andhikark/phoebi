// src/pages/ChallengeIntroPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export const ChallengeIntroPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreativeClick = () => {
    navigate("/design");
  };

  return (
    <div className="min-h-screen bg-[#FFF7C9] flex flex-col relative">
      {/* Abstract background shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-40 w-[260px] h-[200px] bg-[#FCD9D0] rounded-[80px]" />
        <div className="absolute right-[-80px] top-36 w-[260px] h-[160px] bg-[#FBBF77] rounded-[80px]" />
        <div className="absolute right-[-40px] bottom-24 w-[260px] h-[200px] bg-[#F97373] rounded-[80px] opacity-70" />
        <div className="absolute left-[20%] bottom-16 w-[260px] h-[180px] bg-[#C4B5FD] rounded-[80px] opacity-80" />
      </div>

      {/* Top bar */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-10 py-4 md:py-5">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Logo placeholder */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F5C437] flex items-center justify-center">
                {/* Replace this with your logo image/icon */}
                <span className="text-2xl" role="img" aria-label="Phoebi logo">
                  🌞
                </span>
              </div>
              <span className="text-2xl md:text-3xl font-extrabold tracking-wide text-[#F2A900]">
                Phoebi
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Settings"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            {/* You can replace this with an actual icon component */}
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 md:py-12">
          {/* Challenge cards */}
          <section>
            <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 md:gap-10">
              {/* Creative Challenge */}
              <button
                type="button"
                onClick={handleCreativeClick}
                className="group w-full md:w-64 xl:w-72 rounded-[32px] bg-[#F1C423] shadow-[0_18px_40px_rgba(0,0,0,0.18)] flex flex-col items-center pt-6 pb-7 hover:translate-y-1 hover:shadow-[0_22px_45px_rgba(0,0,0,0.22)] transition-transform"
              >
                <div className="w-48 max-w-[80%] aspect-square rounded-[24px] bg-[#FFEFD8] flex items-center justify-center overflow-hidden">
                  {/* Placeholder for creative image */}
                  <span className="text-5xl" role="img" aria-label="Creative">
                    🎨
                  </span>
                  {/* Replace with <img src={...} alt="Creative challenge" className="w-full h-full object-cover" /> */}
                </div>
                <div className="mt-4 text-center text-white font-extrabold text-lg md:text-xl leading-tight tracking-wide">
                  Creative
                  <br />
                  Challenge
                </div>
              </button>

              {/* Material Challenge */}
              <div className="w-full md:w-64 xl:w-72 rounded-[32px] bg-[#4CBC93] shadow-[0_18px_40px_rgba(0,0,0,0.18)] flex flex-col items-center pt-6 pb-7 opacity-90">
                <div className="w-48 max-w-[80%] aspect-square rounded-[24px] bg-[#E3FFF2] flex items-center justify-center overflow-hidden">
                  {/* Placeholder for material image */}
                  <span className="text-5xl" role="img" aria-label="Material">
                    🧱
                  </span>
                  {/* Replace with <img src={...} alt="Material challenge" className="w-full h-full object-cover" /> */}
                </div>
                <div className="mt-4 text-center text-white font-extrabold text-lg md:text-xl leading-tight tracking-wide">
                  Material
                  <br />
                  Challenge
                </div>
              </div>

              {/* Story Challenge */}
              <div className="w-full md:w-64 xl:w-72 rounded-[32px] bg-[#5B4EE6] shadow-[0_18px_40px_rgba(0,0,0,0.18)] flex flex-col items-center pt-6 pb-7 opacity-90">
                <div className="w-48 max-w-[80%] aspect-square rounded-[24px] bg-[#EDE8FF] flex items-center justify-center overflow-hidden">
                  {/* Placeholder for story image */}
                  <span className="text-5xl" role="img" aria-label="Story">
                    📖
                  </span>
                  {/* Replace with <img src={...} alt="Story challenge" className="w-full h-full object-cover" /> */}
                </div>
                <div className="mt-4 text-center text-white font-extrabold text-lg md:text-xl leading-tight tracking-wide">
                  Story
                  <br />
                  Challenge
                </div>
              </div>
            </div>
          </section>

          {/* History */}
          <section className="mt-10 md:mt-12">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#D79B3A] mb-4">
              History
            </h2>

            <div className="rounded-[24px] bg-[#E0A84B] text-white px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              {/* Left: challenge title */}
              <div className="flex-1">
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  Model Bicycle
                </p>
              </div>

              {/* Middle: date */}
              <div className="flex items-center justify-start sm:justify-center sm:min-w-[140px]">
                <span className="text-sm sm:text-base md:text-lg">
                  11 Nov 2025
                </span>
              </div>

              {/* Right: score */}
              <div className="flex items-center justify-start sm:justify-end gap-2 sm:gap-3">
                <span className="text-sm sm:text-base">Score</span>
                <span className="font-bold text-lg sm:text-xl">9.2</span>
                {/* Medal placeholder */}
                <span className="text-2xl" role="img" aria-label="Medal">
                  🏅
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
