<script>
  import JoinScreen from "$lib/components/screens/join-screen.svelte";
  import PlayersScreen from "$lib/components/screens/players-screen.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import EditCharacterScreen from "$lib/components/screens/edit-character-screen.svelte";
  import { onMount } from "svelte";
  import { v4 as getUuidV4 } from "uuid";
  import { SocketApi } from "$lib/socket-api";

  const STORAGE_VERSION_STORAGE = "storage_version";
  const STORAGE_VERSION = "1";
  const CURRENT_PLAYER_NAME_STORAGE = "current_player_name"; 
  const CURRENT_PLAYER_ID_STORAGE = "current_player_id";

  let isConnected = $state(false);

  let currentPlayerId = $state(null);
  let currentPlayerName = $state("");
  let characterSuggestion = $state("");
  let players = $state([]);
  const otherPlayers = $derived(players.filter((player) => player.name !== currentPlayerName));

  const currentPlayer = $derived(players.find(player => player.id === currentPlayerId));
  const isCharacterSuggested = $derived(Boolean(currentPlayer?.characterSuggestion));
  const isHotjoined = $derived(!currentPlayer?.character);
  let isInGame = $derived(currentPlayer != null);

  let editedPlayer = $state(null);

  let firstPlayerName = $state("");
  let isGameStarted = $state(false);
  let isEditing = $state(false);

  const socketApi = new SocketApi();
  socketApi.addMessageListener("game_state_changed", (payload) => {
    players = payload.players;
    isGameStarted = payload.isStarted;
    firstPlayerName = payload.firstPlayerName;
  });

  socketApi.addMessageListener("ping", () => {
    socketApi.send("pong");
  })

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

    isConnected = socketApi.connect();

    setInterval(() => isConnected = socketApi.connect(), 5000);
  });

  const edit = () => isEditing = true;

  const editPlayer = (player) => {
    editedPlayer = { ...player };
  }

  const submit = () => {
    window.localStorage.setItem(CURRENT_PLAYER_NAME_STORAGE, currentPlayerName);
    isEditing = false;

    const payload = {
      id: currentPlayerId,
      name: currentPlayerName,
      character: characterSuggestion,
    }

    if (isGameStarted && isInGame) {
      socketApi.send("hotjoin_character_submitted", payload);
      return;
    }

    if (isGameStarted && !isInGame) {
      socketApi.send("hotjoined", payload);
      return;
    }

    socketApi.send("character_submitted", payload);
  };

  const startGame = () => {
    socketApi.send("game_started");
  };

  const resetGame = () => {
    socketApi.send("game_reset");
  }

  const replaceCharacter = () => {
    socketApi.send("character_replaced", {
      id: editedPlayer.id,
      character: editedPlayer.character,
    })
    editedPlayer = null;
  }
</script>

<div class="root">
  <div class="content">
    <div class="connection" class:connected={isConnected}></div>
    {#if isEditing || !isGameStarted && !isCharacterSuggested}
      <JoinScreen 
        {isEditing}
        {isGameStarted}
        {isInGame}
        bind:player={currentPlayerName}
        bind:character={characterSuggestion}
        {submit}
        cancel={() => isEditing = false}
      />
    {:else if editedPlayer != null}
      <EditCharacterScreen 
        player={editedPlayer.name}
        bind:character={editedPlayer.character}
        submit={replaceCharacter}
        cancel={() => editedPlayer = null}
      />
    {:else}
      <PlayersScreen
        players={otherPlayers}
        {editPlayer}
        {isGameStarted}
        {firstPlayerName}
      >
        {#if isGameStarted}
          {#if isInGame && !isHotjoined}
            <Button onclick={edit}>Новый персонаж</Button>
          {:else if !isInGame}
            <Button onclick={edit}>Присоединиться</Button>
          {/if}
          <Button onclick={resetGame}>Начать заново</Button>
        {:else}
          <Button onclick={edit}>Изменить</Button>
          <Button onclick={startGame}>Начать</Button>
        {/if}
      </PlayersScreen>
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
    --success-bg-color: #78b138;
    --failure-bg-color: #b1385c;
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

  .connection {
    width: 100%;
    height: 3px;
    background-color: var(--failure-bg-color);
  }
  .connection.connected {
    background-color: var(--success-bg-color);
  }

  .root > .content {
    max-width: 400px;
    width: 100%;
    height: 100%;
  }

</style>