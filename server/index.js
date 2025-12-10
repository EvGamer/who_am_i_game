import { WebSocketServer } from 'ws';
import { createServer } from "http";

import { GameState } from "./game-state.mjs";

const server = createServer();

const wss = new WebSocketServer({ server });

const gameState = new GameState();

wss.on('connection', (connection) => {
  const changeListener = ({ isStarted, players, firstPlayerName }) => {
    connection.send(JSON.stringify({
      type: "game_state_changed",
      payload: { isStarted, players, firstPlayerName },
    }))
  };

  gameState.addChangeListener(changeListener);
  changeListener(gameState);

  connection.on('error', console.error);

  connection.on('message', (data) => {
    const { type, payload } = JSON.parse(data);

    switch (type) {
      case "character_submitted":
        console.log(`"${payload.character}" submitted by ${payload.name}`)
        gameState.submitCharacter(payload.name, payload.character);
        break;
      case "game_started":
        console.log("Game started");
        gameState.start();
        break;
      case "game_reset":
        console.log("Game reset");
        gameState.reset();
        break;
      case "ping":
        connection.send(JSON.stringify({
          type: "pong"
        }));
      default:
        break;
    }
  });

  connection.on("close", () => {
    gameState.removeChangeListener(changeListener);
  })
});

server.listen(8080);
