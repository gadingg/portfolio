import { workKinds, workLabels, type WorkKind } from './works';

export function workFiltersHTML(selected: WorkKind | 'all' = 'all') {
  return `<div class="work-explorer" data-work-filters>
    <div class="work-filter-options" role="group" aria-label="Filter kategori portofolio">
      ${(['all', ...workKinds] as const).map(kind => `<button type="button" class="work-filter" data-filter-kind="${kind}" aria-pressed="${selected === kind}" disabled>${kind === 'all' ? 'All' : workLabels[kind]}</button>`).join('')}
    </div>
    <label class="work-search"><span>Cari portofolio</span><input type="search" data-work-search placeholder="Cari judul atau topik…" maxlength="150" autocomplete="off" aria-controls="portfolio-results" disabled/></label>
    <p class="work-filter-status" role="status" aria-live="polite" aria-atomic="true" data-filter-status></p>
  </div>`;
}
