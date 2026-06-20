import type { Exercise } from '../../types.js';

export const markovChainsExercise: Exercise = {
  id: 'exercise-3-markov-chains',
  title: 'Exercise 3 - Transition Matrices and Markov Chains',
  subtitle: 'Analyze two Markov chains with matrix powers, eigenvectors, invertibility, and long-term behavior.',
  deadline: 'Wednesday, June 24',
  aiPolicy:
    'Submit both your LLM chat log and a Python notebook. Use code to verify the algebra, then explain the conclusions in your own words.',
  objective:
    'Understand how transition matrices move probability mass, why eigenvalues explain long-term behavior, and when a previous state can or cannot be recovered.',
  parts: [
    {
      title: 'Part A - Reflecting Transition Matrix',
      summary:
        'Work with a 5-state transition matrix whose edge states include a stay-put probability.',
      tasks: [
        'Calculate P(2) and P(3) for P(0) = [0, 0, 1, 0, 0]^T.',
        'Identify the special column property of T.',
        'Write the formula P(t) = T^t P(0).',
        'Calculate eigenvalues and eigenvectors.',
        'Calculate det(T), decide whether T is invertible, and give T^-1 if it exists.',
        'Decide whether P(104) can be recovered from P(105).',
        'Approximate P(t) for very large t.',
        'Explain whether the answer changes for another P(0), and resolve the apparent tension with invertibility.',
      ],
      notes: [
        'The matrix is column-stochastic: every column sums to 1, so probability is conserved.',
        'The large-time approximation is not the same thing as an exact finite-time state.',
      ],
      solutionBlocks: [
        {
          heading: 'First powers',
          equations: [
            'P(2) = [1/4, 0, 1/2, 0, 1/4]^T',
            'P(3) = [1/8, 3/8, 0, 3/8, 1/8]^T',
            'P(t) = T^t P(0)',
          ],
          text: 'Each column sums to 1, so the total probability remains 1 after every multiplication.',
        },
        {
          heading: 'Eigenvalues and determinant',
          equations: [
            'lambda_k = cos(k pi / 5), k = 0,1,2,3,4',
            'lambda = 1, 0.809017, 0.309017, -0.309017, -0.809017',
            'det(T) = 1/16',
          ],
          text: 'One convenient eigenvector formula is v_k[j] = cos((j - 1/2) k pi / 5) for j = 1,...,5.',
        },
        {
          heading: 'Invertibility and backward recovery',
          text: 'Because det(T) is nonzero, T is invertible and P(104) = T^-1 P(105) if P(105) is known exactly.',
          matrices: [
            {
              label: 'T^-1',
              rows: [
                ['1', '1', '-1', '-1', '1'],
                ['1', '-1', '1', '1', '-1'],
                ['-1', '1', '1', '1', '-1'],
                ['-1', '1', '1', '-1', '1'],
                ['1', '-1', '-1', '1', '1'],
              ],
            },
          ],
        },
        {
          heading: 'Long-term behavior',
          equations: ['P(t) -> [1/5, 1/5, 1/5, 1/5, 1/5]^T'],
          text: 'For any probability vector, the components attached to eigenvalues with absolute value below 1 shrink. The limit keeps only the eigenvalue-1 direction.',
        },
      ],
    },
    {
      title: 'Part B - Bouncing Edge Transition Matrix',
      summary:
        'Repeat the same questions for the second 5-state transition matrix, where edge states bounce inward.',
      tasks: [
        'Calculate P(2) and P(3) for the same P(0).',
        'Check the column sums.',
        'Write the formula for P(t).',
        'Calculate eigenvalues and eigenvectors.',
        'Calculate det(T), and decide whether T has an inverse.',
        'Decide whether P(104) can be recovered from P(105).',
        'Approximate P(t) for very large t.',
        'Explain how a different P(0) can affect the large-time behavior.',
      ],
      notes: [
        'This matrix has eigenvalue -1, so the chain can oscillate instead of settling to one vector.',
      ],
      solutionBlocks: [
        {
          heading: 'First powers',
          equations: [
            'P(2) = [1/4, 0, 1/2, 0, 1/4]^T',
            'P(3) = [0, 1/2, 0, 1/2, 0]^T',
            'P(t) = T^t P(0)',
          ],
          text: 'The columns still sum to 1, so total probability remains 1.',
        },
        {
          heading: 'Eigenvalues and determinant',
          equations: [
            'lambda = 1, 1/sqrt(2), 0, -1/sqrt(2), -1',
            'det(T) = 0',
          ],
          text: 'Because the determinant is zero, T is singular and no inverse matrix exists.',
        },
        {
          heading: 'Eigenvectors',
          equations: [
            'lambda = 1: [1, 2, 2, 2, 1]^T',
            'lambda = 1/sqrt(2): [-1, -sqrt(2), 0, sqrt(2), 1]^T',
            'lambda = 0: [1, 0, -2, 0, 1]^T',
            'lambda = -1/sqrt(2): [1, -sqrt(2), 0, sqrt(2), -1]^T',
            'lambda = -1: [1, -2, 2, -2, 1]^T',
          ],
        },
        {
          heading: 'Large-time behavior',
          equations: [
            'even t >= 2: [1/4, 0, 1/2, 0, 1/4]^T',
            'odd t >= 3: [0, 1/2, 0, 1/2, 0]^T',
          ],
          text: 'The eigenvalue -1 component flips sign every step, so the process approaches a two-cycle rather than a single limiting vector.',
        },
      ],
    },
    {
      title: 'Part C - Real-World Story',
      summary:
        'Interpret the two matrices as signal motion along a one-dimensional line.',
      tasks: [
        'Treat the five states as five sample points along a line.',
        'Explain how Part A splits signal left and right while keeping half at a boundary.',
        'Explain how Part B reflects boundary signal fully inward.',
        'Connect Part A to averaging/convergence and Part B to cyclic echo behavior.',
      ],
      solutionBlocks: [
        {
          heading: 'Signal echo story',
          text: 'Imagine a signal echoing along a one-dimensional line with five sample points. P(t) tells us how much signal energy is present at each point after t steps. In Part A, interior points split signal equally left and right, while an edge keeps half and sends half inward. That repeated averaging smooths the signal and converges toward an even spread. In Part B, the edges are perfect reflectors: signal at an edge is sent fully inward. For the given starting signal, the energy alternates between odd and even positions, so the process cycles instead of converging to one stable vector.',
        },
      ],
    },
    {
      title: 'Part D - 100-State Diffusion Plot',
      summary:
        'Scale the Part A transition matrix to 100 states and plot P(t) at t = 0, 50, 100, and 500.',
      tasks: [
        'Build the 100 x 100 version of the Part A transition matrix.',
        'Use a length-100 P(0) vector with one nonzero middle entry.',
        'Plot P(t) for t = 0, t = 50, t = 100, and t = 500.',
        'Explain why the distribution spreads and flattens over time.',
      ],
      notes: [
        'For 100 states there are two middle positions. The notebook uses state 50 using one-indexed numbering, which is index 49 in Python.',
      ],
      solutionBlocks: [
        {
          heading: 'Python approach',
          text: 'Create a matrix where each interior column sends probability 1/2 to the left neighbor and 1/2 to the right neighbor. The first and last columns keep 1/2 at the edge and send 1/2 inward.',
          equations: [
            'snapshots = {t: matrix_power(T, t) @ P0 for t in [0, 50, 100, 500]}',
          ],
        },
        {
          heading: 'Interpretation',
          text: 'At t = 0 the mass is concentrated in one middle state. By t = 50 and t = 100 it spreads into a smooth mound. By t = 500 it is much flatter and closer to the uniform distribution, although not perfectly uniform yet.',
        },
      ],
    },
  ],
  deliverables: [
    'A Python notebook with verified calculations for Parts A-D.',
    'Written explanations for the algebra, eigenvalues, invertibility, and long-term behavior.',
    'A plot for the 100-state transition matrix at t = 0, 50, 100, and 500.',
    'The LLM chat log required by the assignment.',
  ],
  originalExerciseFile: 'course/weeks/week-3/exercise-3-markov-chains/original-exercise.pdf',
  starterFiles: [
    'course/weeks/week-3/exercise-3-markov-chains/markov_chains_solution.ipynb',
    'course/weeks/week-3/exercise-3-markov-chains/solution.md',
  ],
  notebook: {
    title: 'Complete Python Solution',
    path: 'course/weeks/week-3/exercise-3-markov-chains/markov_chains_solution.ipynb',
    runUrl:
      'https://colab.research.google.com/github/ebarilan/AI_Course/blob/main/course/weeks/week-3/exercise-3-markov-chains/markov_chains_solution.ipynb',
    description:
      'Run the Markov-chain calculations, verify eigenvalues and determinants, and generate the 100-state diffusion plot.',
  },
};
