export type PopulationPoint = [number, number, number];

const populationTransitionMatrix: PopulationPoint[] = [
  [0.8, 0.15, 0.05],
  [0.15, 0.7, 0.15],
  [0.05, 0.15, 0.8],
];

export function clampPopulationValue(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.min(200, Math.max(0, parsed));
}

export function calculatePopulationHistory(startingVector: PopulationPoint): PopulationPoint[] {
  const history: PopulationPoint[] = [startingVector];

  for (let year = 1; year < 30; year += 1) {
    const current = history.at(-1) ?? startingVector;
    history.push(populationTransitionMatrix.map((row) => (
      row[0] * current[0] + row[1] * current[1] + row[2] * current[2]
    )) as PopulationPoint);
  }

  return history;
}
