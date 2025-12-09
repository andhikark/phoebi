// src/pages/CreativeChallengePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

import ChallengePageBG from "../assets/ChallengePage_BG.png";
import CreativeChallengeHeader from "../assets/CreativeChallengeHeader.png";
import PlaneImg from "../assets/Plane.png";
import BicycleImg from "../assets/bicycle.png";
import ShipImg from "../assets/ship.png";

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
            i < level ? "text-yellow-400 text-sm" : "text-slate-300 text-sm"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
};

export const CreativeChallengePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/"); // back to intro page
  };

  const handleGoToDesign = () => {
    navigate("/design"); // bicycle card → design page
  };

  return (
    <div className="min-h-screen bg-[#FFF7C9] flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <img
        src={ChallengePageBG}
        alt=""
        className="pointer-events-none select-none absolute inset-0 -z-20 w-full h-full object-contain md:object-cover opacity-70"
      />
      {/* Orange ground ellipse */}
      <div className="pointer-events-none absolute -z-10 inset-x-[-20%] bottom-[-45%] h-[70%] bg-[#E1A349] rounded-[50%]" />

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

          {/* Creative Challenge header image */}
          <img
            src={CreativeChallengeHeader}
            alt="Creative Challenge"
            className="h-20 md:h-24 object-contain"
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
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-16 flex flex-col items-center">
          {/* Challenge cards row */}
          <section className="w-full flex flex-col lg:flex-row items-stretch justify-center gap-8 md:gap-10">
  {/* Plane card */}
  <div className="w-full max-w-sm lg:w-80 rounded-[32px] bg-[#21338F] text-white shadow-[0_20px_40px_rgba(0,0,0,0.25)] flex flex-col items-center pt-7 pb-7">
    <div className="w-full px-6">
      <div className="w-full aspect-square rounded-[24px] bg-[#FCEFE3] flex items-center justify-center overflow-hidden">
        <img
          src={PlaneImg}
          alt="Plane challenge"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
    <div className="mt-5 text-center font-extrabold text-xl md:text-2xl">
      King of the sky
    </div>
    <p className="mt-1 px-6 text-center text-xs md:text-sm opacity-90">
      “Make airplane that can fly for 5 minutes”
    </p>

    {/* ONE pill for plane */}
    <div className="mt-5 w-full px-6">
      <div
        className="
          w-full rounded-full bg-white/95
          px-4 py-1.5
          flex items-center justify-between
          text-[11px] md:text-xs
          text-[#21338F]
          shadow-[0_4px_10px_rgba(0,0,0,0.12)]
        "
      >
        <DifficultyStars level={1} />
        <span className="font-medium">Estimate : 15–20 mins</span>
      </div>
    </div>
  </div>

  {/* Bicycle card (clickable) */}
  <button
    type="button"
    onClick={handleGoToDesign}
    className="w-full max-w-sm lg:w-80 rounded-[32px] bg-[#F2872F] text-white shadow-[0_20px_40px_rgba(0,0,0,0.25)] flex flex-col items-center pt-7 pb-7 hover:translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.28)] transition-transform"
  >
    <div className="w-full px-6">
      <div className="w-full aspect-square rounded-[24px] bg-[#FCEFE3] flex items-center justify-center overflow-hidden">
        <img
          src={BicycleImg}
          alt="Bicycle challenge"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
    <div className="mt-5 text-center font-extrabold text-xl md:text-2xl">
      Dragon bone Cycle
    </div>
    <p className="mt-1 px-6 text-center text-xs md:text-sm opacity-90">
      “Make a bicycle that can carry a cat”
    </p>

    {/* ONE pill for bicycle */}
    <div className="mt-5 w-full px-6">
      <div
        className="
          w-full rounded-full bg-white/95
          px-4 py-1.5
          flex items-center justify-between
          text-[11px] md:text-xs
          text-[#21338F]
          shadow-[0_4px_10px_rgba(0,0,0,0.12)]
        "
      >
        <DifficultyStars level={3} />
        <span className="font-medium">Estimate : 20–30 mins</span>
      </div>
    </div>
  </button>

  {/* Ship card */}
  <div className="w-full max-w-sm lg:w-80 rounded-[32px] bg-[#6AA6D9] text-white shadow-[0_20px_40px_rgba(0,0,0,0.25)] flex flex-col items-center pt-7 pb-7">
    <div className="w-full px-6">
      <div className="w-full aspect-square rounded-[24px] bg-[#FCEFE3] flex items-center justify-center overflow-hidden">
        <img
          src={ShipImg}
          alt="Ship challenge"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
    <div className="mt-5 text-center font-extrabold text-xl md:text-2xl">
      Gone Fishin&apos;
    </div>
    <p className="mt-1 px-6 text-center text-xs md:text-sm opacity-90">
      “Make a boat that can carry 5 coins without sinking”
    </p>

    {/* ONE pill for ship */}
    <div className="mt-5 w-full px-6">
      <div
        className="
          w-full rounded-full bg-white/95
          px-4 py-1.5
          flex items-center justify-between
          text-[11px] md:text-xs
          text-[#21338F]
          shadow-[0_4px_10px_rgba(0,0,0,0.12)]
        "
      >
        <DifficultyStars level={2} />
        <span className="font-medium">Estimate : 15–20 mins</span>
      </div>
    </div>
  </div>
</section>


          {/* Refresh button */}
          <section className="mt-10 md:mt-12">
            <button
              type="button"
              className="
                flex items-center gap-3
                rounded-full
                bg-[#FACC3D]
                shadow-[0_18px_35px_rgba(0,0,0,0.25)]
                px-8 md:px-12 py-3 md:py-4
                text-white font-extrabold text-lg md:text-xl
              "
            >
              <span className="text-2xl">🔁</span>
              <span>Refresh Challenges</span>
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};
