# Solution Notes - Exercise 2: Population Dynamics

The population order is:

```text
[algae, small fish, large fish]
```

The transition matrix is:

```text
M = [[0.80, 0.15, 0.05],
     [0.15, 0.70, 0.15],
     [0.05, 0.15, 0.80]]
```

## Part 1 - Future populations

Starting with `x1 = [10, 20, 4]`:

```text
x2 = M @ x1 = [11.2, 16.1, 6.7]
x3 = M @ x2 = [11.71, 13.955, 8.335]
```

The total remains `34` because every column of `M` sums to `1`.

## Part 2 - Eigenvalues and eigenvectors

The eigenvalues are:

```text
1.00, 0.75, 0.55
```

Convenient corresponding eigenvectors are:

```text
eigenvalue 1.00: [1, 1, 1]
eigenvalue 0.75: [1, 0, -1]
eigenvalue 0.55: [1, -2, 1]
```

`M @ [1, 1, 1] = [1, 1, 1]`, so `[1, 1, 1]` is an eigenvector
with eigenvalue `1`.

## Part 3 - Long-term behavior

```text
x30 = M^29 @ x1
    = [11.33404753, 11.33333359, 11.33261888]
```

This is very close to:

```text
[34/3, 34/3, 34/3] = [11.33333333, 11.33333333, 11.33333333]
```

The long-term vector points in the direction `[1, 1, 1]`. The other
eigenvalue contributions shrink because `0.75^n` and `0.55^n` approach zero.

## Part 4 - Different initial conditions

After 29 transitions:

| Initial vector | Total | Approximate x30 |
| --- | ---: | --- |
| `[30, 5, 1]` | 36 | `[12.0035, 12.0000, 11.9965]` |
| `[2, 50, 10]` | 62 | `[20.6657, 20.6667, 20.6676]` |
| `[100, 0, 0]` | 100 | `[33.3452, 33.3333, 33.3214]` |

Each experiment approaches an equal one-third distribution. The final amounts
differ because each starting vector has a different total population.
