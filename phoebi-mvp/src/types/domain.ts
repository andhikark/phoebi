// src/types/domain.ts

export type MaterialId =
  | "wood"
  | "cardboard"
  | "plastic"
  | "metal"
  | "recycled_plastic";

export type ComponentId = "frame" | "wheel" | "seat" | "handlebar";

export interface Material {
  id: MaterialId;
  name: string;
  co2PerKg: number;
  recyclability: number; // 0–10
  durability: number; // 0–10
  density: number; // relative
}

export interface ComponentDef {
  id: ComponentId;
  name: string;
  volumeFactor: number;
  allowedMaterials: MaterialId[];
}

export interface ComponentChoice {
  materialId: MaterialId;
}

export type DesignState = Record<ComponentId, ComponentChoice>;

export interface ScorePerComponent {
  componentId: ComponentId;
  co2: number;
  recyclability: number;
  durability: number;
}

export interface ScoreResult {
  totalCo2: number;
  overallScore: number; // 0–100
  perComponent: ScorePerComponent[];
}
