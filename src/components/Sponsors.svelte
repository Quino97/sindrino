<script>
  import { safeURL } from '../../lib/content.js';
  import Photo from './Photo.svelte';
  let { sponsors, copy } = $props();
</script>
{#if sponsors.length}
<section class="partners continuous-partners" aria-label={copy.label}>
  <p>{copy.lineOne}<br/><strong>{copy.lineTwo}</strong></p>
  <div class="partner-window"><div class="partner-track">
    {#each [false, true] as duplicate}<div class="partner-group" aria-hidden={duplicate ? 'true' : undefined}>
      {#each sponsors as s}<a href={safeURL(s.url) || '#/'} data-partner={s.name.toLowerCase()} target="_blank" rel="noopener noreferrer" tabindex={duplicate ? -1 : undefined}><Photo src={s.logo} alt={s.name}/></a>{/each}
    </div>{/each}
  </div></div>
</section>{/if}
