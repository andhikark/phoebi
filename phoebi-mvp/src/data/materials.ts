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
  {
    id: "fsc_rubberwood",
    name: "FSC Rubberwood (ไม้)",
    co2PerKg: 0.1, // Estimated carbon footprint from source
    recyclability: 8, // Highly recyclable (chipping, composting, reuse)
    durability: 7, // Good for wooden toys
    density: 0.64, // Typical density for rubberwood (g/cm³)
  },
  {
    id: "bamboo_solid",
    name: "Bamboo (Solid)",
    co2PerKg: 0.2, // Mid-range of 0.1-0.3 kg CO₂e/kg
    recyclability: 7, // Biodegradable, but complex processing can affect
    durability: 8, // Very good strength-to-weight ratio
    density: 0.70, // Typical density for solid engineered bamboo (g/cm³)
  },
  {
    id: "bamboo_fibre_viscose",
    name: "Bamboo Fibre (Viscose)",
    co2PerKg: 1.5, // Mid-range of 1-2 kg CO₂e/kg
    recyclability: 3, // Chemical process makes recycling difficult; often downcycled or landfilled
    durability: 5, // Moderate, used for soft parts/stuffing
    density: 1.50, // Density of cellulosic fibers (g/cm³)
  },
  {
    id: "organic_cotton",
    name: "Organic Cotton",
    co2PerKg: 1.0, // Estimated carbon footprint
    recyclability: 7, // Biodegradable, but recycling depends on dyes/blends
    durability: 6, // Good for fabric components
    density: 1.54, // Density of cellulose fiber (g/cm³)
  },
  {
    id: "natural_rubber_latex",
    name: "Natural Rubber / Latex",
    co2PerKg: 1.5, // Estimated carbon footprint
    recyclability: 4, // Recyclable, but complex process (e.g., devulcanization)
    durability: 8, // Excellent elasticity and resistance
    density: 0.93, // Density of cured natural rubber (g/cm³)
  },
  {
    id: "tapioca_starch",
    name: "Tapioca Starch",
    co2PerKg: 0.66, // Mid-range of 0.32-1.0 kg CO₂e/kg
    recyclability: 9, // Fully biodegradable
    durability: 2, // Low strength on its own; used as an additive/binder
    density: 1.50, // Density of starch powder (g/cm³)
  },
  {
    id: "guar_xanthan_gum",
    name: "Guar / Xanthan Gum",
    co2PerKg: 1.0, // Mid-range of 0.8-1.2 kg CO₂e/kg
    recyclability: 9, // Fully biodegradable
    durability: 3, // Used as a binder/thickener, not a structural material
    density: 1.50, // Density of powder/fiber (g/cm³)
  },
  {
    id: "natural_food_colouring",
    name: "Natural Food Colouring",
    co2PerKg: 2.0, // Mid-range of 1-3 kg CO₂e/kg
    recyclability: 8, // Plant-derived, fully biodegradable component
    durability: 5, // Pigment stability (fading) is the key durability concern
    density: 1.50, // Placeholder
  },
  {
    id: "recycled_cardboard",
    name: "Recycled Cardboard",
    co2PerKg: 1.1, // Mid-range of 0.7-1.5 kg CO₂e/kg
    recyclability: 9, // Highly recyclable (fiber recovery)
    durability: 3, // Low, primarily used for packaging/non-structural components
    density: 0.70, // Typical density of compressed paperboard (g/cm³)
  },
  {
    id: "pla_sugarcane",
    name: "PLA (Sugarcane-Based)",
    co2PerKg: 0.4, // Mid-range of 0.3-0.5 kg CO₂e/kg
    recyclability: 6, // Technically compostable, but requires industrial facility
    durability: 6, // Good for rigid parts, but can be brittle
    density: 1.25, // Typical density (g/cm³)
  },
  {
    id: "recycled_abs",
    name: "Recycled ABS (rABS)",
    co2PerKg: 0.6, // Estimated carbon footprint
    recyclability: 7, // Good mechanical recyclability
    durability: 8, // High impact resistance (durable toy material)
    density: 1.05, // Typical density (g/cm³)
  },
  {
    id: "recycled_pp",
    name: "Recycled PP (rPP)",
    co2PerKg: 0.85, // Mid-range of 0.7-1.0 kg CO₂e/kg
    recyclability: 8, // Good mechanical recyclability
    durability: 7, // Good flexibility and chemical resistance
    density: 0.91, // Typical density (g/cm³)
  },
  {
    id: "recycled_hdpe",
    name: "Recycled HDPE (rHDPE)",
    co2PerKg: 0.95, // Mid-range of 0.8-1.1 kg CO₂e/kg
    recyclability: 8, // Excellent mechanical recyclability
    durability: 7, // High resistance to impact and chemicals
    density: 0.95, // Typical density (g/cm³)
  },
  {
    id: "recycled_pet_fabrics",
    name: "Recycled PET (rPET Fabrics)",
    co2PerKg: 0.9, // Estimated carbon footprint
    recyclability: 7, // Good recyclability (bottle-to-fibre process)
    durability: 6, // Good for soft components/fibres
    density: 1.38, // Typical density (g/cm³)
  },
  {
    id: "bio_pe",
    name: "Bio-PE",
    co2PerKg: 0.5, // Mid-range of 0-1 kg CO₂e/kg
    recyclability: 8, // Same chemical structure as fossil PE, highly recyclable
    durability: 7, // High flexibility and chemical resistance
    density: 0.94, // Typical density (g/cm³)
  },
  {
    id: "bio_pvc",
    name: "Bio-PVC",
    co2PerKg: 3.5, // Mid-range of 3-4 kg CO₂e/kg
    recyclability: 5, // Recyclability varies based on plasticizers/additives
    durability: 6, // Good flexibility and resilience
    density: 1.35, // Typical density (g/cm³)
  },
  {
    id: "recycled_pvc",
    name: "Recycled PVC (rPVC)",
    co2PerKg: 2.5, // Mid-range of 2-3 kg CO₂e/kg
    recyclability: 6, // Good mechanical recyclability
    durability: 7, // Good for flexible/rigid parts
    density: 1.38, // Typical density (g/cm³)
  },
  {
    id: "recycled_aluminium",
    name: "Recycled Aluminium",
    co2PerKg: 2.4, // Mid-range of 1.8-3 kg CO₂e/kg
    recyclability: 10, // Infinitely recyclable
    durability: 9, // Excellent strength and corrosion resistance
    density: 2.70, // Typical density (g/cm³)
  },
  {
    id: "recycled_steel",
    name: "Recycled Steel",
    co2PerKg: 1.2, // Mid-range of 1-1.4 kg CO₂e/kg
    recyclability: 10, // Infinitely recyclable
    durability: 9, // Excellent strength and hardness
    density: 7.85, // Typical density (g/cm³)
  },
  {
    id: "li_ion_batteries",
    name: "Li-ion Battery Packs",
    co2PerKg: 14.0, // Mid-range of 8-20 kg CO₂e/kg
    recyclability: 5, // Specialized and complex recycling process
    durability: 9, // Components must be highly durable to function
    density: 2.50, // Placeholder for pack density (g/cm³)
  },
  {
    id: "glass_marbles",
    name: "Glass (Marbles)",
    co2PerKg: 0.55, // Mid-range of 0.3-0.8 kg CO₂e/kg
    recyclability: 9, // Highly recyclable in container glass stream
    durability: 8, // Very hard and scratch-resistant, but brittle (shatters)
    density: 2.50, // Typical density (g/cm³)
  },

];
