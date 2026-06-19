import type { CourseWeek } from './types.js';
import { linearAlgebraExercise } from './weeks/week-1/linear-algebra.js';
import { populationDynamicsExercise } from './weeks/week-2/population-dynamics.js';
import { markovChainsExercise } from './weeks/week-3/markov-chains.js';

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
    title: 'Population Dynamics',
    theme: 'Matrix transitions, eigenvectors, and the long-term story of a lake.',
    status: 'ready',
    exercises: [populationDynamicsExercise],
  },
  {
    weekNumber: 3,
    slug: 'week-3',
    title: 'Markov Chains',
    theme: 'Transition matrices, invertibility, oscillation, and diffusion over many states.',
    status: 'ready',
    exercises: [markovChainsExercise],
  },
];
