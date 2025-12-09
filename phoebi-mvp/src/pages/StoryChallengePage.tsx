// src/pages/StoryChallengePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import StoryHeader from "../assets/StoryChallengeHeader.png";
import StoryBg from "../assets/StoryChallengeBackground.png";

type Step = {
  id: number;
  // positions in percentage relative to the image container
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

const steps: Step[] = [
  { id: 1, bottom: "14%", left: "12%" }, // bottom-left
  { id: 2, bottom: "6%", left: "35%" },  // bottom middle-ish
  { id: 3, top: "40%", left: "50%" },    // center (sun)
  { id: 4, top: "15%", right: "23%" },   // top-right plate
  { id: 5, top: "32%", right: "10%" },   // coin on the right
];

export const StoryChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const handleBack = () => {
    navigate("/"); // back to intro page
  };

  const handleStepClick = (id: number) => {
    setActiveStep(id);
    // you can also trigger something else here (modal, audio, etc.)
    console.log("Clicked step", id);
  };

  return (
    <div className="min-h-screen bg-[#BFE5FF] flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
          {/* Back arrow */}
          <button
            type="button"
            onClick={handleBack}
            className="w-20 h-20 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-4xl"
            aria-label="Back to challenges"
          >
            ‹
          </button>

          {/* Story Challenge header image */}
          <img
            src={StoryHeader}
            alt="Story Challenge"
            className="h-10 md:h-14 object-contain"
          />

          {/* Settings */}
          <button
            type="button"
            className="w-15 h-15 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-4xl"
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-2 md:px-6 py-6 md:py-10 flex flex-col items-center gap-4">
          {/* Background scene with interactive steps */}
          <div className="relative w-full max-w-5xl aspect-[16/9] md:aspect-[16/8] rounded-[24px] overflow-hidden shadow-[0_22px_45px_rgba(0,0,0,0.25)] bg-[#9dd5ff]">
            {/* Background image */}
            <img
              src={StoryBg}
              alt="Story scene"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Numbered buttons */}
            {steps.map((step) => {
              const isActive = activeStep === step.id;
              const baseCircleClasses =
                "flex items-center justify-center rounded-full font-bold";

              // step 5 (coin) is yellow, others white
              const bgClasses =
                step.id === 5
                  ? "bg-[#FFC63A] text-[#21407F]"
                  : "bg-white text-[#21407F]";

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={`
                    ${baseCircleClasses}
                    ${bgClasses}
                    absolute
                    w-14 h-14 md:w-16 md:h-16
                    shadow-[0_6px_14px_rgba(0,0,0,0.25)]
                    transition-transform transition-shadow
                    ${isActive ? "scale-110 ring-4 ring-yellow-300" : "scale-100"}
                  `}
                  style={{
                    top: step.top,
                    left: step.left,
                    right: step.right,
                    bottom: step.bottom,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span className="text-lg md:text-xl">{step.id}</span>
                </button>
              );
            })}
          </div>

          {/* Current selection info (you can replace this with real story text later) */}
          <div className="mt-2 md:mt-4 text-center">
            {activeStep === null ? (
              <p className="text-sm md:text-base text-[#21407F] opacity-80">
                Tap a number to start your story!
              </p>
            ) : (
              <p className="text-sm md:text-base text-[#21407F] font-semibold">
                Current step: <span className="font-bold">#{activeStep}</span>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
