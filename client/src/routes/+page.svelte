<script>
  import { PUBLIC_HOST } from "$env/static/public";
  import { onMount, onDestroy } from "svelte";

  const CURRENT_PLAYER_NAME_STORAGE = "current_player_name"; 

  let currentPlayerName = $state("");
  let characterSuggestion = $state("");
  let message = $state("standing by");
  let players = $state([]);
  const otherPlayers = $derived(players.filter((player) => player.name !== currentPlayerName));
  const isCharacterSuggested = $derived(
    players.some((player) => player.name === currentPlayerName && player.characterSuggestion)
  )
  let isGameStarted = $state(false);
  $inspect(players);


  let socket = null;

  onMount(() => {
    currentPlayerName = window.localStorage.getItem(CURRENT_PLAYER_NAME_STORAGE);
    console.log(currentPlayerName);

    const hostname = window.location.hostname;
    socket = new WebSocket(`http://${hostname}/api/`);

    socket.addEventListener("message", (event) => {
      const { type, payload } = JSON.parse(event.data);
      console.log("message", type, payload)
      switch (type) {
        case "game_state_changed":
          players = payload.players;
          isGameStarted = payload.isStarted;
          break;
        default:
          break;
      }
    });
  });

  onDestroy(() => {
    socket?.close();
  })

  const submitSuggestion = () => {
    window.localStorage.setItem(CURRENT_PLAYER_NAME_STORAGE, currentPlayerName);

    socket.send(JSON.stringify({
      type: "character_submitted",
      payload: {
        name: currentPlayerName,
        character: characterSuggestion,
      },
    }));
  };

  const startGame = () => {
    socket.send(JSON.stringify({
      type: "game_started",
    }))
  };

  const resetGame = () => {
    socket.send(JSON.stringify({
      type: "game_reset",
    }))
  }
</script>

<div class="screen">
  <div class="content">
    {#if isCharacterSuggested}
      <article>
        <h3>Игроки</h3>
        <section class="players">
          {#each otherPlayers as player (player.name)}
            <div class="row">
              <div class="cell">{player.name}</div>
              {#if isGameStarted}
                <div class="cell">{player.character}</div>
              {:else}
                <div class="cell">Готов</div>
              {/if}
            </div>
          {/each}
        </section>
        {#if isGameStarted}
          <button on:click={resetGame}>Начать заново</button>
        {:else}
          <button on:click={startGame}>Начать</button>
        {/if}
      </article>
    {:else}
      <article>
        <h3>Введите ваше имя и персонажа</h3>
        <div class="field">
          <label for="player">Имя</label>
          <input name="player" bind:value={currentPlayerName} />
        </div>
        <div class="field">
          <label for="character">Персонаж</label>
          <input name="character" bind:value={characterSuggestion} />
        </div>
        <button on:click={submitSuggestion}>Предложить персонажа</button>
      </article>
    {/if}
  </div>
</div>

<style>
  .screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .content {
    max-width: 400px;
    width: 100%;
  }

  .players {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: auto;
    gap: 2px;
  }

  .players .row {
    display: contents;
  }

  .players .cell {
    padding: 2px 5px;
  }

  .field label {
    display: block;
  }

  .content > article {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
</style>