# Solution Notes - Exercise 3: Transition Matrices and Markov Chains

The starting vector is:

```text
P(0) = [0, 0, 1, 0, 0]^T
```

All vectors below use the order `state 1, state 2, state 3, state 4, state 5`.

## Part A

The Part A matrix is column-stochastic: each column sums to `1`. This means the
total mass of the vector is conserved.

```text
P(2) = [1/4, 0, 1/2, 0, 1/4]^T
P(3) = [1/8, 3/8, 0, 3/8, 1/8]^T
```

The general formula is:

```text
P(t) = T^t P(0)
```

The eigenvalues are:

```text
1, cos(pi/5), cos(2pi/5), cos(3pi/5), cos(4pi/5)
```

Numerically:

```text
1.000000, 0.809017, 0.309017, -0.309017, -0.809017
```

A convenient eigenvector formula is:

```text
v_k[j] = cos((j - 1/2) k pi / 5),  k = 0,1,2,3,4 and j = 1,2,3,4,5
```

The determinant is:

```text
det(T) = 1/16
```

So `T` is invertible. Its inverse is:

```text
[[ 1,  1, -1, -1,  1],
 [ 1, -1,  1,  1, -1],
 [-1,  1,  1,  1, -1],
 [-1,  1,  1, -1,  1],
 [ 1, -1, -1,  1,  1]]
```

If `P(105)` is known exactly, then:

```text
P(104) = T^-1 P(105)
```

For very large `t`, the vector approaches the uniform distribution:

```text
[1/5, 1/5, 1/5, 1/5, 1/5]^T
```

If a different probability vector `P(0)` is used, the limit is still the
uniform distribution as long as the total mass is `1`. The apparent tension
with invertibility is not a real contradiction: every finite power `T^t` is
invertible, but the limiting process discards the small eigenvalue components.
Rounding a very-large-time vector also makes backward recovery numerically
unstable.

## Part B

The Part B matrix is also column-stochastic, so it conserves total mass.

```text
P(2) = [1/4, 0, 1/2, 0, 1/4]^T
P(3) = [0, 1/2, 0, 1/2, 0]^T
```

Again:

```text
P(t) = T^t P(0)
```

The eigenvalues are:

```text
1, 1/sqrt(2), 0, -1/sqrt(2), -1
```

Convenient corresponding eigenvectors are:

```text
lambda = 1:         [1, 2, 2, 2, 1]^T
lambda = 1/sqrt(2): [-1, -sqrt(2), 0, sqrt(2), 1]^T
lambda = 0:         [1, 0, -2, 0, 1]^T
lambda = -1/sqrt(2):[1, -sqrt(2), 0, sqrt(2), -1]^T
lambda = -1:        [1, -2, 2, -2, 1]^T
```

The determinant is:

```text
det(T) = 0
```

So `T` is not invertible, and `P(104)` cannot generally be recovered uniquely
from `P(105)`.

For the given `P(0)`, the large-time behavior is a two-cycle:

```text
even t >= 2: [1/4, 0, 1/2, 0, 1/4]^T
odd t >= 3:  [0, 1/2, 0, 1/2, 0]^T
```

The result can change for a different `P(0)`, because the long-term behavior
keeps the components in the eigenvalue `1` and eigenvalue `-1` directions.

## Part C

A natural story is a random walker moving between five neighboring locations.
In Part A, the walker can pause at the edge locations with probability `1/2`.
In Part B, the walker bounces back from the edge locations immediately. The
entries of `P(t)` describe the probability of finding the walker at each
location after `t` steps.

## Part D

For the 100-state version of Part A, put all mass in the middle state and apply
the same left/right transition rule. The vector spreads out over time:

- `t = 0`: all mass is in one state.
- `t = 50`: the mass has spread to nearby states.
- `t = 100`: the distribution is wider and smoother.
- `t = 500`: the distribution is much flatter and closer to the long-term
  uniform distribution.
