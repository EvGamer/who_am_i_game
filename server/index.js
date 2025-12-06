import { WebSocketServer } from 'ws';
import { createServer } from "http";

const server = createServer();

const wss = new WebSocketServer({ server });

const getRandomIndex = (length, start = 0) => {
  return Math.floor((length - start) * Math.random()) + start;
}

class GameState {
  constructor() {
    this._changeListeners = new Set();

    this.players = [];
    this.isStarted = false;
  }

  addChangeListener(callback) {
    this._changeListeners.add(callback);
  }

  removeChangeListener(callback) {
    this._changeListeners.remove(callback);
  }

  emitChange() {
    for (const callback of this._changeListeners) {
      callback(this);
    }
  }

  submitCharacter(playerName, characterSuggestion) {
    this.players.push({
      name: playerName,
      characterSuggestion,
      character: null,
    });
    this.emitChange();
  }

  assignPlayerCharacters() {
    this.players.forEach((player, i, players) => {
      const otherPlayerIndex = getRandomIndex(players.length, i + 1); 
      player.character = players[otherPlayerIndex].characterSuggestion;
    })
  }

  start() {
    this.isStarted = true;
    this.assignPlayerCharacters();
    this.emitChange();
  }

  reset() {
    this.isStarted = false;
    this.players = [];
    this.emitChange();
  }
}

const gameState = new GameState();

wss.on('connection', function connection(connection) {
  const changeListener = ({ isStarted, players }) => {
    connection.send(JSON.stringify({
      type: "game_state_changed",
      payload: { isStarted, players },
    }))
  };

  gameState.addChangeListener(changeListener);

  connection.on('error', console.error);

  connection.on('message', function message(data) {
    const { type, payload } = JSON.parse(data);

    switch (type) {
      case "character_submitted":
        gameState.submitCharacter(payload.name, payload.character);
      case "game_started":
        gameState.start();
      case "game_reset":
        gameState.reset();
      default:
        break;
    }
  });

  connection.send('something');

  connection.on("close", () => {
    gameState.removeChangeListener(changeListener);
  })
});

