import type { Exercise } from '../../types.js';

export const linearAlgebraExercise: Exercise = {
  id: 'exercise-1-linear-algebra',
  title: 'Exercise 1 - Linear Algebra',
  subtitle: 'Word embeddings, systems of equations, linearity, and derivative matrices.',
  deadline: 'Monday, June 8',
  aiPolicy:
    'AI models such as ChatGPT, Claude, Copilot, and friends are encouraged. Include chat logs and prompts in the submission.',
  objective:
    'Practice core linear algebra ideas by combining small Python experiments with written mathematical explanations.',
  parts: [
    {
      title: 'Part 1 - Word Embeddings',
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
      title: 'Part 2 - Solving a Linear System',
      summary:
        'Rewrite three equations as A @ x = b and solve with the inverse matrix method.',
      tasks: [
        'Represent x1 + x2 + x3 = 6, x1 - x2 + x3 = 2, and x1 + x2 - x3 = 0 as a 3x3 matrix A and vectors x and b.',
        'Assuming A is invertible, solve for x1, x2, and x3 using x = A^-1 b.',
        'Show enough intermediate work to make the solution easy to follow.',
      ],
      notes: ['The verified solution is x1 = 1, x2 = 2, and x3 = 3.'],
      solutionBlocks: [
        {
          heading: 'Write the system in matrix form',
          text: 'The three equations can be written as A x = b.',
          matrices: [
            {
              label: 'A',
              rows: [
                ['1', '1', '1'],
                ['1', '-1', '1'],
                ['1', '1', '-1'],
              ],
            },
            {
              label: 'x',
              rows: [['x1'], ['x2'], ['x3']],
            },
            {
              label: 'b',
              rows: [['6'], ['2'], ['0']],
            },
          ],
        },
        {
          heading: 'Use the inverse method',
          text: 'The determinant of A is 4, so A is invertible.',
          equations: ['x = A^-1 b'],
          matrices: [
            {
              label: 'A^-1',
              rows: [
                ['0', '1/2', '1/2'],
                ['1/2', '-1/2', '0'],
                ['1/2', '0', '-1/2'],
              ],
            },
          ],
        },
        {
          heading: 'Compute the answer',
          equations: ['x = A^-1 b = [1, 2, 3]^T'],
          text: 'Therefore x1 = 1, x2 = 2, and x3 = 3.',
          steps: [
            'Check equation 1: 1 + 2 + 3 = 6.',
            'Check equation 2: 1 - 2 + 3 = 2.',
            'Check equation 3: 1 + 2 - 3 = 0.',
          ],
        },
      ],
      notebookFiles: ['course/weeks/week-1/exercise-1-linear-algebra/part-2-linear-system.ipynb'],
    },
    {
      title: 'Part 3 - Linearity of Matrix Multiplication',
      summary:
        'Static proof page: state the linearity conditions and show that multiplying by a fixed matrix satisfies them.',
      tasks: [
        'Let T(x) = A @ x, where A is a fixed m x n matrix and x is a vector in R^n.',
        'State additivity: T(u + v) = T(u) + T(v) for any vectors u and v in R^n.',
        'State homogeneity: T(cu) = cT(u) for any scalar c and vector u in R^n.',
        'Conclude that T is linear because both properties hold for matrix multiplication.',
      ],
      examples: [
        {
          title: 'Example 1 - Additivity',
          body:
            'Use A = [[2, 1], [0, 3]], u = [1, 2], and v = [3, -1]. Then u + v = [4, 1].',
          steps: [
            'T(u + v) = A @ [4, 1] = [9, 3].',
            'T(u) = A @ [1, 2] = [4, 6] and T(v) = A @ [3, -1] = [5, -3].',
            'T(u) + T(v) = [4, 6] + [5, -3] = [9, 3], so T(u + v) = T(u) + T(v).',
          ],
        },
        {
          title: 'Example 2 - Homogeneity',
          body:
            'Use the same matrix A = [[2, 1], [0, 3]], vector u = [1, 2], and scalar c = 4.',
          steps: [
            'T(cu) = A @ [4, 8] = [16, 24].',
            'T(u) = A @ [1, 2] = [4, 6], so cT(u) = 4[4, 6] = [16, 24].',
            'Therefore T(cu) = cT(u), which confirms homogeneity for this example.',
          ],
        },
      ],
      notes: [
        'This part is a written/static explanation only. No notebook is required for the linearity proof.',
      ],
      solutionBlocks: [
        {
          heading: 'Define the transformation',
          text: 'Let A be a fixed matrix and define T(x) = A x. To prove T is linear, we check additivity and homogeneity.',
        },
        {
          heading: 'Additivity',
          equations: ['T(u + v) = A(u + v)', 'A(u + v) = Au + Av', 'Au + Av = T(u) + T(v)'],
          text: 'So T(u + v) = T(u) + T(v).',
        },
        {
          heading: 'Homogeneity',
          equations: ['T(cu) = A(cu)', 'A(cu) = c(Au)', 'c(Au) = cT(u)'],
          text: 'So T(cu) = cT(u). Because both properties hold, matrix multiplication by a fixed matrix is linear.',
        },
      ],
    },
    {
      title: 'Part 4 - The Polynomial Derivative Matrix',
      summary:
        'Use a 5x1 all-ones polynomial coefficient vector p and a 5x5 derivative matrix D.',
      tasks: [
        'Decide whether D @ p is well-defined and compute it.',
        'Decide whether p.T @ D is well-defined and compute it.',
        'Decide whether D @ D, also written D^2, is well-defined and compute or characterize it.',
        'Compute the scalar p.T @ D @ p and explain whether it has a meaningful interpretation.',
        'Generalize p.T @ D @ p for an n x 1 all-ones vector p and the corresponding n x n derivative matrix D.',
      ],
      notes: [
        'Convention: coefficients are ordered as [1, x, x^2, x^3, x^4]^T. So D maps [a0, a1, a2, a3, a4]^T to [a1, 2a2, 3a3, 4a4, 0]^T.',
      ],
      solutionBlocks: [
        {
          heading: 'Set up D and p',
          text: 'The coefficient vector p represents q(x) = 1 + x + x^2 + x^3 + x^4.',
          matrices: [
            {
              label: 'D',
              rows: [
                ['0', '1', '0', '0', '0'],
                ['0', '0', '2', '0', '0'],
                ['0', '0', '0', '3', '0'],
                ['0', '0', '0', '0', '4'],
                ['0', '0', '0', '0', '0'],
              ],
            },
            {
              label: 'p',
              rows: [['1'], ['1'], ['1'], ['1'], ['1']],
            },
          ],
        },
        {
          heading: 'Compute D p',
          text: 'The product is defined because the shapes are 5 x 5 and 5 x 1.',
          matrices: [
            {
              label: 'D p',
              rows: [['1'], ['2'], ['3'], ['4'], ['0']],
            },
          ],
        },
        {
          heading: 'Compute p^T D',
          text: 'The product is defined because the shapes are 1 x 5 and 5 x 5.',
          matrices: [
            {
              label: 'p^T D',
              rows: [['0', '1', '2', '3', '4']],
            },
          ],
        },
        {
          heading: 'Compute D squared',
          text: 'D^2 is defined and represents the second derivative matrix.',
          matrices: [
            {
              label: 'D^2',
              rows: [
                ['0', '0', '2', '0', '0'],
                ['0', '0', '0', '6', '0'],
                ['0', '0', '0', '0', '12'],
                ['0', '0', '0', '0', '0'],
                ['0', '0', '0', '0', '0'],
              ],
            },
          ],
        },
        {
          heading: 'Interpret p^T D p',
          equations: ['p^T D p = 1 + 2 + 3 + 4 = 10'],
          text: "This equals the sum of the coefficients of q'(x). Since q'(x) = 1 + 2x + 3x^2 + 4x^3, that sum is q'(1) = 10.",
        },
        {
          heading: 'General case',
          equations: ['p^T D p = 1 + 2 + ... + (n - 1)', 'p^T D p = n(n - 1) / 2'],
          text: 'For an n x 1 all-ones vector, the derivative coefficients are 1 through n - 1, so the expression is their sum.',
        },
      ],
    },
  ],
  deliverables: [
    'A Python notebook for the embeddings experiment.',
    'Written matrix form and solution for the linear system.',
    'Static written proof of linearity with numeric examples for additivity and homogeneity.',
    'Derivative matrix computations and interpretation.',
    'Chat logs that include prompts used with AI tools.',
  ],
  originalExerciseFile: 'course/weeks/week-1/exercise-1-linear-algebra/original-exercise.pdf',
  starterFiles: [
    'course/weeks/week-1/exercise-1-linear-algebra/notebook.ipynb',
    'course/weeks/week-1/exercise-1-linear-algebra/part-2-linear-system.ipynb',
    'course/weeks/week-1/exercise-1-linear-algebra/solution.md',
    'course/weeks/week-1/exercise-1-linear-algebra/chat-log.md',
  ],
  chatLogGuidance: [
    'Copy every prompt that helped with the exercise.',
    'Summarize the useful answer in your own words.',
    'Mention what you verified manually or with code.',
  ],
  solution: {
    title: 'Part 1 Solution - Word Embeddings',
    notebookPath: 'course/weeks/week-1/exercise-1-linear-algebra/notebook.ipynb',
    notebookRunUrl:
      'https://colab.research.google.com/github/ebarilan/AI_Course/blob/main/course/weeks/week-1/exercise-1-linear-algebra/notebook.ipynb',
    modelName: 'glove-wiki-gigaword-50',
    distanceMetric: 'Euclidean distance',
    dimensionality: 50,
    distances: [
      { first: 'dog', second: 'cat', distance: 1.884603 },
      { first: 'king', second: 'queen', distance: 3.477756 },
      { first: 'queen', second: 'cat', distance: 4.968586 },
      { first: 'dog', second: 'coffee', distance: 5.36936 },
      { first: 'queen', second: 'dog', distance: 5.370511 },
      { first: 'cat', second: 'coffee', distance: 5.472542 },
      { first: 'king', second: 'cat', distance: 5.47832 },
      { first: 'king', second: 'dog', distance: 5.89115 },
      { first: 'king', second: 'coffee', distance: 6.544825 },
      { first: 'queen', second: 'coffee', distance: 6.65385 },
    ],
    closestPairs: [
      { first: 'dog', second: 'cat', distance: 1.884603 },
      { first: 'king', second: 'queen', distance: 3.477756 },
    ],
    furthestPairs: [
      { first: 'queen', second: 'coffee', distance: 6.65385 },
      { first: 'king', second: 'coffee', distance: 6.544825 },
    ],
    explanation: [
      'Each word is represented by a 50-number vector learned from word co-occurrence patterns in the GloVe Wikipedia/Gigaword corpus.',
      'Smaller Euclidean distance means the vectors sit closer together in embedding space, so the model sees those words as more similar in usage.',
      'The closest pair is dog-cat because both are common household animals and often appear in similar contexts.',
      'King-queen is also close because the two words share royal and human-ruler contexts, with gender being one major difference.',
      'Coffee is furthest from queen and king because it belongs to a food/drink context, not an animal or royalty context.',
    ],
  },
};
