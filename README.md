# AI Course Repository

This repository is organized around the course exercises first. Website and launch files live separately so the learning material stays easy to scan.

## Repository structure

```text
course/
  weeks/
    week-1/
      exercise-1-linear-algebra/
        original-exercise.pdf
        README.md
        notebook.ipynb
        part-2-linear-system.ipynb
        solution.md
        chat-log.md
website/
  public/
  scripts/
  src/
  package.json
  tsconfig.json
  vercel.json
```

## Course content

- `course/weeks/week-1/exercise-1-linear-algebra/original-exercise.pdf` is the original assignment.
- `course/weeks/week-1/exercise-1-linear-algebra/README.md` explains the exercise folder.
- Notebooks, written solutions, and AI chat logs stay beside the exercise they belong to.

## Run locally

```bash
cd website
npm install
npm run dev
```

## Build for Vercel

```bash
cd website
npm run build
```

Vercel can build this project with these settings:

- Root directory: `website`
- Build command: `npm run build`
- Output directory: `dist`

## Personalize the site

Update `website/src/siteConfig.ts` with the owner name that should appear in the Vercel-hosted website.

## Add a new exercise

1. Create the exercise artifacts under `course/weeks/<week-slug>/<exercise-slug>/`.
2. Export the exercise as an `Exercise` object.
3. Register it in `website/src/course/weeks.ts`.
4. Keep the original assignment PDF, notebooks, solution, and chat log inside the same exercise folder.
