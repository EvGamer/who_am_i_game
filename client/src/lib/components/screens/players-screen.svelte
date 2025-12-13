<script>
  import Screen from "./screen.svelte";
  import Content from "../ui/content.svelte";
  import Cog from "../icons/cog.svelte";

  const { players, children, isGameStarted, firstPlayerName, editPlayer } = $props(); 
</script>

<Screen footer={children}>
  {#snippet header()}Игроки{/snippet}
  <Content>
    <div class="players">
      {#each players as player (player.id)}
        <div class="row">
          <div class="cell">{player.name}</div>
          {#if isGameStarted}
            <div class="cell name-cell">
              <div class="name">{player.character}</div>
              <Cog
                class="icon"
                role="button"
                tab-index="0"
                onclick={() => editPlayer(player)}
              />
            </div>
          {:else}
            <div class="cell">Готов</div>
          {/if}
        </div>
      {/each}
      {#if isGameStarted && firstPlayerName}
        <div class="row">
          <div class="cell">Первым ходит:</div>
          <div class="cell">{firstPlayerName}</div>
        </div>
      {/if}
    </div>
  </Content>
</Screen>

<style>
  .players {
    width: 100%;
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

  .name-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .name {
    flex: 1;
  }

  .cell :global(.icon) {
    height: 1em;
    width: 1em;
    cursor: pointer;
    padding: 2px;
  }

  .cell :global(.icon):hover {
    background-color: hsl(from var(--inset-bg-color) h s calc(l * 1.3));
  }
</style>