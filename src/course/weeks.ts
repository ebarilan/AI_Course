import type { CourseWeek } from './types';
import { linearAlgebraExercise } from './weeks/week-1/linear-algebra';

export const courseWeeks: CourseWeek[] = [
  {
    weekNumber: 1,
    slug: 'week-1',
    title: 'Linear Algebra Launchpad',
    theme: 'Vectors, matrices, embeddings, and just enough coffee.',
    status: 'ready',
    exercises: [linearAlgebraExercise],
  },
  {
    weekNumber: 2,
    slug: 'week-2',
    title: 'Coming Soon',
    theme: 'A fresh set of AI puzzles will land here after the next class.',
    status: 'planned',
    exercises: [],
  },
];
