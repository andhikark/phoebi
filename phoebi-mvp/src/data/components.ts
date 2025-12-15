// src/data/components.ts
// src/data/components.ts
import type { ComponentDef } from "../types/domain";

export const COMPONENTS: ComponentDef[] = [
  {
    id: "frame",
    name: "Frame",
    volumeFactor: 3,
    allowedMaterials: ["wood", "cardboard", "plastic", "metal", "recycled_plastic"],
  },
  {
    id: "bicycle_wheel",
    name: "Wheels",
    volumeFactor: 2,
    allowedMaterials: ["plastic", "metal", "recycled_plastic"],
  },
  {
    id: "seat",
    name: "Seat",
    volumeFactor: 1,
    allowedMaterials: ["wood", "cardboard", "plastic", "recycled_plastic"],
  },
  {
    id: "handlebar",
    name: "Handlebar",
    volumeFactor: 1,
    allowedMaterials: ["wood", "plastic", "metal", "recycled_plastic"],
  },
  {
    id: "lego",
    name: "Lego",
    volumeFactor: 1,
    allowedMaterials: ["plastic"],
  },
  {
    id: "car_wheel",
    name: "Car wheel",
    volumeFactor: 1,
    allowedMaterials: ["plastic"],
  },
];
