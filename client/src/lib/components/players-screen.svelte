<script>
  import Screen from "./screen.svelte";
  import Content from "./content.svelte";

  const { players, children, isGameStarted } = $props(); 
</script>

<Screen footer={children}>
  {#snippet header()}Игроки{/snippet}
  <Content class="players">
    {#each players as player}
      <div class="row">
        <div class="cell">{player.name}</div>
        {#if isGameStarted}
          <div class="cell">{player.character}</div>
        {:else}
          <div class="cell">Готов</div>
        {/if}
      </div>
    {/each}
  </Content>
</Screen>

<style>
  .players {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: min-content;
    gap: 2px;
  }

  .row {
    display: contents;
  }

  .row:nth-child(2n) .cell {
    background-color: hsl(from var(--inset-bg-color) h s calc(l * 0.9));
  }

  .cell {
    padding: 4px 12px;
  }
</style>