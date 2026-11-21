<script>
  import Photo from './Photo.svelte';
  let { article: a, read } = $props();
</script>
<a class="article-card" href={'#/journal/' + a.id}><div class="article-image"><Photo src={a.image} alt={a.imageAlt || a.title}/></div><div class="article-meta"><span>{a.category}</span><span>{a.readTime} {read}</span></div><h3>{a.title}</h3><p>{a.excerpt}</p></a>
