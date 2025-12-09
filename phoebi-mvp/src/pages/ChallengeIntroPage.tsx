// src/pages/ChallengeIntroPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

import PhoebiLogo from "../assets/Phoebi.png";
import CreativeImg from "../assets/Creative_Challenge.png";
import MaterialImg from "../assets/Material_Challenge.png";
import StoryImg from "../assets/Story_Challenge.png";
import ChallengePageBG from "../assets/ChallengePage_BG.png";

export const ChallengeIntroPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreativeClick = () => {
    navigate("/creative");
  };

  const handleStoryClick = () => {
  navigate("/story");
};
  return (
    <div className="min-h-screen bg-[#FFF7C9] flex flex-col relative overflow-hidden">
      {/* Background image layer */}
      <img
        src={ChallengePageBG}
        alt=""
        className="
      pointer-events-none select-none
      absolute inset-0 -z-10
      w-full h-full
      object-contain md:object-cover
      opacity-80
    "
      />

      {/* Top bar */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-10 py-4 md:py-5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center">
              <img
                src={PhoebiLogo}
                alt="Phoebi Logo"
                className="max-h-16 md:max-h-20 lg:max-h-24 w-auto object-contain drop-shadow"
              />
            </div>
          </div>

<button
  type="button"
  className="w-15 h-15 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-4xl"
  aria-label="Settings"
>
            <span className="text-4xl">⚙️</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16">
          {/* Challenge cards */}
          <section className="mt-4 md:mt-6">
            <div
              className="
                flex flex-col items-center
                gap-8 md:gap-10
                lg:flex-row lg:items-stretch lg:justify-center
              "
            >
              {/* Creative Challenge */}
              <button
                type="button"
                onClick={handleCreativeClick}
                className="
                  group
                  w-full max-w-sm
                  lg:w-80
                  rounded-[36px]
                  bg-[#F1C423]
                  shadow-[0_20px_40px_rgba(0,0,0,0.18)]
                  flex flex-col items-center
                  pt-8 pb-8
                  hover:translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)]
                  transition-transform
                "
              >
                <div className="w-full px-6">
                  <div
                    className="
                      w-full
                      aspect-square
                      rounded-[28px]
                      bg-[#FFEFD8]
                      flex items-center justify-center
                      overflow-hidden
                    "
                  >
                    <img
                      src={CreativeImg}
                      alt="Creative Challenge"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="mt-5 text-center text-white font-extrabold text-xl md:text-2xl leading-tight tracking-wide">
                  Creative
                  <br />
                  Challenge
                </div>
              </button>

              {/* Material Challenge */}
<button
  type="button"
  onClick={() => navigate("/material")}
  className="
    w-full max-w-sm
    lg:w-80
    rounded-[36px]
    bg-[#4CBC93]
    shadow-[0_20px_40px_rgba(0,0,0,0.18)]
    flex flex-col items-center
    pt-8 pb-8
    opacity-90
    transition-transform
    hover:translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.24)]
  "
>
  <div className="w-full px-6">
    <div className="w-full aspect-square rounded-[28px] bg-[#E3FFF2] flex items-center justify-center overflow-hidden">
      <img
        src={MaterialImg}
        alt="Material Challenge"
        className="w-full h-full object-contain"
      />
    </div>
  </div>
  <div className="mt-5 text-center text-white font-extrabold text-xl md:text-2xl leading-tight tracking-wide">
    Material
    <br />
    Challenge
  </div>
</button>


              {/* Story Challenge */}
<button
  type="button"
  onClick={handleStoryClick}
  className="
    w-full max-w-sm
    lg:w-80
    rounded-[36px]
    bg-[#5B4EE6]
    shadow-[0_20px_40px_rgba(0,0,0,0.18)]
    flex flex-col items-center
    pt-8 pb-8
    opacity-90
    hover:translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.24)]
    transition-transform
  "
>
                <div className="w-full px-6">
                  <div className="w-full aspect-square rounded-[28px] bg-[#EDE8FF] flex items-center justify-center overflow-hidden">
                    <img
                      src={StoryImg}
                      alt="Story Challenge"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="mt-5 text-center text-white font-extrabold text-xl md:text-2xl leading-tight tracking-wide">
                  Story
                  <br />
                  Challenge
                </div>
              </button>
            </div>
          </section>

          {/* History */}
          <section className="mt-12 md:mt-14">
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
