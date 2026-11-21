<script>let { eyebrow = '', title = '', intro = '' } = $props();</script>
<section class="page-heading wrap"><p class="eyebrow">{eyebrow}</p><h1 class="line-breaks">{title}</h1>{#if intro}<p>{intro}</p>{/if}</section>
