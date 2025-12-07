// src/data/materials.ts
// src/data/materials.ts
import type { Material } from "../types/domain";

export const MATERIALS: Material[] = [
  {
    id: "wood",
    name: "Wood",
    co2PerKg: 1.8,
    recyclability: 7,
    durability: 7,
    density: 0.6,
  },
  {
    id: "cardboard",
    name: "Cardboard",
    co2PerKg: 1.2,
    recyclability: 9,
    durability: 3,
    density: 0.2,
  },
  {
    id: "plastic",
    name: "Plastic",
    co2PerKg: 3.0,
    recyclability: 3,
    durability: 8,
    density: 0.9,
  },
  {
    id: "metal",
    name: "Metal",
    co2PerKg: 4.5,
    recyclability: 8,
    durability: 10,
    density: 7.5,
  },
  {
    id: "recycled_plastic",
    name: "Recycled Plastic",
    co2PerKg: 1.8,
    recyclability: 7,
    durability: 7,
    density: 0.9,
  },
];
