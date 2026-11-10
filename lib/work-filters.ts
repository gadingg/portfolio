import { workKinds, workLabels, type WorkKind } from './works';

export function workFiltersHTML(selected: WorkKind | 'all' = 'all', homepage = false) {
  return `<div class="work-explorer" data-work-filters>
    <div class="work-filter-options" role="group" aria-label="Filter portfolio by category">
      ${(['all', ...workKinds] as const).map(kind => `<button type="button" class="work-filter"${homepage && kind !== 'all' ? ` id="${{webapp:'web-apps',design:'visuals',video:'videos'}[kind]}"` : ''} data-filter-kind="${kind}" aria-controls="portfolio-results" aria-pressed="${selected === kind}" disabled>${kind === 'all' ? 'All' : workLabels[kind]}</button>`).join('')}
    </div>
    ${homepage ? '' : '<label class="work-search"><span>Search portfolio</span><input type="search" data-work-search placeholder="Search by title or topic…" maxlength="150" autocomplete="off" aria-controls="portfolio-results" disabled/></label>'}
    <p class="work-filter-status${homepage ? ' sr-only' : ''}" role="status" aria-live="polite" aria-atomic="true" data-filter-status></p>
  </div>`;
}
