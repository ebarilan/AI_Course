import type { Exercise } from '../../types';

export const linearAlgebraExercise: Exercise = {
  id: 'exercise-1-linear-algebra',
  title: 'Exercise 1 — Linear Algebra',
  subtitle: 'Word embeddings, systems of equations, linearity, and derivative matrices.',
  deadline: 'Monday, June 8',
  aiPolicy:
    'AI models such as ChatGPT, Claude, Copilot, and friends are encouraged. Include chat logs and prompts in the submission.',
  objective:
    'Practice core linear algebra ideas by combining small Python experiments with written mathematical explanations.',
  parts: [
    {
      title: 'Part 1 — Word Embeddings',
      summary:
        'Load pre-trained embedding vectors for king, queen, dog, cat, and coffee, then compare their distances.',
      tasks: [
        'Create a Python notebook that loads pre-trained word embedding vectors, for example with gensim and a Word2Vec model.',
        'Report the dimensionality, meaning the length, of each embedding vector.',
        'Compute pairwise distances between every pair of words.',
        'Identify which word pairs are closest and which pairs are furthest apart.',
      ],
      notes: [
        'Keep the model name, distance metric, and any download steps visible in the notebook so the result is reproducible.',
      ],
    },
    {
      title: 'Part 2 — Solving a Linear System',
      summary:
        'Rewrite three equations as A @ x = b and solve with the inverse matrix method.',
      tasks: [
        'Represent x1 + x2 + x3 = 6, x1 - x2 + x3 = 2, and x1 + x2 - x3 = 0 as a 3×3 matrix A and vectors x and b.',
        'Assuming A is invertible, solve for x1, x2, and x3 using x = A⁻¹b.',
        'Show enough intermediate work to make the solution easy to follow.',
      ],
      notes: ['The expected solution is x1 = 1, x2 = 3, and x3 = 2.'],
    },
    {
      title: 'Part 3 — Linearity of Matrix Multiplication',
      summary:
        'State the conditions for a linear operation and show matrix multiplication satisfies them.',
      tasks: [
        'Define additivity: T(u + v) = T(u) + T(v).',
        'Define homogeneity: T(cu) = cT(u) for a scalar c.',
        'Use these two properties to explain why multiplying by a fixed matrix is linear.',
      ],
    },
    {
      title: 'Part 4 — The Polynomial Derivative Matrix',
      summary:
        'Use a 5×1 all-ones polynomial coefficient vector p and a 5×5 derivative matrix D.',
      tasks: [
        'Decide whether D @ p is well-defined and compute it.',
        'Decide whether p.T @ D is well-defined and compute it.',
        'Decide whether D @ D, also written D², is well-defined and compute or characterize it.',
        'Compute the scalar p.T @ D @ p and explain whether it has a meaningful interpretation.',
        'Generalize pᵀDp for an n×1 all-ones vector p and the corresponding n×n derivative matrix D.',
      ],
      notes: [
        'The derivative matrix convention should be stated clearly, because coefficient ordering can change the exact matrix layout.',
      ],
    },
  ],
  deliverables: [
    'A Python notebook for the embeddings experiment.',
    'Written matrix form and solution for the linear system.',
    'Short proof/explanation of linearity.',
    'Derivative matrix computations and interpretation.',
    'Chat logs that include prompts used with AI tools.',
  ],
  starterFiles: [
    'weeks/week-1/exercise-1-linear-algebra/notebook.ipynb',
    'weeks/week-1/exercise-1-linear-algebra/solution.md',
    'weeks/week-1/exercise-1-linear-algebra/chat-log.md',
  ],
  chatLogGuidance: [
    'Copy every prompt that helped with the exercise.',
    'Summarize the useful answer in your own words.',
    'Mention what you verified manually or with code.',
  ],
};
