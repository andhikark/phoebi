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
import { LearningSpace } from "./LearningSpace";

export const DesignPage: React.FC = () => {
  const navigate = useNavigate();
  const { design, score, setMaterial } = useDesign();

  const [activeTab, setActiveTab] = useState<'components' | 'materials'>('components');

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

  const onComponentClick = (componentId: ComponentId) => {
    setActiveComponent(componentId);
    console.log(componentId + "Has been click")
  }

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
        <div className="flex  flex-row gap-8">
          <button
            className="px-4 py-2 rounded-xl bg-[#4CBC93] text-white text-sm font-semibold hover:bg-[#3ba37b]"
            onClick={() => navigate("/summary")}
          >
            Create Blueprint
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-[#4CBC93] text-white text-sm font-semibold hover:bg-[#3ba37b]"
            onClick={() => navigate("/summary")}
          >
            AR mode
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 ">
        <div className="flex w-full h-screen bg-gray-100 gap-4 p-4">
          {/* Left Sidebar: Components & Materials (Fixed Width) */}
          <aside className="w-[300px] bg-[#EBEBE4] shadow-xl flex flex-col">
            {/* Tab Navigation */}
            <div className="flex bg-gray-200 gap-2">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'components'
                    ? 'bg-[#98B46C] text-white' // Olive green for active tab
                    : 'bg-[#C5C5BB] text-gray-700 hover:bg-[#B3B3AB]' // Lighter gray for inactive
                  }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'materials'
                    ? 'bg-[#98B46C] text-white'
                    : 'bg-[#C5C5BB] text-gray-700 hover:bg-[#B3B3AB]'
                  }`}
              >
                Materials
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* COMPONENTS Tab Content */}
              {activeTab === 'components' && (
                <div className="grid grid-cols-2 gap-3">
                  {COMPONENTS.map((comp) => {
                    const isActive = comp.id === activeComponent;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => onComponentClick(comp.id as ComponentId)}
                        // Styling based on the image: large square with a rounded-2xl border
                        className={`flex flex-col items-center p-2 h-28 rounded-2xl border transition-all duration-150 ${isActive
                            ? "ring-4 ring-[#F5C437] border-white shadow-lg bg-white" // Yellow/gold ring for active
                            : "bg-white border-gray-200 hover:shadow-md"
                          }`}
                      >
                        {/* Placeholder for the 3D Component Icon */}
                        <div
                          className="w-12 h-12 mb-1 rounded-lg"
                          // Mock colors based on your component list (for visual distinction)
                          style={{ backgroundColor: comp.id === 'frame' ? '#7A9A0F' : comp.id === 'wheel' ? '#B8B8B8' : comp.id === 'seat' ? '#F5C437' : '#5C6D9E' }}
                        />
                        <span className="text-xs font-medium text-gray-700">{comp.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="grid grid-cols-2 gap-3">
                  {allowedMaterials.map((mat) => {
                    const isSelected = mat.id === activeChoice.materialId;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setMaterial(activeComponent, mat.id as MaterialId)}
                        className={`flex flex-col items-center p-2 h-28 rounded-2xl border transition-all duration-150 ${isSelected
                            ? "ring-4 ring-[#4CBC93] border-white shadow-lg bg-white" 
                            : "bg-white border-gray-200 hover:shadow-md"
                          }`}
                      >
                        {/* Placeholder for the 3D Material Sphere Icon */}
                        <div
                          className="w-12 h-12 mb-1 rounded-full"
                          // Mock material colors (using generic colors as a placeholder for the 3D render)
                          style={{
                            backgroundColor: mat.id === 'wood' ? '#8B4513' :
                              mat.id === 'metal' ? '#A9A9A9' :
                                mat.id === 'plastic' ? '#5D99C5' :
                                  mat.id === 'recycled_plastic' ? '#4CBC93' : '#F5C437'
                          }}
                        />
                        <span className="text-xs font-medium text-gray-700 text-center">{mat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>


          {/* Main Area: 3D Model & Scores/Objectives */}
          <main className="flex-1 p-6 relative bg-[#D9D9C3] overflow-hidden">
            {/* Grid Lines Background (Mimicking the 3D grid) */}
            <div className="absolute inset-0 z-0 opacity-40 bg-repeat" style={{
              backgroundImage: `linear-gradient(to right, #C8C8BB 1px, transparent 1px), linear-gradient(to bottom, #C8C8BB 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>

            {/* Placeholder for the 3D Truck Model */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {/* Your Three.js canvas would render here. We use a placeholder for alignment. */}
              <LearningSpace activeComponentId={activeComponent}/>
            </div>


            {/* Scores (Sustainability, Recyclability, Durability) - Positioned Top Left of Main Area */}
            <div className="absolute top-8 left-8 z-20 space-y-3">
              {/* Score Card 1: Sustainability */}
              <div className="px-4 py-2 rounded-lg bg-white border-2 border-[#98B46C] shadow-md">
                <span className="text-sm font-semibold text-gray-700">Sustainability Score 5/10</span>
              </div>

              {/* Score Card 2: Recyclability */}
              <div className="px-4 py-2 rounded-lg bg-white border-2 border-[#98B46C] shadow-md">
                <span className="text-sm font-semibold text-gray-700">Recyclability 3/10</span>
              </div>

              {/* Score Card 3: Durability */}
              <div className="px-4 py-2 rounded-lg bg-white border-2 border-[#98B46C] shadow-md">
                <span className="text-sm font-semibold text-gray-700">Durability 8/10</span>
              </div>
            </div>

            {/* Objectives - Positioned Top Right of Main Area */}
            <div className="absolute top-8 right-8 z-20 p-4 rounded-lg bg-white shadow-xl">
              <h3 className="text-sm font-bold mb-2">Objectives</h3>
              <ul className="text-sm space-y-1">
                <li className="text-green-600">0/4 Wheels</li>
                <li className="text-yellow-600">0/2 Doors</li>
                <li className="text-red-600">0/2 Windows</li>
              </ul>
            </div>
          </main>
        </div>
      </main>
    </div>
  );
};
