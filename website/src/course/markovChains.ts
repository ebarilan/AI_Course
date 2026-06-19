export type MarkovSnapshot = {
  time: number;
  values: number[];
};

export function buildReflectingTransitionMatrix(size: number): number[][] {
  return Array.from({ length: size }, (_, row) => (
    Array.from({ length: size }, (_, column) => {
      const isLeftEdge = column === 0;
      const isRightEdge = column === size - 1;

      if (isLeftEdge) {
        return row === 0 || row === 1 ? 0.5 : 0;
      }

      if (isRightEdge) {
        return row === size - 2 || row === size - 1 ? 0.5 : 0;
      }

      return row === column - 1 || row === column + 1 ? 0.5 : 0;
    })
  ));
}

function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

export function calculateReflectingWalkSnapshots(
  size = 100,
  times: number[] = [0, 50, 100, 500],
): MarkovSnapshot[] {
  const matrix = buildReflectingTransitionMatrix(size);
  const requestedTimes = [...times].sort((first, second) => first - second);
  const snapshots: MarkovSnapshot[] = [];
  let current = Array.from({ length: size }, () => 0);
  current[Math.floor((size - 1) / 2)] = 1;

  for (let time = 0; time <= requestedTimes.at(-1)!; time += 1) {
    if (requestedTimes.includes(time)) {
      snapshots.push({ time, values: [...current] });
    }

    if (time < requestedTimes.at(-1)!) {
      current = multiplyMatrixVector(matrix, current);
    }
  }

  return snapshots;
}
