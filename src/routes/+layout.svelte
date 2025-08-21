<script>
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { BottomSheet } from 'm3-svelte';
  let open = $state(false);
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<button
  class="ceobe-trigger"
  aria-label="Open bottom sheet"
  type="button"
  onclick={() => {
    console.log('ceobe trigger clicked');
    open = true;
  }}
>
  :3
  <span class="sr-only">Open bottom sheet</span>
</button>

{#if open}
  <BottomSheet close={() => (open = false)}>
    <div class="sheet-content">
      <img src="/ceobe.gif" alt="Ceobe" class="sheet-image" />
    </div>
  </BottomSheet>
{/if}

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .ceobe-trigger {
    position: fixed;
    right: 10px;
    bottom: 10px;
    z-index: 9999;
    background: transparent;
    color: currentColor;
    border: none;
    font-size: 16px;
    line-height: 1;
    opacity: 0.1;
    cursor: pointer;
    padding: 10px;
    border-radius: 6px;
    transition: opacity 0.15s ease;
    pointer-events: auto;
  }
  .ceobe-trigger:hover {
    opacity: 0.35;
  }

  .sheet-content {
    padding: 1rem;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sheet-image {
    max-width: min(520px, 90vw);
    max-height: 55vh;
    border-radius: 12px;
  }
</style>
