<script>
  const { children } = $props();
</script>

<div class="form">{@render children()}</div>

<style>
  .form {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    padding: var(--default-v-margin) 15px;
    gap: var(--default-v-margin);
  }
</style>