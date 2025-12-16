// src/logic/hints.ts
import type { ScoreResult } from "../types/domain";

export function getHint(
  prevScore: ScoreResult | null,
  newScore: ScoreResult
): string | null {
  if (!prevScore) {
    return "Try changing one material and watch the score react!";
  }

  const delta = newScore.finalScore - prevScore.finalScore;

  if (delta > 5) {
    return "Nice! Your bike just became more sustainable.";
  }

  if (delta < -5) {
    return "Your CO₂ footprint increased – can you swap one part to wood or cardboard?";
  }

  if (newScore.finalScore < 40) {
    return "Your score is quite low. Start by improving the frame – it uses the most material.";
  }

  if (newScore.finalScore > 80) {
    return "Awesome! You built a very green bike. Can you keep it this high while experimenting?";
  }

  return null;
}
