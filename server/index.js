import { WebSocketServer } from 'ws';
import { createServer } from "http";
import fs from "node:fs";

import { GameState } from "./game-state.mjs";

const server = createServer();

const wss = new WebSocketServer({ server });

const gameState = new GameState();

const addCharacterToFile = (character) => {
  if (!character) return;
  fs.appendFile("character.log", `${character}\n`, (error) => {
    if (error) console.error(error);
  });
}

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
        console.log(`"${payload.character}" submitted by ${payload.name}. id: ${payload.id}`)
        addCharacterToFile(payload.character);
        gameState.submitCharacter({
          id: payload.id,
          name: payload.name,
          characterSuggestion: payload.character,
        });
        break;
      case "hotjoined":
        console.log(`${payload.name} hotjoined. id: ${payload.id}"`);
        gameState.hotjoin(payload.id, payload.name);
        break;
      case "hotjoin_character_submitted":
        console.log(`"${payload.character}" submitted by ${gameState.getPlayer(payload.id)?.name}. id: ${payload.id}`);
        addCharacterToFile(payload.character);
        gameState.submitHotjoinCharacter(payload.character);
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
        break;
      default:
        break;
    }
  });

  connection.on("close", () => {
    gameState.removeChangeListener(changeListener);
  })
});

server.listen(8080);
