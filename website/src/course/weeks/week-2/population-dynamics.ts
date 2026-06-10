import type { Exercise } from '../../types.js';

export const populationDynamicsExercise: Exercise = {
  id: 'exercise-2-population-dynamics',
  title: 'Exercise 2 - Population Dynamics',
  subtitle: 'Model a lake ecosystem with matrices, eigenvectors, and long-term behavior.',
  deadline: 'See the original exercise PDF',
  aiPolicy:
    'Use the notebook to understand and verify each calculation. Explain the conclusions in your own words.',
  objective:
    'Understand how repeated matrix multiplication changes a population and why eigenvalues predict its long-term distribution.',
  parts: [
    {
      title: 'Part 1 - Computing Future Populations',
      summary:
        'Apply the transition matrix to the Year 1 population vector and check that the total remains constant.',
      tasks: [
        'Use x2 = M @ x1 to compute the Year 2 population.',
        'Use x3 = M @ x2 to compute the Year 3 population.',
        'Add the three population values in each year and verify that the total remains 34.',
      ],
      notes: [
        'Population order: algae, small fish, large fish.',
        'Decimal populations are acceptable because this is a mathematical model.',
      ],
      solutionBlocks: [
        {
          heading: 'Define the model',
          text: 'The current population vector is multiplied by M once for every yearly transition.',
          matrices: [
            {
              label: 'M',
              rows: [
                ['0.80', '0.15', '0.05'],
                ['0.15', '0.70', '0.15'],
                ['0.05', '0.15', '0.80'],
              ],
            },
            {
              label: 'x1',
              rows: [['10'], ['20'], ['4']],
            },
          ],
        },
        {
          heading: 'Compute Years 2 and 3',
          equations: ['x2 = M x1 = [11.2, 16.1, 6.7]^T', 'x3 = M x2 = [11.71, 13.955, 8.335]^T'],
        },
        {
          heading: 'Check the total',
          equations: ['10 + 20 + 4 = 34', '11.2 + 16.1 + 6.7 = 34', '11.71 + 13.955 + 8.335 = 34'],
          text: 'Every column of M sums to 1, so the model redistributes the population without changing its total.',
        },
      ],
    },
    {
      title: 'Part 2 - Eigenvalues and Eigenvectors',
      summary:
        'Find the special directions that the transition matrix only stretches or shrinks.',
      tasks: [
        'Calculate the eigenvalues of M.',
        'Calculate a corresponding eigenvector for each eigenvalue.',
        'Verify that one eigenvalue is 1.',
        'Show directly that [1, 1, 1]^T is an eigenvector of M.',
      ],
      notes: [
        'Eigenvectors may be scaled or have the opposite sign and still represent the same eigenvector direction.',
      ],
      solutionBlocks: [
        {
          heading: 'Eigenvalue results',
          equations: ['lambda1 = 1', 'lambda2 = 0.75', 'lambda3 = 0.55'],
          text: 'Convenient matching eigenvectors are [1, 1, 1]^T, [1, 0, -1]^T, and [1, -2, 1]^T.',
        },
        {
          heading: 'Verify the eigenvalue 1',
          equations: ['M [1, 1, 1]^T = [1, 1, 1]^T', 'M v = 1 v'],
          text: 'The vector keeps the same direction and size, so it is an eigenvector with eigenvalue 1.',
        },
      ],
    },
    {
      title: 'Part 3 - Long-Term Behavior',
      summary:
        'Apply the transition matrix 29 times to find the Year 30 population.',
      tasks: [
        'Compute x30 = M^29 @ x1.',
        'Compare x30 with the eigenvector associated with eigenvalue 1.',
        'Describe what happens to the three population values over time.',
      ],
      solutionBlocks: [
        {
          heading: 'Compute Year 30',
          equations: ['x30 = M^29 x1', 'x30 = [11.33404753, 11.33333359, 11.33261888]^T'],
          text: 'The result is nearly [34/3, 34/3, 34/3]^T, which is a multiple of [1, 1, 1]^T.',
        },
        {
          heading: 'Explain the convergence',
          text: 'The eigenvalue-1 component remains, while the components multiplied by 0.75 and 0.55 shrink after every year.',
          equations: ['0.75^n -> 0', '0.55^n -> 0'],
        },
      ],
    },
    {
      title: 'Part 4 - Different Initial Conditions',
      summary:
        'Repeat the Year 30 calculation for three very different starting populations.',
      tasks: [
        'Compute x30 for [30, 5, 1]^T, [2, 50, 10]^T, and [100, 0, 0]^T.',
        'Compare both the final population values and their proportions.',
        'Explain why the long-term distributions are similar.',
      ],
      solutionBlocks: [
        {
          heading: 'Year 30 results',
          equations: [
            '[30, 5, 1]^T -> [12.0035, 12.0000, 11.9965]^T',
            '[2, 50, 10]^T -> [20.6657, 20.6667, 20.6676]^T',
            '[100, 0, 0]^T -> [33.3452, 33.3333, 33.3214]^T',
          ],
        },
        {
          heading: 'Compare distributions',
          text: 'The totals remain 36, 62, and 100, so the final amounts differ. In every case, however, each species approaches one third of the total.',
          equations: ['long-term distribution -> [1/3, 1/3, 1/3]'],
        },
      ],
    },
  ],
  deliverables: [
    'A Python notebook containing calculations and explanations for all four parts.',
    'Future-population vectors and a conservation check.',
    'Eigenvalues, eigenvectors, and verification of the eigenvalue 1.',
    'Year 30 comparisons for the original and three additional initial conditions.',
  ],
  originalExerciseFile:
    'course/weeks/week-2/exercise-2-population-dynamics/original-exercise.pdf',
  starterFiles: [
    'course/weeks/week-2/exercise-2-population-dynamics/population_dynamics_solution.ipynb',
    'course/weeks/week-2/exercise-2-population-dynamics/solution.md',
  ],
  notebook: {
    title: 'Complete Python Solution',
    path:
      'course/weeks/week-2/exercise-2-population-dynamics/population_dynamics_solution.ipynb',
    runUrl:
      'https://colab.research.google.com/github/ebarilan/AI_Course/blob/main/course/weeks/week-2/exercise-2-population-dynamics/population_dynamics_solution.ipynb',
    description:
      'Run all four parts step by step, including population graphs and plain-language explanations.',
  },
};
