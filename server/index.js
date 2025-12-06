import { WebSocketServer } from 'ws';
import { createServer } from "http";

import { GameState } from "./game-state";

const server = createServer();

const wss = new WebSocketServer({ server });

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
    const data = JSON.parse(data);

    switch (data.type) {
      case "character_submitted":
        gameState.submitCharacter(data.name, data.character);
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

