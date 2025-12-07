// src/pages/DesignPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDesign } from "../state/DesignContext";
import { COMPONENTS } from "../data/components";
import { MATERIALS } from "../data/materials";
import type {
    ComponentId,
    MaterialId,
    ScoreResult,
} from "../types/domain";
import { getHint } from "../logic/hints";

export const DesignPage: React.FC = () => {
  const navigate = useNavigate();
  const { design, score, setMaterial } = useDesign();

  const [activeComponent, setActiveComponent] =
    useState<ComponentId>("frame");
  const [prevScore, setPrevScore] = useState<ScoreResult | null>(null);
  const [hint, setHint] = useState<string | null>(
    "Try changing the materials and see what happens!"
  );

  useEffect(() => {
    const newHint = getHint(prevScore, score);
    if (newHint) setHint(newHint);
    setPrevScore(score);
  }, [score]);

  const activeCompDef = COMPONENTS.find(
    (c) => c.id === activeComponent
  )!;
  const activeChoice = design[activeComponent];
  const allowedMaterials = MATERIALS.filter((m) =>
    activeCompDef.allowedMaterials.includes(m.id as MaterialId)
  );

  const scoreColor =
    score.overallScore >= 80
      ? "text-green-600"
      : score.overallScore >= 50
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="min-h-screen bg-[#FFF7C9] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200"
          >
            ←
          </button>
          <span className="text-xl font-semibold text-[#F2A900]">
            Model Bicycle – Creative Challenge
          </span>
        </div>
        <button
          className="px-4 py-2 rounded-xl bg-[#4CBC93] text-white text-sm font-semibold hover:bg-[#3ba37b]"
          onClick={() => navigate("/summary")}
        >
          Finish &amp; See Summary
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: components */}
          <div>
            <h2 className="text-lg font-semibold text-[#D79B3A] mb-3">
              1. Choose a part
            </h2>
            <div className="flex flex-col gap-3">
              {COMPONENTS.map((comp) => {
                const isActive = comp.id === activeComponent;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() =>
                      setActiveComponent(comp.id as ComponentId)
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border ${
                      isActive
                        ? "bg-[#F5C437] border-[#E4B52F] text-white"
                        : "bg-white border-gray-200 text-gray-800"
                    } shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-xs opacity-70">
                      {design[comp.id].materialId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle: materials */}
          <div>
            <h2 className="text-lg font-semibold text-[#D79B3A] mb-3">
              2. Pick a material
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              You are editing:{" "}
              <span className="font-semibold">
                {activeCompDef.name}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {allowedMaterials.map((mat) => {
                const isSelected = mat.id === activeChoice.materialId;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() =>
                      setMaterial(activeComponent, mat.id as MaterialId)
                    }
                    className={`flex flex-col items-start px-4 py-3 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${
                      isSelected
                        ? "bg-[#4CBC93] text-white border-[#3ba37b]"
                        : "bg-white text-gray-800 border-gray-200"
                    }`}
                  >
                    <span className="font-semibold">{mat.name}</span>
                    <span className="text-xs mt-1 opacity-80">
                      CO₂: {mat.co2PerKg.toFixed(1)} kg/kg
                    </span>
                    <span className="text-xs opacity-80">
                      ♻ {mat.recyclability}/10 · 🛡 {mat.durability}/10
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: score + preview + hint */}
          <div>
            <h2 className="text-lg font-semibold text-[#D79B3A] mb-3">
              3. See your impact
            </h2>

            {/* Score card */}
            <div className="mb-4 rounded-3xl bg-white shadow-md px-5 py-4">
              <p className="text-sm text-gray-600 mb-1">
                Sustainability score
              </p>
              <p className={`text-4xl font-extrabold ${scoreColor}`}>
                {score.overallScore.toFixed(1)}
                <span className="text-lg text-gray-400"> / 100</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Lower CO₂ and higher recyclability/durability give a better
                score.
              </p>
            </div>

            {/* Tiny bike preview (very simple) */}
            <div className="mb-4 rounded-3xl bg-white shadow-md px-5 py-4">
              <p className="text-sm text-gray-600 mb-2">
                Your bike (concept sketch)
              </p>
              <div className="flex flex-col items-center">
                <div className="w-32 h-16 border-4 border-gray-400 rounded-3xl flex items-center justify-between px-2 mb-2">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-500" />
                  <div className="w-8 h-8 rounded-full border-4 border-gray-500" />
                </div>
                <div className="w-12 h-6 bg-gray-400 rounded-t-xl mb-1" />
                <div className="w-24 h-2 bg-gray-500 rounded-full" />
              </div>
            </div>

            {/* Hint bubble */}
            <div className="rounded-3xl bg-[#FFEFD0] px-4 py-3 shadow-sm flex gap-3">
              <div className="text-2xl">💡</div>
              <p className="text-sm text-gray-800">
                {hint || "Keep experimenting with materials!"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
