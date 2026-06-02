# Solution Notes - Exercise 1: Linear Algebra

Use this file for the written parts of the submission.

## Part 1 - Word Embeddings

- Model/library used: `gensim.downloader` with `glove-wiki-gigaword-50`
- Vector dimensionality: `50` for each word vector
- Distance metric: Euclidean distance
- Words checked: `king`, `queen`, `dog`, `cat`, `coffee`

Pairwise distances, sorted from closest to furthest:

| Pair | Distance |
| --- | ---: |
| dog-cat | 1.884603 |
| king-queen | 3.477756 |
| queen-cat | 4.968586 |
| dog-coffee | 5.369360 |
| queen-dog | 5.370511 |
| cat-coffee | 5.472542 |
| king-cat | 5.478320 |
| king-dog | 5.891150 |
| king-coffee | 6.544825 |
| queen-coffee | 6.653850 |

Closest pairs:

1. `dog` and `cat`, distance `1.884603`
2. `king` and `queen`, distance `3.477756`

Furthest pairs:

1. `queen` and `coffee`, distance `6.653850`
2. `king` and `coffee`, distance `6.544825`

Explanation and thinking:

The result makes sense because embeddings are learned from word usage patterns.
`dog` and `cat` are close because both are common animals and household pets, so
they appear in similar text contexts. `king` and `queen` are also close because
they share royalty and monarchy contexts. `coffee` is far from `queen` and
`king` because it belongs to a drink/food context, not a human royalty context.
The important idea is that the notebook compares learned numeric vectors, not
dictionary definitions.

## Part 2 - Solving a Linear System

We need solve the system:

```text
x1 + x2 + x3 = 6
x1 - x2 + x3 = 2
x1 + x2 - x3 = 0
```

### Matrix form

The coefficients of the variables become the matrix `A`. The unknowns become
the vector `x`, and the right side numbers become the vector `b`.

```text
A = [[1,  1,  1],
     [1, -1,  1],
     [1,  1, -1]]

x = [[x1],
     [x2],
     [x3]]

b = [[6],
     [2],
     [0]]

A @ x = b
```

### Reasoning

The determinant of `A` is `4`, so `A` is invertible. Because `A` is invertible,
the inverse matrix method can be used:

```text
x = A^-1 @ b
```

The inverse matrix is:

```text
A^-1 = [[0,    1/2,  1/2],
        [1/2, -1/2,  0  ],
        [1/2,  0,   -1/2]]
```

Now multiply:

```text
x = A^-1 @ b

x = [[0,    1/2,  1/2],     [[6],
     [1/2, -1/2,  0  ],  @   [2],
     [1/2,  0,   -1/2]]      [0]]

x = [[1],
     [2],
     [3]]
```

Solution:

```text
x1 = 1
x2 = 2
x3 = 3
```

### Check

Substitute the answer back into the original equations:

```text
1 + 2 + 3 = 6
1 - 2 + 3 = 2
1 + 2 - 3 = 0
```

The solution is correct.

## Part 3 - Linearity of Matrix Multiplication

This part is a static written explanation. No notebook is required.

Let the operation be:

```text
T(x) = A @ x
```

where `A` is a fixed `m x n` matrix and `x` is a vector in `R^n`. The output
`T(x)` is a vector in `R^m`.

A function or operation `T` is linear when it satisfies both conditions below.

### Condition 1: Additivity

```text
T(u + v) = T(u) + T(v)
```

This must hold for any two vectors `u` and `v` in the input space.

Example:

```text
A = [[2, 1],
     [0, 3]]

u = [1, 2]
v = [3, -1]
u + v = [4, 1]

T(u + v) = A @ [4, 1] = [9, 3]
T(u) = A @ [1, 2] = [4, 6]
T(v) = A @ [3, -1] = [5, -3]

T(u) + T(v) = [4, 6] + [5, -3] = [9, 3]
```

So:

```text
T(u + v) = T(u) + T(v)
```

### Condition 2: Homogeneity

```text
T(cu) = cT(u)
```

This must hold for any scalar `c` and any vector `u` in the input space.

Example:

```text
A = [[2, 1],
     [0, 3]]

u = [1, 2]
c = 4
cu = [4, 8]

T(cu) = A @ [4, 8] = [16, 24]
T(u) = A @ [1, 2] = [4, 6]
cT(u) = 4[4, 6] = [16, 24]
```

So:

```text
T(cu) = cT(u)
```

### General proof

For additivity:

```text
T(u + v) = A @ (u + v)
         = A @ u + A @ v
         = T(u) + T(v)
```

For homogeneity:

```text
T(cu) = A @ (cu)
      = c(A @ u)
      = cT(u)
```

Since multiplying by a fixed matrix satisfies both additivity and homogeneity,
matrix multiplication of the form `T(x) = A @ x` is a linear operation.

## Part 4 - Polynomial Derivative Matrix

State the coefficient ordering convention first, then evaluate:

1. `D @ p`
2. `p.T @ D`
3. `D @ D`
4. `p.T @ D @ p`
5. General case for `p.T @ D @ p`
