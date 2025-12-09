<script>
  import JoinScreen from "$lib/components/join-screen.svelte";
  import PlayersScreen from "$lib/components/players-screen.svelte";
  import Button from "$lib/components/button.svelte";
  import { onMount } from "svelte";

  const CURRENT_PLAYER_NAME_STORAGE = "current_player_name"; 

  let currentPlayerName = $state("");
  let characterSuggestion = $state("");
  let players = $state([]);
  const otherPlayers = $derived(players.filter((player) => player.name !== currentPlayerName));
  const isCharacterSuggested = $derived(
    players.some((player) => player.name === currentPlayerName && player.characterSuggestion)
  )
  let isGameStarted = $state(false);

  let socket = null;

  const handleSocketMessage = (event) => {
    const { type, payload } = JSON.parse(event.data);
    console.log("message", type, payload);
    switch (type) {
      case "game_state_changed":
        players = payload.players;
        isGameStarted = payload.isStarted;
        break;
      case "ping":
        socket.send({ type: "pong" });
      default:
        break;
    }
  }

  function connectToSocket() {
    if (!socket) {
      const hostname = window.location.hostname;
      socket = new WebSocket(`http://${hostname}/api/`);
    }
    if (socket.readyState === WebSocket.CLOSED) {
      socket.open();
    }
  }

  onMount(() => {
    currentPlayerName = window.localStorage.getItem(CURRENT_PLAYER_NAME_STORAGE);
    console.log(currentPlayerName);

    connectToSocket();

    socket.addEventListener("message", handleSocketMessage);
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
      <PlayersScreen players={otherPlayers} {isGameStarted} >
        {#if isGameStarted}
          <Button onclick={resetGame}>Начать заново</Button>
        {:else}
          <Button onclick={startGame}>Начать</Button>
        {/if}
      </PlayersScreen>
    {:else}
      <JoinScreen 
        bind:player={currentPlayerName}
        bind:character={characterSuggestion}
        submit={submitSuggestion}
      />
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

</style>