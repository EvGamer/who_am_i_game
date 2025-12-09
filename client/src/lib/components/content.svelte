<script>
  const props = $props();
</script>

<section class={["content", props.class]}>
  {@render props.children()}
</section>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--inset-bg-color);
    flex: 1;
  }
</style>