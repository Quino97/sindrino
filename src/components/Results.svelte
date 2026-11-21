<script>
  import { safeURL } from '../../lib/content.js';
  let { rows = [], copy } = $props();
</script>
{#if rows.length}
<div class="result-overflow"><table class="race-results"><thead><tr><th>{copy.event}</th><th>{copy.date}</th><th>{copy.result}</th></tr></thead><tbody>
{#each rows as r}<tr><td><strong>{r.event}</strong><small>{r.distance}</small></td><td>{r.date}</td><td>{#if safeURL(r.link)}<a class="result-source" href={safeURL(r.link)} target="_blank" rel="noopener noreferrer">{r.result}</a>{:else}{r.result}{/if}</td></tr>{/each}
</tbody></table></div>
{:else}<div class="quiet-state"><h3>{copy.emptyTitle}</h3><p>{copy.emptyText}</p></div>{/if}
