<script>
  import Photo from './Photo.svelte';
  import { athleteInitials, isPlaceholder } from '../../lib/athletes.js';
  let { athlete: a, copy } = $props();
</script>
{#if a.image && a.photoApproved}<Photo src={a.image} alt={a.imageAlt || a.name}/>{:else}<div class:is-placeholder={isPlaceholder(a)} class="athlete-avatar"><div class="avatar-ridges"></div><span class="athlete-monogram" aria-hidden="true">{isPlaceholder(a) ? 'S' : athleteInitials(a.name)}</span><span class="avatar-caption">{isPlaceholder(a) ? copy.storyPending : copy.photoPending}</span></div>{/if}
