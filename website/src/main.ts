import { courseWeeks } from './course/weeks.js';
import { siteConfig } from './siteConfig.js';
import type { CourseWeek, Exercise, ExercisePart, MatrixDisplay, SolutionBlock } from './course/types.js';

type Route =
  | { kind: 'week'; weekSlug: string }
  | { kind: 'exercise'; weekSlug: string; exerciseId: string; partIndex?: number }
  | { kind: 'solution'; weekSlug: string; exerciseId: string; partIndex?: number };

const discoveredRoot = document.getElementById('root');
if (!discoveredRoot) {
  throw new Error('Root element was not found.');
}
const root = discoveredRoot;

function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((result, part, index) => `${result}${part}${String(values[index] ?? '')}`, '');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function routeForWeek(week: CourseWeek): string {
  return `#/week/${week.slug}`;
}

function routeForExercise(week: CourseWeek, exercise: Exercise): string {
  return `#/week/${week.slug}/exercise/${exercise.id}`;
}

function routeForSolution(week: CourseWeek, exercise: Exercise): string {
  return `#/week/${week.slug}/exercise/${exercise.id}/solution`;
}

function routeForSolutionPart(week: CourseWeek, exercise: Exercise, partIndex: number): string {
  return `${routeForSolution(week, exercise)}/part/${partIndex + 1}`;
}

function parseRoute(): Route {
  const fallbackWeek = courseWeeks[0]?.slug ?? 'week-1';
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [, weekSlug = fallbackWeek, section, exerciseId, solutionSegment, partSegment, partNumber] = parts;
  const weekExists = courseWeeks.some((week) => week.slug === weekSlug);
  const safeWeekSlug = weekExists ? weekSlug : fallbackWeek;
  const parsedPartIndex = partSegment === 'part' && partNumber ? Number(partNumber) - 1 : undefined;
  const partIndex = parsedPartIndex !== undefined && Number.isInteger(parsedPartIndex) && parsedPartIndex >= 0
    ? parsedPartIndex
    : undefined;

  if (section === 'exercise' && exerciseId) {
    return solutionSegment === 'solution'
      ? { kind: 'solution', weekSlug: safeWeekSlug, exerciseId, partIndex }
      : { kind: 'exercise', weekSlug: safeWeekSlug, exerciseId, partIndex };
  }

  return { kind: 'week', weekSlug: safeWeekSlug };
}

function findWeek(route: Route): CourseWeek {
  return courseWeeks.find((week) => week.slug === route.weekSlug) ?? courseWeeks[0];
}

function findExercise(week: CourseWeek, route: Route): Exercise | undefined {
  if (route.kind === 'week') {
    return week.exercises[0];
  }
  return week.exercises.find((exercise) => exercise.id === route.exerciseId) ?? week.exercises[0];
}

function render(): void {
  const route = parseRoute();
  const selectedWeek = findWeek(route);
  const selectedExercise = findExercise(selectedWeek, route);

  root.innerHTML = html`
    <main class="app-shell">
      ${renderHeader(selectedWeek, selectedExercise, route)}
      <div class="layout-grid">
        ${renderSidebar(route, selectedWeek, selectedExercise)}
        <section class="content-stack" aria-live="polite">
          ${renderRouteContent(selectedWeek, selectedExercise, route)}
          ${renderAboutSection()}
        </section>
      </div>
    </main>
  `;
}

function renderRouteContent(week: CourseWeek, exercise: Exercise | undefined, route: Route): string {
  if (route.kind === 'solution' && exercise) {
    return exercise.solution ? renderSolutionPage(week, exercise) : renderNoSolutionPage(week, exercise);
  }

  if (route.kind === 'exercise' && exercise) {
    return renderExercisePage(week, exercise);
  }

  return renderWeekPage(week);
}

function renderHeader(week: CourseWeek, exercise: Exercise | undefined, route: Route): string {
  const pageLabel = route.kind === 'solution' ? 'Solution page' : route.kind === 'exercise' ? 'Exercise page' : 'Week overview';
  const nextLink = exercise ? routeForExercise(week, exercise) : routeForWeek(week);

  return html`
    <header class="course-header">
      <div class="header-copy">
        <p class="eyebrow">AI course workspace</p>
        <h1>${escapeHtml(siteConfig.siteTitle)}</h1>
        <p>
          A structured learning site for weekly AI exercises. Each week has a clear overview,
          each exercise has its own instruction page, and worked answers live on separate solution pages.
        </p>
        <div class="header-actions">
          <a href="${escapeHtml(routeForWeek(week))}" class="secondary-action">Week overview</a>
          ${exercise ? `<a href="${escapeHtml(nextLink)}" class="primary-action">Open current exercise</a>` : ''}
        </div>
      </div>
      <div class="learning-map" aria-label="Current course structure">
        <span>${escapeHtml(pageLabel)}</span>
        <ol>
          <li class="${route.kind === 'week' ? 'active' : ''}">Week</li>
          <li class="${route.kind === 'exercise' ? 'active' : ''}">Exercise</li>
          <li class="${route.kind === 'solution' ? 'active' : ''}">Solution</li>
        </ol>
      </div>
    </header>
  `;
}

function renderSidebar(route: Route, selectedWeek: CourseWeek, selectedExercise?: Exercise): string {
  return html`
    <aside class="week-nav" aria-label="Course navigation">
      <div class="nav-title">Course weeks</div>
      ${courseWeeks.map((week) => renderWeekNavItem(week, route, selectedWeek, selectedExercise)).join('')}
    </aside>
  `;
}

function renderWeekNavItem(week: CourseWeek, route: Route, selectedWeek: CourseWeek, selectedExercise?: Exercise): string {
  const isActiveWeek = week.slug === route.weekSlug;
  return html`
    <section class="nav-week ${isActiveWeek ? 'active' : ''}">
      <a class="week-link" href="${escapeHtml(routeForWeek(week))}">
        <span>Week ${week.weekNumber}</span>
        <strong>${escapeHtml(week.title)}</strong>
        <small>${escapeHtml(week.theme)}</small>
      </a>
      ${isActiveWeek && week.exercises.length > 0 ? html`
        <div class="nav-subpages">
          ${week.exercises.map((exercise) => html`
            <a class="${route.kind === 'exercise' && route.exerciseId === exercise.id ? 'active' : ''}" href="${escapeHtml(routeForExercise(week, exercise))}">Exercise</a>
            ${exercise.solution ? `<a class="${route.kind === 'solution' && route.exerciseId === exercise.id ? 'active' : ''}" href="${escapeHtml(routeForSolution(week, exercise))}">Solution</a>` : ''}
          `).join('')}
          ${isActiveWeek && selectedExercise ? renderPartNavigation(selectedWeek, selectedExercise, route) : ''}
        </div>
      ` : ''}
    </section>
  `;
}

function renderPartNavigation(week: CourseWeek, exercise: Exercise, route: Route): string {
  return html`
    <div class="nav-parts" aria-label="Exercise parts">
      ${exercise.parts.map((part, index) => html`
        <a
          class="${route.kind === 'solution' && route.exerciseId === exercise.id && getActivePartIndex(exercise, route) === index ? 'active' : ''}"
          href="${escapeHtml(routeForSolutionPart(week, exercise, index))}"
        >
          <span>Part ${index + 1}</span>
          ${escapeHtml(part.title.replace(/^Part \d+ - /, ''))}
        </a>
      `).join('')}
    </div>
  `;
}

function renderWeekPage(week: CourseWeek): string {
  return html`
    <article class="page-panel">
      <p class="eyebrow">Week ${week.weekNumber} overview</p>
      <div class="page-title-row">
        <div>
          <h2>${escapeHtml(week.title)}</h2>
          <p>${escapeHtml(week.theme)}</p>
        </div>
        <span class="status-pill">${week.status === 'ready' ? 'Ready' : 'Planned'}</span>
      </div>
      <section class="learning-path">
        <h3>How to study this week</h3>
        <div class="path-grid">
          <div><span>1</span><strong>Read the exercise</strong><p>Start with the goal, required tasks, and submission checklist.</p></div>
          <div><span>2</span><strong>Work through each part</strong><p>Use the notebooks only where code is required, and write explanations in your own words.</p></div>
          <div><span>3</span><strong>Compare with the solution</strong><p>Open the solution page after attempting the task, then verify your reasoning.</p></div>
        </div>
      </section>
      ${week.exercises.length > 0 ? html`
        <section class="exercise-index">
          <h3>Exercises</h3>
          ${week.exercises.map((exercise) => renderExerciseSummary(week, exercise)).join('')}
        </section>
      ` : renderComingSoon()}
    </article>
  `;
}

function renderExerciseSummary(week: CourseWeek, exercise: Exercise): string {
  return html`
    <article class="exercise-summary">
      <div>
        <p class="eyebrow">Exercise</p>
        <h3>${escapeHtml(exercise.title)}</h3>
        <p>${escapeHtml(exercise.subtitle)}</p>
      </div>
      <dl class="compact-facts">
        <div><dt>Deadline</dt><dd>${escapeHtml(exercise.deadline)}</dd></div>
        <div><dt>Parts</dt><dd>${exercise.parts.length}</dd></div>
        <div><dt>Solution</dt><dd>${exercise.solution ? 'Available' : 'Not yet'}</dd></div>
      </dl>
      <div class="summary-actions">
        <a href="${escapeHtml(routeForExercise(week, exercise))}" class="primary-action">Open exercise</a>
        ${exercise.solution ? `<a href="${escapeHtml(routeForSolution(week, exercise))}" class="secondary-action">View solution</a>` : ''}
      </div>
    </article>
  `;
}

function renderExercisePage(week: CourseWeek, exercise: Exercise): string {
  return html`
    <article class="page-panel">
      <p class="eyebrow">Week ${week.weekNumber} / Exercise instructions</p>
      <div class="page-title-row">
        <div>
          <h2>${escapeHtml(exercise.title)}</h2>
          <p>${escapeHtml(exercise.subtitle)}</p>
        </div>
        <a href="${escapeHtml(routeForSolution(week, exercise))}" class="secondary-action ${exercise.solution ? '' : 'disabled'}">Solution page</a>
      </div>
      <section class="briefing-grid">
        <div>
          <span class="answer-label">Learning objective</span>
          <p>${escapeHtml(exercise.objective)}</p>
        </div>
        <div>
          <span class="answer-label">Deadline</span>
          <p>${escapeHtml(exercise.deadline)}</p>
        </div>
        <div>
          <span class="answer-label">AI use</span>
          <p>${escapeHtml(exercise.aiPolicy)}</p>
        </div>
      </section>
      <section class="parts-list">
        <h3>Exercise parts</h3>
        ${exercise.parts.map((part, index) => renderExercisePart(part, index)).join('')}
      </section>
      ${renderChecklist('Submission checklist', exercise.deliverables)}
      ${renderFileResources(exercise)}
    </article>
  `;
}

function renderExercisePart(part: ExercisePart, index: number): string {
  return html`
    <section class="part-row">
      <div class="part-marker">Part ${index + 1}</div>
      <div>
        <h4>${escapeHtml(part.title.replace(/^Part \d+ - /, ''))}</h4>
        <p>${escapeHtml(part.summary)}</p>
        <ul>${part.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul>
        ${(part.examples ?? []).map((example) => renderExample(example.title, example.body, example.steps)).join('')}
        ${(part.notes ?? []).map((note) => `<p class="tiny-note">${escapeHtml(note)}</p>`).join('')}
        ${part.notebookFiles ? renderNotebookLinks(part.notebookFiles) : ''}
      </div>
    </section>
  `;
}

function renderSolutionPage(week: CourseWeek, exercise: Exercise): string {
  const solution = exercise.solution;
  if (!solution) {
    return '';
  }
  const route = parseRoute();
  const activePartIndex = getActivePartIndex(exercise, route);
  const activePart = exercise.parts[activePartIndex];

  return html`
    <article class="page-panel">
      <p class="eyebrow">Week ${week.weekNumber} / Part workspace</p>
      <div class="page-title-row">
        <div>
          <h2>${escapeHtml(activePart.title)}</h2>
          <p>Open the question when you want to work, then open the solution when you are ready to compare your answer.</p>
        </div>
        <a href="${escapeHtml(routeForExercise(week, exercise))}" class="secondary-action">Back to exercise</a>
      </div>
      ${renderPartSwitcher(week, exercise, activePartIndex)}
      ${renderPartWorkspace(activePart, activePartIndex, solution)}
    </article>
  `;
}

function getActivePartIndex(exercise: Exercise, route: Route): number {
  if (route.kind !== 'solution' || route.partIndex === undefined) {
    return 0;
  }
  return Math.min(route.partIndex, exercise.parts.length - 1);
}

function renderPartSwitcher(week: CourseWeek, exercise: Exercise, activePartIndex: number): string {
  return html`
    <nav class="part-switcher" aria-label="Part navigation">
      ${exercise.parts.map((part, index) => html`
        <a class="${activePartIndex === index ? 'active' : ''}" href="${escapeHtml(routeForSolutionPart(week, exercise, index))}">
          <span>Part ${index + 1}</span>
          ${escapeHtml(part.title.replace(/^Part \d+ - /, ''))}
        </a>
      `).join('')}
    </nav>
  `;
}

function renderPartWorkspace(part: ExercisePart, partIndex: number, solution: NonNullable<Exercise['solution']>): string {
  return html`
    <section class="part-workspace">
      <details class="accordion-box" open>
        <summary>
          <span>Question</span>
          <strong>${escapeHtml(part.title.replace(/^Part \d+ - /, ''))}</strong>
        </summary>
        <div class="accordion-content">
          ${renderPartQuestionContent(part)}
        </div>
      </details>
      <details class="accordion-box" ${partIndex === 0 ? 'open' : ''}>
        <summary>
          <span>Solution</span>
          <strong>${escapeHtml(getPartSolutionTitle(part, partIndex))}</strong>
        </summary>
        <div class="accordion-content">
          ${renderPartSolutionContent(part, partIndex, solution)}
        </div>
      </details>
    </section>
  `;
}

function renderPartQuestionContent(part: ExercisePart): string {
  return html`
    <p>${escapeHtml(part.summary)}</p>
    <ul>${part.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul>
    ${(part.examples ?? []).map((example) => renderExample(example.title, example.body, example.steps)).join('')}
    ${(part.notes ?? []).map((note) => `<p class="tiny-note">${escapeHtml(note)}</p>`).join('')}
    ${part.notebookFiles ? renderNotebookLinks(part.notebookFiles) : ''}
  `;
}

function getPartSolutionTitle(part: ExercisePart, partIndex: number): string {
  return partIndex === 0 ? 'Word embeddings results' : part.title.replace(/^Part \d+ - /, '');
}

function renderPartSolutionContent(part: ExercisePart, partIndex: number, solution: NonNullable<Exercise['solution']>): string {
  if (partIndex === 0) {
    return renderEmbeddingSolution(solution);
  }

  if (part.solutionBlocks?.length) {
    return part.solutionBlocks.map(renderSolutionBlock).join('');
  }

  return renderLegacySolutionSteps(part.solutionSteps);
}

function renderEmbeddingSolution(solution: NonNullable<Exercise['solution']>): string {
  return html`
    <div class="solution-actions compact">
      ${solution.notebookRunUrl ? `<a class="primary-action" href="${escapeHtml(solution.notebookRunUrl)}" target="_blank" rel="noreferrer">Run notebook in Colab</a>` : ''}
      <a class="${solution.notebookRunUrl ? 'secondary-action' : 'primary-action'}" href="/${escapeHtml(solution.notebookPath)}" download>Download notebook</a>
      <a class="secondary-action" href="/${escapeHtml(solution.notebookPath)}" target="_blank" rel="noreferrer">View notebook file</a>
    </div>
    <section class="briefing-grid compact-grid">
      <div><span class="answer-label">Model</span><p>${escapeHtml(solution.modelName)}</p></div>
      <div><span class="answer-label">Vector length</span><p>${solution.dimensionality}</p></div>
      <div><span class="answer-label">Distance metric</span><p>${escapeHtml(solution.distanceMetric)}</p></div>
    </section>
    <section class="result-summary">
      <h3>Key results</h3>
      <p><strong>Closest:</strong> ${solution.closestPairs.map(formatPair).join(', ')}</p>
      <p><strong>Furthest:</strong> ${solution.furthestPairs.map(formatPair).join(', ')}</p>
    </section>
    ${renderDistanceTable(solution.distances)}
    <section class="thinking-block">
      <h3>Explanation</h3>
      ${solution.explanation.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}
    </section>
  `;
}

function renderSolutionBlock(block: SolutionBlock): string {
  return html`
    <section class="math-solution-block">
      <h5>${escapeHtml(block.heading)}</h5>
      ${block.text ? `<p>${escapeHtml(block.text)}</p>` : ''}
      ${block.matrices?.length ? `<div class="matrix-row">${block.matrices.map(renderMatrix).join('')}</div>` : ''}
      ${block.equations?.length ? html`
        <div class="equation-stack">
          ${block.equations.map((equation) => `<div class="equation-line">${escapeHtml(equation)}</div>`).join('')}
        </div>
      ` : ''}
      ${block.steps?.length ? `<ul>${block.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul>` : ''}
    </section>
  `;
}

function renderMatrix(matrix: MatrixDisplay): string {
  return html`
    <figure class="matrix-display">
      <figcaption>${escapeHtml(matrix.label)}</figcaption>
      <table class="matrix-table" aria-label="${escapeHtml(matrix.label)} matrix">
        <tbody>
          ${matrix.rows.map((row) => html`
            <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </figure>
  `;
}

function renderLegacySolutionSteps(steps?: string[]): string {
  return steps?.length ? `<ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>` : '';
}

function renderDistanceTable(distances: { first: string; second: string; distance: number }[]): string {
  return html`
    <section class="table-wrap" aria-label="Pairwise word distances">
      <h3>Pairwise distances</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Pair</th>
            <th scope="col">Distance</th>
          </tr>
        </thead>
        <tbody>
          ${distances.map((pair) => html`
            <tr>
              <td>${escapeHtml(pair.first)} - ${escapeHtml(pair.second)}</td>
              <td>${pair.distance.toFixed(6)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function renderNoSolutionPage(week: CourseWeek, exercise: Exercise): string {
  return html`
    <article class="page-panel">
      <p class="eyebrow">Week ${week.weekNumber} / Solution</p>
      <h2>Solution is not available yet.</h2>
      <p>Return to the exercise page and complete the assignment using the instructions and resource files.</p>
      <a href="${escapeHtml(routeForExercise(week, exercise))}" class="primary-action">Back to exercise</a>
    </article>
  `;
}

function formatPair(pair: { first: string; second: string; distance: number }): string {
  return `${escapeHtml(pair.first)}-${escapeHtml(pair.second)} (${pair.distance.toFixed(6)})`;
}

function renderExample(title: string, body: string, steps?: string[]): string {
  return html`
    <div class="worked-example">
      <h5>${escapeHtml(title)}</h5>
      <p>${escapeHtml(body)}</p>
      ${steps ? `<ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>` : ''}
    </div>
  `;
}

function renderNotebookLinks(files: string[]): string {
  return html`
    <div class="notebook-links" aria-label="Runnable notebook files">
      ${files.map((file) => `<a href="/${escapeHtml(file)}" download>${escapeHtml(file.split('/').at(-1) ?? file)}</a>`).join('')}
    </div>
  `;
}

function renderChecklist(title: string, items: string[]): string {
  return html`
    <section class="checklist">
      <h3>${escapeHtml(title)}</h3>
      <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </section>
  `;
}

function renderFileResources(exercise: Exercise): string {
  return html`
    <section class="file-resources">
      <h3>Course files</h3>
      <p>Use these files for coding work, written answers, and AI prompt documentation.</p>
      <div class="file-list">
        ${exercise.originalExerciseFile ? `<a href="/${escapeHtml(exercise.originalExerciseFile)}" target="_blank" rel="noreferrer">Original exercise PDF</a>` : ''}
        ${exercise.starterFiles.map((file) => `<a href="/${escapeHtml(file)}" download>${escapeHtml(file)}</a>`).join('')}
      </div>
    </section>
  `;
}

function renderComingSoon(): string {
  return html`
    <section class="empty-week">
      <h3>No exercise published yet</h3>
      <p>This week is reserved for future course material. When an exercise is added, it will appear here with separate instruction and solution pages.</p>
    </section>
  `;
}

function renderAboutSection(): string {
  return html`
    <section class="about-section" id="about">
      <p class="eyebrow">About this site</p>
      <h2>Built as an education-first AI course portfolio.</h2>
      <p>
        The site is organized around student workflow: choose a week, open one exercise, complete the tasks,
        then review the solution separately. New weeks can be added without changing the learning structure.
      </p>
      <div class="about-tags">
        <span>Weekly modules</span>
        <span>Exercise pages</span>
        <span>Separate solutions</span>
        <span>AI prompts documented</span>
      </div>
    </section>
  `;
}

window.addEventListener('hashchange', render);

try {
  if (!window.location.hash) {
    window.location.hash = routeForWeek(courseWeeks[0]);
  } else {
    render();
  }
} catch (error) {
  console.error('[site] render failed', error);
  root.innerHTML = html`
    <main class="app-shell">
      <section class="page-panel error-card" role="alert">
        <p class="eyebrow">Site error</p>
        <h1>AI Course Exercise Lab</h1>
        <p>The course page could not render. Check the browser console for details.</p>
      </section>
    </main>
  `;
}
