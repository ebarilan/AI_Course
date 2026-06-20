import { courseWeeks } from './course/weeks.js';
import { siteConfig } from './siteConfig.js';
import {
  calculatePopulationHistory,
  clampPopulationValue,
  type PopulationPoint,
} from './course/populationDynamics.js';
import { calculateReflectingWalkSnapshots } from './course/markovChains.js';
import type { CourseWeek, Exercise, ExercisePart, MatrixDisplay, SolutionBlock } from './course/types.js';

type Route =
  | { kind: 'week'; weekSlug: string }
  | { kind: 'exercise'; weekSlug: string; exerciseId: string; partIndex?: number };

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

function routeForExercisePart(week: CourseWeek, exercise: Exercise, partIndex: number): string {
  return `${routeForExercise(week, exercise)}/part/${partIndex + 1}`;
}

function parseRoute(): Route {
  const fallbackWeek = courseWeeks[0]?.slug ?? 'week-1';
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [, weekSlug = fallbackWeek, section, exerciseId, maybePartOrSolution, maybePartNumberOrPart, maybeLegacyPartNumber] = parts;
  const weekExists = courseWeeks.some((week) => week.slug === weekSlug);
  const safeWeekSlug = weekExists ? weekSlug : fallbackWeek;
  const partNumber = maybePartOrSolution === 'solution' ? maybeLegacyPartNumber : maybePartNumberOrPart;
  const parsedPartIndex = (maybePartOrSolution === 'part' || maybePartNumberOrPart === 'part') && partNumber
    ? Number(partNumber) - 1
    : undefined;
  const partIndex = parsedPartIndex !== undefined && Number.isInteger(parsedPartIndex) && parsedPartIndex >= 0
    ? parsedPartIndex
    : undefined;

  if (section === 'exercise' && exerciseId) {
    return { kind: 'exercise', weekSlug: safeWeekSlug, exerciseId, partIndex };
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

  initializePopulationSimulator();
  initializeMarkovDiffusionVisualization();
}

function renderRouteContent(week: CourseWeek, exercise: Exercise | undefined, route: Route): string {
  if (route.kind === 'exercise' && exercise) {
    return hasExerciseWorkspace(exercise) ? renderExercisePage(week, exercise) : renderExerciseUnavailablePage(week, exercise);
  }

  return renderWeekPage(week);
}

function hasExerciseWorkspace(exercise: Exercise): boolean {
  return Boolean(
    exercise.solution
      || exercise.notebook
      || exercise.parts.some((part) => part.solutionBlocks?.length || part.solutionSteps?.length),
  );
}

function renderHeader(week: CourseWeek, exercise: Exercise | undefined, route: Route): string {
  const pageLabel = route.kind === 'exercise' ? 'Exercise page' : 'Week overview';
  const nextLink = exercise ? routeForExercise(week, exercise) : routeForWeek(week);

  return html`
    <header class="course-header">
      <div class="header-copy">
        <p class="eyebrow">AI course workspace</p>
        <h1>${escapeHtml(siteConfig.siteTitle)}</h1>
        <p>
          A structured learning site for weekly AI exercises. Each exercise keeps the question and solution
          together in one focused workspace.
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
          class="${route.kind === 'exercise' && route.exerciseId === exercise.id && getActivePartIndex(exercise, route) === index ? 'active' : ''}"
          href="${escapeHtml(routeForExercisePart(week, exercise, index))}"
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
          <div><span>3</span><strong>Compare with the solution</strong><p>Open each part's solution box after attempting the task, then verify your reasoning.</p></div>
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
        <div><dt>Workspace</dt><dd>${hasExerciseWorkspace(exercise) ? 'Ready' : 'Not yet'}</dd></div>
      </dl>
      <div class="summary-actions">
        <a href="${escapeHtml(routeForExercise(week, exercise))}" class="primary-action">Open exercise</a>
      </div>
    </article>
  `;
}

function renderExercisePage(week: CourseWeek, exercise: Exercise): string {
  const route = parseRoute();
  const activePartIndex = getActivePartIndex(exercise, route);
  const activePart = exercise.parts[activePartIndex];

  return html`
    <article class="page-panel">
      <p class="eyebrow">Week ${week.weekNumber} / Exercise workspace</p>
      <div class="page-title-row">
        <div>
          <h2>${escapeHtml(activePart.title)}</h2>
          <p>The solution is open by default. Open the question box when you want to review the prompt.</p>
        </div>
        <a href="${escapeHtml(routeForWeek(week))}" class="secondary-action">Back to week</a>
      </div>
      ${renderPartSwitcher(week, exercise, activePartIndex)}
      ${exercise.notebook ? renderNotebookResource(exercise.notebook) : ''}
      ${exercise.id === 'exercise-2-population-dynamics' ? renderPopulationSimulator() : ''}
      ${exercise.id === 'exercise-3-markov-chains' ? renderMarkovDiffusionVisualization() : ''}
      ${renderFileResources(exercise)}
      ${renderPartWorkspace(activePart, activePartIndex, exercise)}
    </article>
  `;
}

function getActivePartIndex(exercise: Exercise, route: Route): number {
  if (route.kind !== 'exercise' || route.partIndex === undefined) {
    return 0;
  }
  return Math.min(route.partIndex, exercise.parts.length - 1);
}

function renderPartSwitcher(week: CourseWeek, exercise: Exercise, activePartIndex: number): string {
  return html`
    <nav class="part-switcher" aria-label="Part navigation">
      ${exercise.parts.map((part, index) => html`
        <a class="${activePartIndex === index ? 'active' : ''}" href="${escapeHtml(routeForExercisePart(week, exercise, index))}">
          <span>Part ${index + 1}</span>
          ${escapeHtml(part.title.replace(/^Part \d+ - /, ''))}
        </a>
      `).join('')}
    </nav>
  `;
}

function renderPartWorkspace(part: ExercisePart, partIndex: number, exercise: Exercise): string {
  return html`
    <section class="part-workspace">
      <details class="accordion-box">
        <summary>
          <span>Question</span>
          <strong>${escapeHtml(part.title.replace(/^Part \d+ - /, ''))}</strong>
        </summary>
        <div class="accordion-content">
          ${renderPartQuestionContent(part)}
        </div>
      </details>
      <details class="accordion-box" open>
        <summary>
          <span>Solution</span>
          <strong>${escapeHtml(getPartSolutionTitle(part, partIndex))}</strong>
        </summary>
        <div class="accordion-content">
          ${renderPartSolutionContent(part, partIndex, exercise)}
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
  return partIndex === 0 && part.title.includes('Word Embeddings')
    ? 'Word embeddings results'
    : part.title.replace(/^Part \d+ - /, '');
}

function renderPartSolutionContent(part: ExercisePart, partIndex: number, exercise: Exercise): string {
  if (partIndex === 0 && exercise.solution) {
    return renderEmbeddingSolution(exercise.solution);
  }

  if (part.solutionBlocks?.length) {
    return part.solutionBlocks.map(renderSolutionBlock).join('');
  }

  return renderLegacySolutionSteps(part.solutionSteps);
}

function renderNotebookResource(notebook: NonNullable<Exercise['notebook']>): string {
  return html`
    <section class="result-summary">
      <span class="answer-label">Runnable notebook</span>
      <h3>${escapeHtml(notebook.title)}</h3>
      ${notebook.description ? `<p>${escapeHtml(notebook.description)}</p>` : ''}
      <div class="solution-actions compact">
        ${notebook.runUrl ? `<a class="primary-action" href="${escapeHtml(notebook.runUrl)}" target="_blank" rel="noreferrer">Run notebook in Colab</a>` : ''}
        <a class="${notebook.runUrl ? 'secondary-action' : 'primary-action'}" href="/${escapeHtml(notebook.path)}" download>Download notebook</a>
        <a class="secondary-action" href="/${escapeHtml(notebook.path)}" target="_blank" rel="noreferrer">View notebook file</a>
      </div>
    </section>
  `;
}

function renderPopulationSimulator(): string {
  const controls = [
    { id: 'algae', label: 'Algae', value: 10, color: '#198754' },
    { id: 'small-fish', label: 'Small fish', value: 20, color: '#2563eb' },
    { id: 'large-fish', label: 'Large fish', value: 4, color: '#d97706' },
  ];

  return html`
    <section class="population-simulator" data-population-simulator>
      <div class="simulator-heading">
        <div>
          <span class="answer-label">Interactive simulator</span>
          <h3>Explore the first 30 years</h3>
          <p>Type a starting value or move its slider. The graph updates immediately using the exercise transition matrix.</p>
        </div>
        <button class="secondary-action simulator-reset" type="button" data-simulator-reset>Reset values</button>
      </div>
      <div class="simulator-layout">
        <div class="population-controls">
          ${controls.map((control, index) => html`
            <div class="population-control" style="--series-color: ${control.color}">
              <label for="${control.id}-number">
                <span class="series-dot" aria-hidden="true"></span>
                ${control.label}
              </label>
              <div class="population-input-row">
                <input
                  id="${control.id}-number"
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                  value="${control.value}"
                  data-population-number="${index}"
                  aria-label="${control.label} starting population"
                >
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="1"
                  value="${control.value}"
                  data-population-range="${index}"
                  aria-label="${control.label} starting population slider"
                >
              </div>
            </div>
          `).join('')}
          <div class="simulator-readout" aria-live="polite">
            <div><span>Starting total</span><strong data-starting-total>34</strong></div>
            <div><span>Year 30</span><strong data-year-30-summary>11.33 / 11.33 / 11.33</strong></div>
          </div>
        </div>
        <figure class="population-chart">
          <svg
            viewBox="0 0 760 390"
            role="img"
            aria-labelledby="population-chart-title population-chart-description"
            data-population-chart
          ></svg>
          <figcaption>
            <span><i style="--series-color: #198754"></i>Algae</span>
            <span><i style="--series-color: #2563eb"></i>Small fish</span>
            <span><i style="--series-color: #d97706"></i>Large fish</span>
          </figcaption>
        </figure>
      </div>
    </section>
  `;
}

function initializePopulationSimulator(): void {
  const simulator = root.querySelector<HTMLElement>('[data-population-simulator]');
  if (!simulator) {
    return;
  }

  const numberInputs = Array.from(simulator.querySelectorAll<HTMLInputElement>('[data-population-number]'));
  const rangeInputs = Array.from(simulator.querySelectorAll<HTMLInputElement>('[data-population-range]'));
  const resetButton = simulator.querySelector<HTMLButtonElement>('[data-simulator-reset]');
  const initialValues: PopulationPoint = [10, 20, 4];

  const update = (): void => {
    const startingVector = numberInputs.map((input) => clampPopulationValue(input.value)) as PopulationPoint;
    numberInputs.forEach((input, index) => {
      input.value = String(startingVector[index]);
      rangeInputs[index].value = String(startingVector[index]);
    });
    drawPopulationChart(simulator, startingVector);
  };

  numberInputs.forEach((input) => {
    input.addEventListener('input', update);
  });

  rangeInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      numberInputs[index].value = input.value;
      update();
    });
  });

  resetButton?.addEventListener('click', () => {
    numberInputs.forEach((input, index) => {
      input.value = String(initialValues[index]);
    });
    update();
  });

  update();
}

function drawPopulationChart(simulator: HTMLElement, startingVector: PopulationPoint): void {
  const chart = simulator.querySelector<SVGSVGElement>('[data-population-chart]');
  const startingTotal = simulator.querySelector<HTMLElement>('[data-starting-total]');
  const year30Summary = simulator.querySelector<HTMLElement>('[data-year-30-summary]');
  if (!chart || !startingTotal || !year30Summary) {
    return;
  }

  const history = calculatePopulationHistory(startingVector);
  const year30 = history[29];
  const colors = ['#198754', '#2563eb', '#d97706'];
  const labels = ['Algae', 'Small fish', 'Large fish'];
  const width = 760;
  const height = 390;
  const margin = { top: 34, right: 24, bottom: 52, left: 64 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const largestValue = Math.max(1, ...history.flat());
  const yMaximum = Math.ceil(largestValue / 10) * 10;
  const xForYear = (yearIndex: number): number => margin.left + (yearIndex / 29) * plotWidth;
  const yForValue = (value: number): number => margin.top + plotHeight - (value / yMaximum) * plotHeight;
  const yTicks = Array.from({ length: 6 }, (_, index) => (yMaximum / 5) * index);
  const xTicks = [0, 4, 9, 14, 19, 24, 29];

  const gridLines = yTicks.map((tick) => {
    const y = yForValue(tick);
    return html`
      <line class="chart-grid-line" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>
      <text class="chart-axis-label" x="${margin.left - 12}" y="${y + 4}" text-anchor="end">${formatChartValue(tick)}</text>
    `;
  }).join('');

  const yearLabels = xTicks.map((yearIndex) => {
    const x = xForYear(yearIndex);
    return html`
      <line class="chart-tick" x1="${x}" y1="${height - margin.bottom}" x2="${x}" y2="${height - margin.bottom + 6}"></line>
      <text class="chart-axis-label" x="${x}" y="${height - margin.bottom + 24}" text-anchor="middle">${yearIndex + 1}</text>
    `;
  }).join('');

  const series = colors.map((color, speciesIndex) => {
    const points = history
      .map((values, yearIndex) => `${xForYear(yearIndex).toFixed(2)},${yForValue(values[speciesIndex]).toFixed(2)}`)
      .join(' ');
    const finalX = xForYear(29);
    const finalY = yForValue(year30[speciesIndex]);
    return html`
      <polyline class="population-series" points="${points}" style="--series-color: ${color}"></polyline>
      <circle class="population-series-point" cx="${finalX}" cy="${finalY}" r="4" style="--series-color: ${color}"></circle>
    `;
  }).join('');

  const description = labels
    .map((label, index) => `${label} starts at ${formatChartValue(startingVector[index])} and reaches ${year30[index].toFixed(2)} in Year 30`)
    .join('. ');

  chart.innerHTML = html`
    <title id="population-chart-title">Lake population distribution over 30 years</title>
    <desc id="population-chart-description">${escapeHtml(description)}.</desc>
    <text class="chart-title" x="${margin.left}" y="20">Population by year</text>
    ${gridLines}
    <line class="chart-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
    <line class="chart-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
    ${yearLabels}
    ${series}
    <text class="chart-axis-title" x="${margin.left + plotWidth / 2}" y="${height - 8}" text-anchor="middle">Year</text>
    <text class="chart-axis-title" x="16" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 16 ${margin.top + plotHeight / 2})">Population</text>
  `;

  startingTotal.textContent = formatChartValue(startingVector.reduce((sum, value) => sum + value, 0));
  year30Summary.textContent = year30.map((value) => value.toFixed(2)).join(' / ');
}

function formatChartValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function renderMarkovDiffusionVisualization(): string {
  return html`
    <section class="markov-diffusion" data-markov-diffusion>
      <div class="simulator-heading">
        <div>
          <span class="answer-label">Part D visualization</span>
          <h3>100-state signal diffusion</h3>
          <p>The same transition rule from Part A spreads a single middle-state spike into a wider distribution.</p>
        </div>
        <div class="diffusion-stats" aria-live="polite">
          <span>Peak at t = 500</span>
          <strong data-diffusion-peak>0.000</strong>
        </div>
      </div>
      <figure class="diffusion-chart">
        <svg
          viewBox="0 0 760 390"
          role="img"
          aria-labelledby="diffusion-chart-title diffusion-chart-description"
          data-diffusion-chart
        ></svg>
        <figcaption>
          <span><i style="--series-color: #111827"></i>t = 0</span>
          <span><i style="--series-color: #198754"></i>t = 50</span>
          <span><i style="--series-color: #d97706"></i>t = 100</span>
          <span><i style="--series-color: #be123c"></i>t = 500</span>
        </figcaption>
      </figure>
    </section>
  `;
}

function initializeMarkovDiffusionVisualization(): void {
  const visualization = root.querySelector<HTMLElement>('[data-markov-diffusion]');
  if (!visualization) {
    return;
  }

  const chart = visualization.querySelector<SVGSVGElement>('[data-diffusion-chart]');
  const peakReadout = visualization.querySelector<HTMLElement>('[data-diffusion-peak]');
  if (!chart || !peakReadout) {
    return;
  }

  const snapshots = calculateReflectingWalkSnapshots();
  const colors = ['#111827', '#198754', '#d97706', '#be123c'];
  const width = 760;
  const height = 390;
  const margin = { top: 34, right: 24, bottom: 52, left: 64 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const yMaximum = Math.max(...snapshots.flatMap((snapshot) => snapshot.values)) * 1.08;
  const xForState = (stateIndex: number): number => margin.left + (stateIndex / 99) * plotWidth;
  const yForValue = (value: number): number => margin.top + plotHeight - (value / yMaximum) * plotHeight;
  const yTicks = Array.from({ length: 6 }, (_, index) => (yMaximum / 5) * index);
  const xTicks = [0, 24, 49, 74, 99];

  const gridLines = yTicks.map((tick) => {
    const y = yForValue(tick);
    return html`
      <line class="chart-grid-line" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>
      <text class="chart-axis-label" x="${margin.left - 12}" y="${y + 4}" text-anchor="end">${tick.toFixed(3)}</text>
    `;
  }).join('');

  const stateLabels = xTicks.map((stateIndex) => {
    const x = xForState(stateIndex);
    return html`
      <line class="chart-tick" x1="${x}" y1="${height - margin.bottom}" x2="${x}" y2="${height - margin.bottom + 6}"></line>
      <text class="chart-axis-label" x="${x}" y="${height - margin.bottom + 24}" text-anchor="middle">${stateIndex + 1}</text>
    `;
  }).join('');

  const series = snapshots.map((snapshot, snapshotIndex) => {
    const points = snapshot.values
      .map((value, stateIndex) => `${xForState(stateIndex).toFixed(2)},${yForValue(value).toFixed(2)}`)
      .join(' ');
    return html`
      <polyline
        class="diffusion-series"
        points="${points}"
        style="--series-color: ${colors[snapshotIndex]}"
      ></polyline>
    `;
  }).join('');

  const finalSnapshot = snapshots.at(-1);
  const peak = finalSnapshot ? Math.max(...finalSnapshot.values) : 0;
  peakReadout.textContent = peak.toFixed(4);

  chart.innerHTML = html`
    <title id="diffusion-chart-title">100-state Markov diffusion snapshots</title>
    <desc id="diffusion-chart-description">Probability by state for t equals 0, 50, 100, and 500.</desc>
    <text class="chart-title" x="${margin.left}" y="20">Probability by state</text>
    ${gridLines}
    <line class="chart-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
    <line class="chart-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
    ${stateLabels}
    ${series}
    <text class="chart-axis-title" x="${margin.left + plotWidth / 2}" y="${height - 8}" text-anchor="middle">State</text>
    <text class="chart-axis-title" x="16" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 16 ${margin.top + plotHeight / 2})">Probability</text>
  `;
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

function renderExerciseUnavailablePage(week: CourseWeek, exercise: Exercise): string {
  return html`
    <article class="page-panel">
      <p class="eyebrow">Week ${week.weekNumber} / Exercise</p>
      <h2>Exercise workspace is not available yet.</h2>
      <p>The exercise exists, but the interactive question and solution workspace has not been published yet.</p>
      <a href="${escapeHtml(routeForWeek(week))}" class="primary-action">Back to week</a>
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
      <p>This week is reserved for future course material. When an exercise is added, it will appear here as one workspace with question and solution boxes.</p>
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
        then review the solution in the same workspace. New weeks can be added without changing the learning structure.
      </p>
      <div class="about-tags">
        <span>Weekly modules</span>
        <span>Exercise pages</span>
        <span>Question and solution boxes</span>
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
