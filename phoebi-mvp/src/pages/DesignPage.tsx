// src/pages/DesignPage.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { COMPONENTS } from "../data/components";
import { MATERIALS } from "../data/materials";

import type {
  ComponentId,
  MaterialId,
  ScoreResult,
  TransformMode,
  DesignState,
} from "../types/domain";

import { computeScore } from "../logic/ere";
import { getHint } from "../logic/hints";

import { LearningSpace, type LearningSpaceHandle } from "./LearningSpace";

import translateIcon from "../assets/icons/translate.png";
import rotateIcon from "../assets/icons/rotate.png";
import scaleIcon from "../assets/icons/scale.png";
import deleteIcon from "../assets/icons/delete.png";
import glueIcon from "../assets/icons/glue.png";
import eraserIcon from "../assets/icons/eraser.png";
import hintIcon from "../assets/icons/hint.png";
import collisionOff from "../assets/icons/collision_off.png";
import collisionOn from "../assets/icons/collision_on.png";
import duplicateIcon from "../assets/icons/duplicate.png";

import { useDesignStore } from "../state/DesignStore";
import { preloadModels } from "../logic/loadmodel";
import { inputDispatcher } from "../logic/inputdispatcher";
import type { SceneItem, SceneObject } from "../state/DesignStore";

export const DesignPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"components" | "materials">(
    "components"
  );
  const [lightValue, setLightValue] = useState(50);
  const [showBlueprint, setShowBlueprint] = useState(false);

  const [prevScore, setPrevScore] = useState<ScoreResult | null>(null);
  const [hint, setHint] = useState<string | null>(
    "Try changing the materials and see what happens!"
  );

  const [collisionEnabled, setCollisionEnabled] = useState(true);

  const {
    addObject,
    selectedItemId,
    sceneItems,
    deleteSelectedItem,
    setMaterialForSelected,
  } = useDesignStore();

  const [transformMode, setTrasformMode] = useState<TransformMode>("translate");
  const learningSpaceRef = useRef<LearningSpaceHandle>(null);

  // -----------------------------
  // 1) Flatten scene (handles glued groups)
  // -----------------------------
  const flattenObjects = (items: SceneItem[]): SceneObject[] => {
    const out: SceneObject[] = [];
    for (const it of items) {
      if (it.type === "object") out.push(it);
      else if (it.type === "group" && Array.isArray(it.children)) {
        out.push(...flattenObjects(it.children));
      }
    }
    return out;
  };

  // -----------------------------
  // 2) Build design ONLY from placed objects (no phantom defaults)
  // -----------------------------
  const designFromScene = useMemo(() => {
    const d: Partial<DesignState> = {};

    const objects = flattenObjects(sceneItems);

    // Rule: for each componentId, last placed object wins
    for (const obj of objects) {
      d[obj.componentId] = { materialId: obj.materialId };
    }

    return d;
  }, [sceneItems]);

  // -----------------------------
  // 3) Score computed ONLY from placed parts
  //    (ere.ts must accept Partial<DesignState>)
  // -----------------------------
  const score = useMemo(() => computeScore(designFromScene), [designFromScene]);

  // -----------------------------
  // 4) Hint reacts to score changes
  // -----------------------------
  useEffect(() => {
    const newHint = getHint(prevScore, score);
    if (newHint) setHint(newHint);
    setPrevScore(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // -----------------------------
  // Preload models
  // -----------------------------
  useEffect(() => {
    preloadModels()
      .then(() => {
        console.log("All models pre-loaded successfully.");
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to preload models:", error);
        setIsLoading(false);
      });
  }, []);

  // -----------------------------
  // Keyboard / input dispatcher
  // -----------------------------
  useEffect(() => {
    const unsubscribe = inputDispatcher.subscribe((action) => {
      const store = useDesignStore.getState();
      const id = store.selectedItemId;          
      const api = learningSpaceRef.current;

      switch (action.type) {
        case "DELETE":
          api?.deleteSelectedObject();
          store.deleteSelectedItem();
          break;

        case "GLUE": {
          if (!id || !api) return;
          const other = api.findTouchingObjectUuid(id);
          if (other) api.glueObjects(id, other);
          break;
        }

        case "DEGLUE": {
          if (!id || !api) return;
          const item = store.sceneItems.find(i => i.uuid === id);
          if (item?.type === "group") api.deglueObject(id);
          break;
        }

        case "DUPLICATE":
          if (!id || !api) return;
          api.duplicateObject();
          break;
        case "MODE_TRANSLATE":
          setTrasformMode("translate");
          break;
        case "MODE_ROTATE":
          setTrasformMode("rotate");
          break;
        case "MODE_SCALE":
          setTrasformMode("scale");
          break;
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // Selection logic
  // -----------------------------
  const selectedItem = sceneItems.find((obj) => obj.uuid === selectedItemId);

  const activeComponentId =
    selectedItem?.type === "object" ? selectedItem.componentId : undefined;

  const activeCompDef = COMPONENTS.find((c) => c.id === activeComponentId);

  const allowedMaterials = activeCompDef
    ? MATERIALS.filter((m) =>
        activeCompDef.allowedMaterials.includes(m.id as MaterialId)
      )
    : [];

  // -----------------------------
  // Actions
  // -----------------------------
  const onComponentClick = (componentId: ComponentId) => {
    addObject(componentId, "wood");
  };

  const onMaterialClick = (materialId: MaterialId) => {
    if (!selectedItem || selectedItem.type !== "object") return;
    setMaterialForSelected(materialId);
  };

  const handleDeleteClick = () => {
    learningSpaceRef.current?.deleteSelectedObject();
    deleteSelectedItem();
  };

  const handleGlueClick = () => {
    if (!selectedItemId || !learningSpaceRef.current) return;

    const touchingObjectUuid =
      learningSpaceRef.current.findTouchingObjectUuid(selectedItemId);

    if (touchingObjectUuid) {
      learningSpaceRef.current.glueObjects(selectedItemId, touchingObjectUuid);
    } else {
      console.log("No object is touching the selected object.");
    }
  };

  const handleEraseClick = () => {
    if (!learningSpaceRef.current || !selectedItemId) return;

    const itemToDeglue = sceneItems.find((item) => item.uuid === selectedItemId);

    if (itemToDeglue?.type === "group") {
      learningSpaceRef.current.deglueObject(selectedItemId);
    } else {
      console.log("Selected item is not a group");
    }
  };

  const handleDuplicate = () => {
    if (!learningSpaceRef.current || !selectedItemId) return;
    learningSpaceRef.current.duplicateObject();
  };

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

        <div className="flex flex-row gap-8">
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
          {/* Sidebar */}
          <aside className="w-[300px] bg-[#EBEBE4] shadow-xl flex flex-col">
            <div className="flex bg-gray-200 gap-2">
              <button
                onClick={() => setActiveTab("components")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "components"
                    ? "bg-[#98B46C] text-white"
                    : "bg-[#C5C5BB] text-gray-700 hover:bg-[#B3B3AB]"
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab("materials")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "materials"
                    ? "bg-[#98B46C] text-white"
                    : "bg-[#C5C5BB] text-gray-700 hover:bg-[#B3B3AB]"
                }`}
              >
                Materials
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === "components" && (
                <div className="grid grid-cols-2 gap-3">
                  {COMPONENTS.map((comp) => {
                    const isActive = comp.id === activeComponentId;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => onComponentClick(comp.id as ComponentId)}
                        className={`flex flex-col items-center p-2 h-28 rounded-2xl border transition-all duration-150 ${
                          isActive
                            ? "ring-4 ring-[#F5C437] border-white shadow-lg bg-white"
                            : "bg-white border-gray-200 hover:shadow-md"
                        }`}
                      >
                        <img
                          src={comp.icon}
                          alt={comp.name}
                          className="w-12 h-12 mb-1 object-contain"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {comp.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === "materials" && (
                <div className="grid grid-cols-2 gap-3">
                  {allowedMaterials.map((mat) => {
                    const isSelected =
                      selectedItem?.type === "object" &&
                      mat.id === selectedItem.materialId;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => onMaterialClick(mat.id)}
                        className={`flex flex-col items-center p-2 h-28 rounded-2xl border transition-all duration-150 ${
                          isSelected
                            ? "ring-4 ring-[#4CBC93] border-white shadow-lg bg-white"
                            : "bg-white border-gray-200 hover:shadow-md"
                        }`}
                      >
                        <div className="w-12 h-12 mb-1 rounded-xl bg-gray-100 flex items-center justify-center">
                          <img
                            src={mat.icon}
                            alt={mat.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center">
                          {mat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 p-6 relative bg-[#D9D9C3] overflow-hidden">
            {/* Grid Lines Background */}
            <div
              className="absolute inset-0 z-0 opacity-40 bg-repeat"
              style={{
                backgroundImage: `linear-gradient(to right, #C8C8BB 1px, transparent 1px), linear-gradient(to bottom, #C8C8BB 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />

            {/* 3D canvas */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <LearningSpace
                collisionEnabled={collisionEnabled}
                transformMode={transformMode}
                showBlueprint={showBlueprint}
                lightIntensity={lightValue}
                ref={learningSpaceRef}
              />
            </div>

            {/* Scores (dynamic) */}
            <div className="absolute top-8 left-8 z-20 space-y-3">
              <div className="px-4 py-2 rounded-lg bg-white border-2 border-[#98B46C] shadow-md">
                <span className="text-sm font-semibold text-gray-700">
                  Sustainability Score {score.sustainabilityScore.toFixed(1)}/10
                </span>
              </div>

              <div className="px-4 py-2 rounded-lg bg-white border-2 border-[#98B46C] shadow-md">
                <span className="text-sm font-semibold text-gray-700">
                  Recyclability {score.recyclabilityScore.toFixed(1)}/10
                </span>
              </div>

              <div className="px-4 py-2 rounded-lg bg-white border-2 border-[#98B46C] shadow-md">
                <span className="text-sm font-semibold text-gray-700">
                  Durability {score.durabilityScore.toFixed(1)}/10
                </span>
              </div>

              <div className="px-4 py-2 rounded-lg bg-white border-2 border-[#98B46C] shadow-md">
                <span className="text-sm font-semibold text-gray-700">
                  Final Score {score.finalScore.toFixed(1)}/100
                </span>
              </div>

              {/* Hint bubble */}
              <div className="px-4 py-3 rounded-lg bg-[#FFEFD0] shadow-md max-w-[280px]">
                <div className="text-sm font-semibold text-gray-800">💡 Hint</div>
                <div className="text-sm text-gray-700 mt-1">
                  {hint || "Keep experimenting with materials!"}
                </div>
              </div>
            </div>

            {/* Bottom-left controls */}
            <div className="absolute bottom-16 left-8 z-20 space-y-3">
              <button
                onClick={() => setCollisionEnabled((v) => !v)}
                className={`p-2 rounded-lg shadow-md transition-colors ${
                  collisionEnabled ? "bg-[#ffba08]" : "bg-white"
                }`}
                title={collisionEnabled ? "Collision ON" : "Collision OFF"}
              >
                <img
                  src={collisionEnabled ? collisionOn : collisionOff}
                  className="h-6 w-6"
                />
              </button>

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

                <button
                  onClick={() => setTrasformMode("rotate")}
                  className={`p-2 rounded-lg shadow-md transition-colors ${
                    transformMode === "rotate"
                      ? "bg-[#4CBC93] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Rotate"
                >
                  <img src={rotateIcon} alt="Rotate" className="h-6 w-6" />
                </button>

                <button
                  onClick={() => setTrasformMode("scale")}
                  className={`p-2 rounded-lg shadow-md transition-colors ${
                    transformMode === "scale"
                      ? "bg-[#4CBC93] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Scale"
                >
                  <img src={scaleIcon} alt="Scale" className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Bottom-right hint icon */}
            <div className="absolute bottom-16 right-8 z-20 space-y-3">
              <button
                onClick={() => setShowBlueprint(!showBlueprint)}
                className={`p-2 rounded-lg shadow-md transition-colors ${
                  showBlueprint
                    ? "bg-[#4CBC93] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                title="Blueprint / Hint"
              >
                <img src={hintIcon} alt="Hint" className="h-6 w-6" />
              </button>
            </div>

            {/* Top-right tools + objectives */}
            <div className="absolute top-8 right-8">
              <div className="flex items-start gap-4">
                <button
                  onClick={handleDuplicate}
                  className="z-20 p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-200"
                  title="Duplication"
                >
                  <img src={duplicateIcon} alt="Duplicate" className="h-6 w-6" />
                </button>
                <button
                  onClick={handleEraseClick}
                  className="z-20 p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-200"
                  title="De-Glue"
                >
                  <img src={eraserIcon} alt="De-Glue" className="h-6 w-6" />
                </button>
                <button
                  onClick={handleGlueClick}
                  className="z-20 p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-200"
                  title="Glue"
                >
                  <img src={glueIcon} alt="Glue" className="h-6 w-6" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="z-20 p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-200"
                  title="Delete"
                >
                  <img src={deleteIcon} alt="Delete" className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center z-20">
                  <div className="p-4 rounded-lg bg-white shadow-xl w-48">
                    <h3 className="text-sm font-bold mb-2">Objectives</h3>
                    <ul className="text-sm space-y-1">
                      <li className="text-green-600">0/4 Wheels</li>
                      <li className="text-yellow-600">0/2 Doors</li>
                      <li className="text-red-600">0/2 Windows</li>
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-col items-center justify-center ">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={lightValue}
                      onChange={(e) => setLightValue(Number(e.target.value))}
                      className="w-40 h-2 appearance-none bg-gray-300 rounded-full outline-none"
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "center right",
                        accentColor: "#16A34A",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optional loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-30 bg-black/30 flex items-center justify-center">
                <div className="bg-white rounded-xl px-5 py-3 shadow-lg text-sm font-semibold">
                  Loading models…
                </div>
              </div>
            )}
          </main>
        </div>
      </main>
    </div>
  );
};
