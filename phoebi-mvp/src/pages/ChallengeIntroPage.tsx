// src/pages/ChallengeIntroPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export const ChallengeIntroPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreativeClick = () => {
    navigate("/design");
  };

  return (
    <div className="min-h-screen bg-[#FFF7C9] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-300 flex items-center justify-center text-xl">
            🌞
          </div>
          <span className="text-2xl font-extrabold text-[#F2A900] tracking-wide">
            Phoebi
          </span>
        </div>
        <button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          type="button"
        >
          ⚙️
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-8 py-10">
        <section className="flex flex-col gap-8">
          {/* Challenge cards */}
          <div className="flex flex-wrap gap-8 justify-center">
            {/* Creative Challenge */}
            <button
              type="button"
              onClick={handleCreativeClick}
              className="w-64 h-80 rounded-3xl bg-[#F5C437] shadow-lg flex flex-col items-center justify-between pb-6 hover:translate-y-1 hover:shadow-xl transition-transform"
            >
              <div className="mt-6 w-48 h-48 rounded-2xl bg-[#FFEFD0] flex items-center justify-center text-5xl">
                🎨
              </div>
              <div className="text-white text-lg font-semibold text-center">
                Creative
                <br />
                Challenge
              </div>
            </button>

            {/* Material Challenge (static) */}
            <div className="w-64 h-80 rounded-3xl bg-[#4CBC93] shadow-lg flex flex-col items-center justify-between pb-6 opacity-70 cursor-not-allowed">
              <div className="mt-6 w-48 h-48 rounded-2xl bg-[#E3FFF2] flex items-center justify-center text-5xl">
                🧱
              </div>
              <div className="text-white text-lg font-semibold text-center">
                Material
                <br />
                Challenge
              </div>
              <p className="text-xs text-white/80 mb-1">Coming soon</p>
            </div>

            {/* Story Challenge (static) */}
            <div className="w-64 h-80 rounded-3xl bg-[#5B4EE6] shadow-lg flex flex-col items-center justify-between pb-6 opacity-70 cursor-not-allowed">
              <div className="mt-6 w-48 h-48 rounded-2xl bg-[#EDE8FF] flex items-center justify-center text-5xl">
                📖
              </div>
              <div className="text-white text-lg font-semibold text-center">
                Story
                <br />
                Challenge
              </div>
              <p className="text-xs text-white/80 mb-1">Coming soon</p>
            </div>
          </div>

          {/* History */}
          <section className="max-w-3xl mx-auto mt-8">
            <h2 className="text-xl font-semibold text-[#D79B3A] mb-3">
              History
            </h2>
            <div className="w-full rounded-3xl bg-[#E0A84B] text-white px-8 py-4 flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Model Bicycle</span>
                <span className="text-sm opacity-90">Creative Challenge</span>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-sm text-right">
                  <div>11 Nov 2025</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Score</span>
                  <span className="font-bold text-lg">9.2</span>
                  <span className="text-2xl">🏅</span>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};
