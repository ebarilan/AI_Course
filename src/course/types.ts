export type ExercisePart = {
  title: string;
  summary: string;
  tasks: string[];
  notes?: string[];
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
};

export type CourseWeek = {
  weekNumber: number;
  slug: string;
  title: string;
  theme: string;
  status: 'ready' | 'planned';
  exercises: Exercise[];
};
