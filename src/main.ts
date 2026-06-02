import { courseWeeks } from './course/weeks.js';
import { siteConfig } from './siteConfig.js';
import type { CourseWeek, Exercise } from './course/types.js';

let selectedWeekSlug = courseWeeks[0]?.slug ?? 'week-1';

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

function icon(label: string): string {
  return `<span class="icon" aria-hidden="true">${label}</span>`;
}

function render(): void {
  const selectedWeek = courseWeeks.find((week) => week.slug === selectedWeekSlug) ?? courseWeeks[0];
  const selectedExercise = selectedWeek.exercises[0];

  root.innerHTML = html`
    <main class="app-shell">
      ${renderHero(selectedWeek)}
      <div class="layout-grid">
        ${renderSidebar()}
        <section class="content-stack" aria-live="polite">
          ${renderAboutCard()}
          ${selectedExercise ? renderExerciseCard(selectedExercise) : renderComingSoon(selectedWeek)}
          ${renderRepositoryGuide(selectedExercise)}
        </section>
      </div>
    </main>
  `;

  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-week-slug]')) {
    button.addEventListener('click', () => {
      selectedWeekSlug = button.dataset.weekSlug ?? selectedWeekSlug;
      render();
      document.getElementById('exercise')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function renderHero(selectedWeek: CourseWeek): string {
  return html`
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">${icon('*')} TypeScript / Vercel-ready / AI course notes</p>
        <h1>${escapeHtml(siteConfig.ownerName)} ${escapeHtml(siteConfig.siteTitle)}</h1>
        <p>
          A playful learning hub for weekly AI course exercises, organized so each assignment is easy to find,
          understand, and extend as the course grows. ${escapeHtml(siteConfig.hostingNote)}
        </p>
        <div class="hero-actions">
          <a href="#exercise" class="primary-action">Open ${escapeHtml(selectedWeek.title)} <span aria-hidden="true">-&gt;</span></a>
          <a href="#about" class="secondary-action">About me</a>
        </div>
      </div>
      <div class="hero-orbit" aria-hidden="true">
        <span class="planet planet-one">ML</span>
        <span class="planet planet-two">Ax</span>
        <span class="planet planet-three">01</span>
        <div class="orbit-core">AI</div>
      </div>
    </section>
  `;
}

function renderSidebar(): string {
  return html`
    <aside class="week-nav" aria-label="Course weeks">
      <div class="nav-title">${icon('#')} Weeks</div>
      ${courseWeeks.map((week) => html`
        <button
          class="week-button ${week.slug === selectedWeekSlug ? 'active' : ''}"
          data-week-slug="${escapeHtml(week.slug)}"
          type="button"
        >
          <span>Week ${week.weekNumber}</span>
          <strong>${escapeHtml(week.title)}</strong>
          <small>${escapeHtml(week.theme)}</small>
        </button>
      `).join('')}
    </aside>
  `;
}

function renderAboutCard(): string {
  return html`
    <section class="info-card about-card" id="about">
      <div class="section-heading">
        ${icon('i')}
        <div>
          <p class="eyebrow">Chapter / About me</p>
          <h2>Hi, I am building my AI course portfolio.</h2>
        </div>
      </div>
      <p>
        This website is my friendly course companion: a place to collect weekly exercises, solutions, notebooks,
        and AI-assisted study notes. The tone is intentionally modern and funny because learning linear algebra
        is easier when the matrices have good vibes.
      </p>
      <div class="about-tags">
        <span>Curious learner</span>
        <span>Weekly exercises</span>
        <span>Hosted on Vercel</span>
        <span>AI chat logs included</span>
      </div>
    </section>
  `;
}

function renderExerciseCard(exercise: Exercise): string {
  return html`
    <article class="info-card exercise-card" id="exercise">
      <div class="section-heading">
        ${icon('1')}
        <div>
          <p class="eyebrow">Ready assignment</p>
          <h2>${escapeHtml(exercise.title)}</h2>
        </div>
      </div>
      <p class="subtitle">${escapeHtml(exercise.subtitle)}</p>
      <div class="meta-row">
        <span>Deadline: ${escapeHtml(exercise.deadline)}</span>
        <span>AI allowed, prompts required</span>
      </div>
      <div class="callout"><strong>Goal:</strong> ${escapeHtml(exercise.objective)}</div>
      <div class="callout ai-policy"><strong>AI policy:</strong> ${escapeHtml(exercise.aiPolicy)}</div>
      <div class="parts-grid">
        ${exercise.parts.map((part, index) => html`
          <section class="part-card">
            <div class="part-number">${index + 1}</div>
            <h3>${escapeHtml(part.title)}</h3>
            <p>${escapeHtml(part.summary)}</p>
            <ul>${part.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul>
            ${(part.notes ?? []).map((note) => `<p class="tiny-note">${escapeHtml(note)}</p>`).join('')}
          </section>
        `).join('')}
      </div>
      ${renderChecklist('Submission checklist', exercise.deliverables)}
      ${renderChecklist('Chat log checklist', exercise.chatLogGuidance)}
    </article>
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

function renderComingSoon(week: CourseWeek): string {
  return html`
    <section class="info-card empty-week" id="exercise">
      <p class="eyebrow">Planned</p>
      <h2>${escapeHtml(week.title)}</h2>
      <p>${escapeHtml(week.theme)}</p>
      <p>Drop the next exercise into the course data folder and this page will be ready for another update.</p>
    </section>
  `;
}

function renderRepositoryGuide(exercise?: Exercise): string {
  return html`
    <section class="info-card repo-guide">
      <div class="section-heading">
        ${icon('/')}
        <div>
          <p class="eyebrow">Repository organization</p>
          <h2>Each exercise stays small, readable, and self-explained.</h2>
        </div>
      </div>
      <p>
        Course content lives as typed data under <code>src/course</code>. Add each new exercise as its own file,
        then register it in the week index so the website can navigate to it.
      </p>
      ${exercise ? `<div class="file-list">${exercise.starterFiles.map((file) => `<code>${escapeHtml(file)}</code>`).join('')}</div>` : ''}
    </section>
  `;
}

try {
  render();
} catch (error) {
  console.error('[site] render failed', error);
  root.innerHTML = html`
    <main class="app-shell">
      <section class="info-card error-card" role="alert">
        <p class="eyebrow">Site error</p>
        <h1>AI Course Exercise Lab</h1>
        <p>The course page could not render. Check the browser console for details.</p>
      </section>
    </main>
  `;
}
