<script>
  const { index, activeIndex = $bindable(), drop } = $props();

  const handleDragOver = (event) => {
    const activeIndex = index;
    event.preventDefault();
  }
</script>

<div
  class="drop-edge"
  class:active={index === activeIndex}
  ondragover={handleDragOver}
  role="listitem"
></div>

<style>
  .drop-edge {
    height: 2px;
    width: 100%;
    grid-column: 1 / span --columns;
  }

  .active {
    height: 40px;
  }
</style>