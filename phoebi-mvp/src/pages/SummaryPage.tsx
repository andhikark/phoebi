// src/pages/SummaryPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDesign } from "../state/DesignContext";
import { COMPONENTS } from "../data/components";
import { MATERIALS } from "../data/materials";
import type { MaterialId } from "../types/domain";

export const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { design, score } = useDesign();

  const materialMap = Object.fromEntries(
    MATERIALS.map((m) => [m.id, m])
  ) as Record<MaterialId, (typeof MATERIALS)[number]>;

  return (
    <div className="min-h-screen bg-[#FFF7C9] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/design")}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200"
          >
            ←
          </button>
          <span className="text-xl font-semibold text-[#F2A900]">
            Summary – Model Bicycle
          </span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-xl bg-[#F5C437] text-white text-sm font-semibold hover:bg-[#e3b32f]"
        >
          Back to Challenges
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto">
        <section className="mb-6 rounded-3xl bg-white shadow-md px-6 py-5">
          <p className="text-sm text-gray-600">Overall score</p>
          <p className="text-4xl font-extrabold text-[#4CBC93]">
            {score.finalScore.toFixed(1)}
            <span className="text-lg text-gray-400"> / 100</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Estimated total CO₂ impact:{" "}
            <span className="font-semibold">
              {score.totalCo2.toFixed(2)} kg
            </span>
          </p>
        </section>

        <section className="rounded-3xl bg-white shadow-md px-6 py-5">
          <h2 className="text-lg font-semibold text-[#D79B3A] mb-3">
            Per-component breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 pr-4">Component</th>
                  <th className="py-2 pr-4">Material</th>
                  <th className="py-2 pr-4">CO₂ (kg)</th>
                  <th className="py-2 pr-4">Recyclability</th>
                  <th className="py-2 pr-4">Durability</th>
                </tr>
              </thead>
              <tbody>
                {score.perComponent.map((pc) => {
                  const matId = design[pc.componentId].materialId;
                  const mat = materialMap[matId];
                  const compName =
                    COMPONENTS.find((c) => c.id === pc.componentId)
                      ?.name || pc.componentId;

                  return (
                    <tr
                      key={pc.componentId}
                      className="border-b border-gray-100"
                    >
                      <td className="py-2 pr-4">{compName}</td>
                      <td className="py-2 pr-4">{mat.name}</td>
                      <td className="py-2 pr-4">
                        {pc.co2.toFixed(3)}
                      </td>
                      <td className="py-2 pr-4">
                        ♻ {pc.recyclability}/10
                      </td>
                      <td className="py-2 pr-4">
                        🛡 {pc.durability}/10
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Tip: In your pitch, you can say which part contributes most
            to CO₂ and how kids could experiment with alternative
            materials.
          </p>
        </section>
      </main>
    </div>
  );
};
