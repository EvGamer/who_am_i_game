<script>
  import { PUBLIC_HOST } from "$env/static/public";
  import { onMount } from "svelte";

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

  let socket = null;

  const handleSocketMessage = (event) => {
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
  }

  function connectToSocket() {
    const hostname = window.location.hostname;
    socket = new WebSocket(`http://${hostname}/api/`);

    socket.addEventListener("message", handleSocketMessage);

    socket.addEventListener("close", connectToSocket)
  }

  onMount(() => {
    currentPlayerName = window.localStorage.getItem(CURRENT_PLAYER_NAME_STORAGE);
    console.log(currentPlayerName);

    connectToSocket();
  });

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

<div class="root">
  <div class="content">
    {#if isCharacterSuggested || isGameStarted}
      <article class="screen">
        <header>Игроки</header>
        <section class="content players">
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
        <footer>
          {#if isGameStarted}
            <button on:click={resetGame}>Начать заново</button>
          {:else}
            <button on:click={startGame}>Начать</button>
          {/if}
        </footer>
      </article>
    {:else}
      <article class="screen">
        <header>Введите ваше имя и персонажа</header>
        <section class="content form">
          <div class="field">
            <label for="player">Ваше имя</label>
            <input name="player" bind:value={currentPlayerName} />
          </div>
          <div class="field">
            <label for="character">Персонаж</label>
            <input name="character" bind:value={characterSuggestion} />
          </div>
        </section>
        <footer>
          <button on:click={submitSuggestion}>Предложить персонажа</button>
        </footer>
      </article>
    {/if}
  </div>
</div>


<style>
  .root {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;

    --primary-bg-color: #fbea66;
    --primary-text-color: #201f1f;
    --bg-color: #373735;
    --inset-bg-color: #2f2f2d;
    --input-bg-color: #262624;
    --focused-input-bg-color: #1c1c1a;
    --text-color: #DBF4F9;

    --default-v-margin: 8px;
    --font-family: Verdana;

    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: var(--font-family);
  }

  .root > .content {
    max-width: 400px;
    width: 100%;
    height: 100%;
  }

  .screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
  }

  .screen > .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--inset-bg-color);
    flex: 1;
  }

  .screen > .content.form {
    padding: var(--default-v-margin) 15px;
    gap: var(--default-v-margin);
  }

  .field {
    width: 100%;
  }

  .field > label {
    margin-bottom: 4px;
  }

  .field > input {
    width: 100%;
    background-color: var(--input-bg-color);
    border-radius: 0;
    color: var(--text-color);
    border: none;
    border-radius: 0;
    padding: 8px 16px;
    font-size: 16px;
    box-sizing: border-box;
    font-family: var(--font-family);

  }

  .field > input:focus {
    border: none;
    outline: none;
    background-color: var(--focused-input-bg-color);
  }

  .screen > header {
    position: sticky;
    top: 0;
    min-height: 50px;

    font-weight: 500;
    padding: 8px 12px;
    text-align: center;
    font-size: 24px;

    font-weight: 500;
  }

  .screen > footer {
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
    background-color: var(--bg-color);
    display: flex;
    justify-content: center;
    height: 64px;
    box-sizing: border-box;
    padding: var(--default-v-margin) 16px;
  }

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

  .screen .content.players {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: min-content;
    gap: 2px;
  }

  .players .row {
    display: contents;
  }

  .row:nth-child(2n) .cell {
    background-color: hsl(from var(--inset-bg-color) h s calc(l * 0.9));
  }

  .players .cell {
    padding: 4px 12px;
  }

  .field label {
    display: block;
  }

</style>