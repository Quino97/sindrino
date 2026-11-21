<script>
  import { onMount } from 'svelte';
  let { titleId, close, children, compact = false } = $props();
  let dialog;
  onMount(() => {dialog.showModal();return () => dialog.close();});
</script>
<dialog bind:this={dialog} class="editor-dialog" class:confirmation={compact} aria-labelledby={titleId} oncancel={e => {e.preventDefault();close();}}>
  {@render children()}
</dialog>
