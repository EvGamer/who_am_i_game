<script>
  const { children, ...props } = $props();
</script>

<button {...props}>{@render children()}</button>

<style>
  button {
    color: var(--primary-text-color);
    background-color: var(--primary-bg-color);
    border: none;
    border-radius: 0;
    padding: var(--default-v-margin) 12px;
    font-size: 24px;
    cursor: pointer;
    
  }

  button:hover {
    background-color: hsl(from var(--primary-bg-color) h s calc(l * 1.2))
  }
</style>