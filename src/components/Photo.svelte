<script>
  import { safeURL } from '../../lib/content.js';
  import { resolveImage } from '../../lib/media.js';
  let { src, alt = '', class: className = '', eager = false, photographer = '', photographerURL = '', prefix = 'Photo: ', position = '' } = $props();
  let resolved = $state('');
  $effect(() => {let active = true; resolved = safeURL(src, {image:true}); resolveImage(src).then(value => {if(active) resolved = value;}); return () => active = false;});
</script>
{#if safeURL(src, { image: true })}
  <img class={className} src={resolved || safeURL(src, { image: true })} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" style:object-position={position || undefined} />
{/if}
{#if photographer}
  <p class="photo-credit">{prefix}{#if safeURL(photographerURL)}<a href={safeURL(photographerURL)} target="_blank" rel="noopener noreferrer">{photographer}</a>{:else}{photographer}{/if}</p>
{/if}
