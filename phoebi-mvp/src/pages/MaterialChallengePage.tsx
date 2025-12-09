// src/pages/MaterialChallengePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

import ChallengePageBG from "../assets/ChallengePage_BG.png";
import MaterialChallengeHeader from "../assets/MaterialChallengeHeader.png";
import BridgeImg from "../assets/Bridge.png";

type DifficultyProps = {
  level: 1 | 2 | 3;
};

const DifficultyStars: React.FC<DifficultyProps> = ({ level }) => {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] md:text-xs font-medium text-[#21338F]">
        Difficulty
      </span>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={
            i < level
              ? "text-yellow-400 text-sm"
              : "text-slate-300 text-sm"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
};

export const MaterialChallengePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/"); // back to intro page
  };

  return (
    <div className="min-h-screen bg-[#FFF7C9] flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <img
        src={ChallengePageBG}
        alt=""
        className="pointer-events-none select-none absolute inset-0 -z-20 w-full h-full object-contain md:object-cover opacity-70"
      />
      {/* Bottom orange wave-ish blob */}
      <div className="pointer-events-none absolute inset-x-[-25%] bottom-[-45%] h-[70%] bg-[#F2A32F] rounded-[50%] -z-10" />

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

          {/* Material Challenge header image */}
          <img
            src={MaterialChallengeHeader}
            alt="Material Challenge"
            className="h-20 md:h-24 object-contain"
          />

          {/* Settings */}
          <button
            type="button"
            className="w-15 h-15 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-4xl"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-16 flex flex-col items-center">
          {/* Centered card */}
          <div className="w-full max-w-sm md:max-w-md rounded-[32px] bg-[#F2872F] text-white shadow-[0_22px_45px_rgba(0,0,0,0.28)] flex flex-col items-center pt-8 pb-8">
            <div className="w-full px-6">
              <div className="w-full aspect-square rounded-[26px] bg-[#FCEFE3] flex items-center justify-center overflow-hidden">
                <img
                  src={BridgeImg}
                  alt="Bridge challenge"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="mt-6 text-center font-extrabold text-xl md:text-2xl">
              Bridge ahoy!
            </div>

            <p className="mt-2 px-6 text-center text-xs md:text-sm leading-snug opacity-95">
              Build a bridge that can hold as many small objects as possible
            </p>

            {/* Difficulty + estimate pill */}
            <div className="mt-6 w-full px-6">
              <div
                className="
                  w-full rounded-full bg-white/95
                  px-4 py-1.5
                  flex items-center justify-between
                  text-[11px] md:text-xs
                  text-[#21338F]
                  shadow-[0_4px_10px_rgba(0,0,0,0.15)]
                "
              >
                <DifficultyStars level={1} />
                <span className="font-medium">
                  Estimate : 10–15 mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
