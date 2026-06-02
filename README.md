# AI Course Exercise Lab

A modern, playful TypeScript website for organizing and presenting weekly AI course exercises.
The site is designed to be deployed on Vercel and to grow week by week as new assignments are added.

## What is included

- A dependency-light TypeScript app that compiles to static files.
- Week-based navigation for course exercises.
- A dedicated **About me** chapter.
- Week 1 content for **Exercise 1 — Linear Algebra**.
- A small content architecture so each exercise can stay self-explained and easy to find.

## Run locally

```bash
npm install
npm run dev
```

## Build for Vercel

```bash
npm run build
```

Vercel can build this project with these settings:

- Build command: `npm run build`
- Output directory: `dist`

## Personalize the site

Update `src/siteConfig.ts` with the owner name that should appear in the Vercel-hosted website.

## Add a new exercise

1. Create a typed exercise file under `src/course/weeks/<week-slug>/`.
2. Export the exercise as an `Exercise` object.
3. Register it in `src/course/weeks.ts`.
4. Keep notebook, solution, and chat-log artifacts in a matching folder such as:
   `weeks/week-1/exercise-1-linear-algebra/`.

## Suggested exercise artifact structure

```text
weeks/
  week-1/
    exercise-1-linear-algebra/
      notebook.ipynb
      solution.md
      chat-log.md
```
