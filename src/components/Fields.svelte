<script>
  import Fields from './Fields.svelte';
  import Photo from './Photo.svelte';
  import { templates } from '../../lib/content.js';
  let { value, path, change, choose, upload, confirmRemove } = $props();
  const label = key => ({ui:'Section headings & labels',id:'Page ID',image:'Photo',logo:'Sponsor logo',photographerURL:'Photographer link',photoApproved:'Permission to publish this photo confirmed',testimonialApproved:'Permission to publish this quote confirmed',placeholder:'Coming-soon profile',enquiryURL:'Official Google Form',resultsURL:'Full race results link',options:'Race block options',groupImage:'Group photo below coaching steps'}[key] || String(key).replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()));
  const imageField = key => /image$/i.test(key) || key === 'logo';
  const title = (v,i) => typeof v === 'object' && v ? v.name || v.title || v.label || v.event || v.question || v.caption || v.day || `Entry ${i+1}` : `Entry ${i+1}`;
  function add() {const key = path.at(-1); change(path,[...value,templates[key] ? templates[key]() : value.length && typeof value[0] === 'object' ? structuredClone(value[0]) : '']);}
  function reorder(index, offset) {const copy = structuredClone(value); [copy[index],copy[index+offset]] = [copy[index+offset],copy[index]]; change(path,copy);}
  const fieldId = $derived('field-' + path.join('-'));
</script>
{#if Array.isArray(value)}
  <section class="field-collection"><div class="collection-heading"><h3>{label(path.at(-1))}</h3><span>{value.length} entries</span></div>
  {#each value as item, i}<details class="collection-entry"><summary>{title(item,i)}</summary><div class="entry-content"><Fields value={item} path={[...path,i]} {change} {choose} {upload} {confirmRemove}/><div class="entry-actions"><button disabled={i===0} onclick={() => reorder(i,-1)}>Move up</button><button disabled={i===value.length-1} onclick={() => reorder(i,1)}>Move down</button><button class="remove" onclick={() => confirmRemove(() => change(path,value.filter((_,index) => i!==index)))}>Remove entry</button></div></div></details>{/each}
  <button class="editor-button" onclick={add}>Add {label(path.at(-1))}</button></section>
{:else if value && typeof value === 'object'}
  <div class="fields-grid">{#each Object.entries(value) as [key, child]}
    {#if child && typeof child === 'object'}<section class="field-group">{#if !Array.isArray(child)}<h3>{label(key)}</h3>{/if}<Fields value={child} path={[...path,key]} {change} {choose} {upload} {confirmRemove}/></section>
    {:else}<Fields value={child} path={[...path,key]} {change} {choose} {upload} {confirmRemove}/>{/if}
  {/each}</div>
{:else if typeof value === 'boolean'}
  <label class="check-field"><input id={fieldId} type="checkbox" checked={value} onchange={e => change(path,e.currentTarget.checked)}/><span>{label(path.at(-1))}</span></label>
{:else}
  {@const key = path.at(-1)}
  <div class="editor-field" class:full-field={imageField(key) || /text|description|intro|bio|headline|answer|excerpt|testimonial/i.test(key)}><label for={fieldId}>{label(key)}</label>
    {#if /text|description|intro|bio|headline|title|answer|excerpt|testimonial|paragraphs/i.test(key) && !/URL|Approved/i.test(key) && !imageField(key)}<textarea id={fieldId} rows={String(value).length > 200 ? 5 : 3} value={value} oninput={e => change(path,e.currentTarget.value)}></textarea>
    {:else}<input id={fieldId} value={value ?? ''} oninput={e => change(path,e.currentTarget.value)} spellcheck={key !== 'id'}/>{/if}
    {#if key === 'id'}<small>Unique lowercase words joined with hyphens. Keep this stable to preserve the profile link.</small>{/if}
    {#if key === 'testimonial'}<small>Leave empty until the athlete supplies their own quote. Confirm their permission before publishing.</small>{/if}
    {#if key === 'photographer'}<small>Optional. A Photo credit appears only when filled in.</small>{/if}
    {#if imageField(key)}<div class="image-actions"><button onclick={() => choose(path)}>Choose from library</button><label class="upload-label">Upload image<input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onchange={e => {const file=e.currentTarget.files?.[0];if(file) upload(path,file);e.currentTarget.value='';}}/></label></div><small>Upload a JPG, PNG, WebP or SVG under 8 MB, or enter an HTTPS image address. Uploaded images stay in this browser until Publish.</small>{#if value}<div class="editor-image"><Photo src={value} alt="Selected image preview"/></div>{/if}{/if}
  </div>
{/if}
