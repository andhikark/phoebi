// src/logic/ere.ts
// src/logic/ere.ts
import type {
    DesignState,
    ScoreResult,
    ScorePerComponent,
    MaterialId,
    ComponentId,
    Material,
} from "../types/domain";
import { MATERIALS } from "../data/materials";
import { COMPONENTS } from "../data/components";

const materialMap: Record<MaterialId, Material> = MATERIALS.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<MaterialId, Material>
);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function computeScore(design: DesignState): ScoreResult {
  const perComponent: ScorePerComponent[] = [];

  let totalCo2 = 0;
  let recyclabilitySum = 0;
  let durabilitySum = 0;

  for (const comp of COMPONENTS) {
    const choice = design[comp.id as ComponentId];
    const mat = materialMap[choice.materialId];

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

  const n = COMPONENTS.length;
  const avgRecyclability = recyclabilitySum / n;
  const avgDurability = durabilitySum / n;

  const maxCo2 = 50; // assumed upper bound
  const co2Score = 1 - clamp(totalCo2 / maxCo2, 0, 1);
  const recyclabilityScore = avgRecyclability / 10;
  const durabilityScore = avgDurability / 10;

  const overallScore01 =
    0.5 * co2Score + 0.3 * recyclabilityScore + 0.2 * durabilityScore;

  return {
    totalCo2,
    overallScore: overallScore01 * 100,
    perComponent,
  };
}
