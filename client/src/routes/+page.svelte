<script>
  import JoinScreen from "$lib/components/join-screen.svelte";
  import PlayersScreen from "$lib/components/players-screen.svelte";
  import Button from "$lib/components/button.svelte";
  import { onMount } from "svelte";
  import { v4 as getUuidV4 } from "uuid";

  const STORAGE_VERSION_STORAGE = "storage_version";
  const STORAGE_VERSION = "1";
  const CURRENT_PLAYER_NAME_STORAGE = "current_player_name"; 
  const CURRENT_PLAYER_ID_STORAGE = "current_player_id";

  let currentPlayerId = $state(null);
  let currentPlayerName = $state("");
  let characterSuggestion = $state("");
  let players = $state([]);
  const otherPlayers = $derived(players.filter((player) => player.name !== currentPlayerName));
  const isCharacterSuggested = $derived(
    players.some((player) => player.id === currentPlayerId && player.characterSuggestion)
  )
  let firstPlayerName = $state("");

  let isGameStarted = $state(false);
  let isEditing = $state(false);

  let socket = null;

  const handleSocketMessage = (event) => {
    const { type, payload } = JSON.parse(event.data);
    console.log("message", type, payload);
    switch (type) {
      case "game_state_changed":
        players = payload.players;
        isGameStarted = payload.isStarted;
        firstPlayerName = payload.firstPlayerName;
        break;
      case "ping":
        socket.send(JSON.stringify({ type: "pong" }));
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
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }

  onMount(() => {
    const prevStorageVersion = window.localStorage.getItem(STORAGE_VERSION_STORAGE);
    if (prevStorageVersion !== STORAGE_VERSION) {
      window.localStorage.clear();
      window.localStorage.setItem(STORAGE_VERSION_STORAGE, STORAGE_VERSION);
    } else {
      currentPlayerId = window.localStorage.getItem(CURRENT_PLAYER_ID_STORAGE);
      currentPlayerName = window.localStorage.getItem(CURRENT_PLAYER_NAME_STORAGE);
    }
    if (!currentPlayerId) {
      currentPlayerId = getUuidV4();
      window.localStorage.setItem(CURRENT_PLAYER_ID_STORAGE, currentPlayerId);
    }
    
    console.log(currentPlayerName);

    connectToSocket();

    setInterval(connectToSocket, 60000);

    socket.addEventListener("message", handleSocketMessage);
  });

  const submitSuggestion = () => {
    window.localStorage.setItem(CURRENT_PLAYER_NAME_STORAGE, currentPlayerName);
    isEditing = false;

    socket.send(JSON.stringify({
      type: "character_submitted",
      payload: {
        id: currentPlayerId,
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
    {#if isCharacterSuggested && !isEditing || isGameStarted}
      <PlayersScreen
        players={otherPlayers}
        {isGameStarted}
        {firstPlayerName}
      >
        {#if isGameStarted}
          <Button onclick={resetGame}>Начать заново</Button>
        {:else}
          <Button onclick={() => isEditing = true}>Изменить</Button>
          <Button onclick={startGame}>Начать</Button>
        {/if}
      </PlayersScreen>
    {:else}
      <JoinScreen 
        {isEditing}
        bind:player={currentPlayerName}
        bind:character={characterSuggestion}
        submit={submitSuggestion}
        cancel={() => isEditing = false}
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