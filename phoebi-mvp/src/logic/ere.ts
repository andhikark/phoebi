// src/logic/ere.ts
import type {
  DesignState,
  ScoreResult,
  ScorePerComponent,
  MaterialId,
  Material,
  ComponentId,
} from "../types/domain";
import { MATERIALS } from "../data/materials";
import { COMPONENTS } from "../data/components";

const materialMap: Record<MaterialId, Material> = MATERIALS.reduce(
  (acc, m) => {
    acc[m.id as MaterialId] = m;
    return acc;
  },
  {} as Record<MaterialId, Material>
);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * ERE-lite scoring (placed parts only):
 * - Only counts components that exist in `design`
 * - sustainabilityScore (0–10) comes from CO2 (lower CO2 => higher score)
 * - recyclabilityScore (0–10) is average recyclability of placed parts
 * - durabilityScore (0–10) is average durability of placed parts
 * - finalScore (0–100) is weighted combination of the three
 */
export function computeScore(design: Partial<DesignState>): ScoreResult {
  const perComponent: ScorePerComponent[] = [];

  let totalCo2 = 0;
  let recyclabilitySum = 0;
  let durabilitySum = 0;

  for (const comp of COMPONENTS) {
    const cid = comp.id as ComponentId;
    const choice = design[cid];

    // ✅ skip parts that are not placed
    if (!choice) continue;

    const mat = materialMap[choice.materialId as MaterialId];
    if (!mat) continue;

    // simple mass proxy (relative)
    const mass = comp.volumeFactor * mat.density;
    const co2 = mass * mat.co2PerKg;

    totalCo2 += co2;
    recyclabilitySum += mat.recyclability;
    durabilitySum += mat.durability;

    perComponent.push({
      componentId: comp.id,
      co2,
      recyclability: mat.recyclability,
      durability: mat.durability,
    });
  }

  const n = perComponent.length;

  // ✅ If no parts placed, show a “clean start” state
  if (n === 0) {
    return {
      totalCo2: 0,

      sustainabilityScore: 10,
      recyclabilityScore: 0,
      durabilityScore: 0,

      finalScore: 0,

      perComponent: [],
    };
  }

  const avgRecyclability = recyclabilitySum / n; // 0–10
  const avgDurability = durabilitySum / n; // 0–10

  // ✅ Scale maxCo2 with number of placed parts so score doesn’t instantly hit 0
  // Tune this constant to get nicer ranges.
  const maxCo2PerPart = 10; // typical “allowed” CO2 budget per part
  const maxCo2 = maxCo2PerPart * n;

  // sustainabilityScore: 0–10
  const sustainabilityScore = (1 - clamp(totalCo2 / maxCo2, 0, 1)) * 10;

  const recyclabilityScore = clamp(avgRecyclability, 0, 10);
  const durabilityScore = clamp(avgDurability, 0, 10);

  // finalScore: 0–100
  const finalScore01 =
    0.5 * (sustainabilityScore / 10) +
    0.3 * (recyclabilityScore / 10) +
    0.2 * (durabilityScore / 10);

  const finalScore = clamp(finalScore01, 0, 1) * 100;

  return {
    totalCo2,

    sustainabilityScore,
    recyclabilityScore,
    durabilityScore,

    finalScore,

    perComponent,
  };
}
