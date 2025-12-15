// src/state/DesignContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type {
    ComponentId,
    DesignState,
    ScoreResult,
} from "../types/domain";
import { computeScore } from "../logic/ere";

const defaultDesign: DesignState = {
  frame: { materialId: "wood" },
  bicycle_wheel: { materialId: "plastic" },
  seat: { materialId: "cardboard" },
  handlebar: { materialId: "wood" },
  lego: {materialId: 'plastic'},
  battery: {materialId: 'recycled_aluminium'},
  car_wheel: {materialId: 'plastic'}
};

interface DesignContextValue {
  design: DesignState;
  score: ScoreResult;
  setMaterial: (componentId: ComponentId, materialId: string) => void;
}

const DesignContext = createContext<DesignContextValue | undefined>(undefined);

export const DesignProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [design, setDesign] = useState<DesignState>(defaultDesign);

  const score = useMemo(() => computeScore(design), [design]);

  const setMaterial = (componentId: ComponentId, materialId: string) => {
    setDesign((prev) => ({
      ...prev,
      [componentId]: { materialId },
    }));
  };

  return (
    <DesignContext.Provider value={{ design, score, setMaterial }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used within DesignProvider");
  return ctx;
};
