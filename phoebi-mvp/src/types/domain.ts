// src/types/domain.ts

export type MaterialId =
  | "wood"
  | "cardboard"
  | "plastic"
  | "metal"
  | "recycled_plastic"
  | "fsc_rubberwood"
  | "bamboo_solid"
  | "bamboo_fibre_viscose"
  | "organic_cotton"
  | "natural_rubber_latex"
  | "tapioca_starch"
  | "guar_xanthan_gum"
  | "natural_food_colouring"
  | "recycled_cardboard"
  | "pla_sugarcane"
  | "recycled_abs"
  | "recycled_pp"
  | "recycled_hdpe"
  | "recycled_pet_fabrics"
  | "bio_pe"
  | "bio_pvc"
  | "recycled_pvc"
  | "recycled_aluminium"
  | "recycled_steel"
  | "li_ion_batteries"
  | "glass_marbles";

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

export type TransformMode = 'translate' | 'rotate' | 'scale';
