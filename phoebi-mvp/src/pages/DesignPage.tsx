// src/pages/DesignPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDesign } from "../state/DesignContext";
import { COMPONENTS } from "../data/components";
import { MATERIALS } from "../data/materials";
import type {
  ComponentId,
  MaterialId,
  ScoreResult,
  TransformMode,
} from "../types/domain";
import { getHint } from "../logic/hints";
import {LearningSpace, type LearningSpaceHandle } from "./LearningSpace";
import translateIcon from '../assets/icons/translate.png';
import rotateIcon from '../assets/icons/rotate.png';
import scaleIcon from '../assets/icons/scale.png';
import deleteIcon from '../assets/icons/delete.png';
import { useDesignStore} from "../state/DesignStore";

export const DesignPage: React.FC = () => {
  const navigate = useNavigate();
  const { design, score, setMaterial } = useDesign();

  const [activeTab, setActiveTab] = useState<'components' | 'materials'>('components');
  const [sliderValue, setSliderValue] = useState(50);

  const [prevScore, setPrevScore] = useState<ScoreResult | null>(null);
  const [hint, setHint] = useState<string | null>(
    "Try changing the materials and see what happens!"
  );

  const { addObject, selectedObjectId, objects, deleteSelectedObject, setMaterialForSelected } = useDesignStore();

  const [transformMode , setTrasformMode] = useState<TransformMode>("translate");
  const learningSpaceRef = useRef<LearningSpaceHandle>(null);

  useEffect(() => {
    const newHint = getHint(prevScore, score);
    if (newHint) setHint(newHint);
    setPrevScore(score);
  }, [score]);

  

  const selectedObject = objects.find(obj => obj.uuid === selectedObjectId);
  const activeComponentId = selectedObject?.componentId;
  const activeCompDef = COMPONENTS.find(
    (c) => c.id === activeComponentId
  );
  // const activeChoice = design[selectedObj.componentId];
  const allowedMaterials = activeCompDef
    ? MATERIALS.filter((m) => activeCompDef.allowedMaterials.includes(m.id as MaterialId))
    : [];

  const scoreColor =
    score.overallScore >= 80
      ? "text-green-600"
      : score.overallScore >= 50
        ? "text-yellow-600"
        : "text-red-600";

  const onComponentClick = (componentId: ComponentId) => {
    addObject(componentId, 'wood');
    console.log("Added object : " + JSON.stringify(objects))
  }

  const onMaterialClick = (materialId: MaterialId) => {
    if (!selectedObject) return;
    setMaterial(selectedObject?.componentId, materialId); 
    setMaterialForSelected(materialId);
  }

  const handleDeleteClick = () => {
    learningSpaceRef.current?.deleteSelectedObject();
    deleteSelectedObject();
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
          <aside className="w-[300px] bg-[#EBEBE4] shadow-xl flex flex-col">
            <div className="flex bg-gray-200 gap-2">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'components'
                    ? 'bg-[#98B46C] text-white' 
                    : 'bg-[#C5C5BB] text-gray-700 hover:bg-[#B3B3AB]' 
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
                    const isActive = comp.id === activeComponentId;
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
                    const isSelected = mat.id === selectedObject?.materialId;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => onMaterialClick(mat.id)}
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
              <LearningSpace 
                transformMode={transformMode}
                ref={learningSpaceRef}
              />
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

            <div className="absolute bottom-16 left-8 z-20 space-y-3">
              {/* Score Card 1: Sustainability */}
              <div className="flex flex-row justify-between gap-3">
                <button
                onClick={() => setTrasformMode("translate")}
                className={`p-2 rounded-lg shadow-md transition-colors ${
                  transformMode === "translate"
                    ? "bg-[#4CBC93] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Translate (Move)"
              >
                <img src={translateIcon} alt="Translate" className="h-6 w-6" />
              </button>

              {/* Rotate Button */}
              <button
                onClick={() => setTrasformMode("rotate")}
                className={`p-2 rounded-lg shadow-md transition-colors ${
                  transformMode === "rotate"
                    ? "bg-[#4CBC93] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Rotate"
              >
                <img src={rotateIcon} alt="Translate" className="h-6 w-6" />
              </button>

              {/* Scale Button */}
              <button
                onClick={() => setTrasformMode("scale")}
                className={`p-2 rounded-lg shadow-md transition-colors ${
                  transformMode === "scale"
                    ? "bg-[#4CBC93] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Scale"
              >
                <img src={scaleIcon} alt="Translate" className="h-6 w-6" />
              </button>
              </div>
              
            </div>

            <div className="absolute top-8 right-8">
              <div>
                  <div className="flex flex-row gap-3 items-start">
                      <button
                        onClick={handleDeleteClick}
                        className={`z-20 p-2 bg-white rounded-lg shadow-md transition-colors ${
                          transformMode === "scale"
                            ? "bg-[#4CBC93] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-200"
                        }`}
                        title="Delete"
                      >
                        <img src={deleteIcon} alt="Delete" className="h-6 w-6" />
                      </button>
                    <div className="z-20 p-4 rounded-lg bg-white shadow-xl">
                      <h3 className="text-sm font-bold mb-2">Objectives</h3>
                      <ul className="text-sm space-y-1">
                        <li className="text-green-600">0/4 Wheels</li>
                        <li className="text-yellow-600">0/2 Doors</li>
                        <li className="text-red-600">0/2 Windows</li>
                      </ul>
                    </div>
                  </div>
                <div className="flex flex-col items-start space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      className="w-40 h-2 appearance-none bg-gray-300 rounded-full outline-none slider-vertical"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                    <span className="text-xs font-semibold text-gray-600">{50}</span>
                </div>
              </div>
            </div>
            
          </main>
        </div>
      </main>
    </div>
  );
};
