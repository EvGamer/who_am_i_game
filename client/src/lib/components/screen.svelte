<script>
  const { children, header, footer } = $props();
</script>

<article class="screen">
  <header>{@render header()}</header>
  {@render children()}
  <footer>{@render footer()}</footer>
</article>

<style>
  .screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
  }
  
  header {
    position: sticky;
    top: 0;
    min-height: 50px;

    font-weight: 500;
    padding: 8px 12px;
    text-align: center;
    font-size: 24px;

    font-weight: 500;
  }

  footer {
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
    background-color: var(--bg-color);
    display: flex;
    justify-content: center;
    gap: 16px;
    height: 64px;
    box-sizing: border-box;
    padding: var(--default-v-margin) 16px;
  }
</style>