<script>
  import { safeURL } from '../../lib/content.js';
  import { onMount } from 'svelte';
  import Photo from './Photo.svelte';
  let { sponsors, copy } = $props();
  let paused = $state(false);
  onMount(() => { paused = matchMedia('(prefers-reduced-motion: reduce)').matches; });
</script>
{#if sponsors.length}
<section class:paused class="partners" aria-label={copy.label}>
  <p>{copy.lineOne}<br/><strong>{copy.lineTwo}</strong></p>
  <div class="partner-window"><div class="partner-track">
    {#each [false, true] as duplicate}<div class="partner-group" aria-hidden={duplicate ? 'true' : undefined}>
      {#each sponsors as s}<a href={safeURL(s.url) || '#/'} data-partner={s.name.toLowerCase()} target="_blank" rel="noopener noreferrer" tabindex={duplicate ? -1 : undefined}><Photo src={s.logo} alt={s.name}/></a>{/each}
    </div>{/each}
  </div></div>
  <button class="motion-toggle" aria-label={paused ? 'Play sponsor animation' : 'Pause sponsor animation'} onclick={() => paused = !paused}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">{#if paused}<path d="m9 5 10 7-10 7Z"/>{:else}<path d="M8 5v14M16 5v14"/>{/if}</svg>
  </button>
</section>{/if}
