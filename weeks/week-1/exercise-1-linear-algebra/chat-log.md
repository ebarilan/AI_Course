# Chat Log - Exercise 1: Linear Algebra

Include AI prompts and a short summary of how each response helped.

## Prompt 1

```text
Create the implemented solution for Part 1 - Word Embeddings. Write a Python
notebook that loads pre-trained vectors for king, queen, dog, cat, and coffee,
reports the embedding dimensionality, computes pairwise distances, identifies
the closest and furthest pairs, and adds explanation/reasoning for the answers.
```

### Useful response summary

- Used `gensim.downloader` with the pre-trained `glove-wiki-gigaword-50` model.
- Computed Euclidean distances for all ten word pairs.
- Explained why `dog-cat` and `king-queen` are close, and why `coffee` is far from royalty words.

### What I verified

- The vectors have dimensionality `50`.
- The closest pair is `dog-cat`, distance `1.884603`.
- The furthest pair is `queen-coffee`, distance `6.653850`.
- The notebook and written solution use the same model, metric, and results.
