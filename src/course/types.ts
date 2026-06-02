export type ExercisePart = {
  title: string;
  summary: string;
  tasks: string[];
  notes?: string[];
  solutionSteps?: string[];
  notebookFiles?: string[];
  examples?: {
    title: string;
    body: string;
    steps?: string[];
  }[];
};

export type SolutionPairDistance = {
  first: string;
  second: string;
  distance: number;
};

export type ExerciseSolution = {
  title: string;
  notebookPath: string;
  notebookRunUrl?: string;
  modelName: string;
  distanceMetric: string;
  dimensionality: number;
  distances: SolutionPairDistance[];
  closestPairs: SolutionPairDistance[];
  furthestPairs: SolutionPairDistance[];
  explanation: string[];
};

export type Exercise = {
  id: string;
  title: string;
  subtitle: string;
  deadline: string;
  aiPolicy: string;
  objective: string;
  parts: ExercisePart[];
  deliverables: string[];
  starterFiles: string[];
  chatLogGuidance: string[];
  solution?: ExerciseSolution;
};

export type CourseWeek = {
  weekNumber: number;
  slug: string;
  title: string;
  theme: string;
  status: 'ready' | 'planned';
  exercises: Exercise[];
};
