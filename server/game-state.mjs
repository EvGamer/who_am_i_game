
const getRandomIndex = (list) => {
  return Math.floor((list.length) * Math.random());
}

const pickRandom = (list) => {
  return list[getRandomIndex(list)];
}

const extractAt = (list, index) => list.splice(index, 1)[0];

export class GameState {
  constructor() {
    this._changeListeners = new Set();
    this.init();
  }

  init() {
    this.players = [];
    this.isStarted = false;
    this.firstPlayerName = null;
    this.hotjoinCharacters = [];
  }

  addChangeListener(callback) {
    this._changeListeners.add(callback);
  }

  removeChangeListener(callback) {
    this._changeListeners.delete(callback);
  }

  emitChange() {
    for (const callback of this._changeListeners) {
      callback(this);
    }
  }

  createPlayer(id) {
    const player = {
      id,
      name: null,
      characterSuggestion: null,
      character: null,
    }
    this.players.push(player);
    return player;
  }

  getPlayer(id) {
    return this.players.find((player) => player.id === id);
  }

  replaceCharacter(id, character) {
    const player = this.getPlayer(id);
    if (!player) return null;
    player.character = character;
    this.emitChange();
    return player;
  }

  hotjoin(id, name) {
    const player = this.getPlayer(id);
    if (player) return;

    const newPlayer = this.createPlayer(id);
    newPlayer.name = name;

    if (this.hotjoinCharacters.length) {
      newPlayer.character = extractAt(this.hotjoinCharacters, getRandomIndex(this.hotjoinCharacters));
    }
    this.emitChange();
  }

  getHotjoinPlayers() {
    if (!this.isStarted) return [];
    return this.players.filter((player) => !player.character);
  }

  submitHotjoinCharacter(character) {
    const hotjoinPlayers = this.getHotjoinPlayers();
    if (hotjoinPlayers.length) {
      const player = pickRandom(hotjoinPlayers);
      player.character = character;
    } else {
      this.hotjoinCharacters.push(character);
    }
    this.emitChange();
  }

  submitCharacter({ id, name, characterSuggestion }) {
    const player = this.getPlayer(id) ?? this.createPlayer(id);
    player.name = name;
    player.characterSuggestion = characterSuggestion;
    this.emitChange();
  }

  assignPlayerCharacters() {
    if (this.players.length === 1) return;

    const characters = this.players.map(player => player.characterSuggestion);

    this.players.forEach((player) => {
      let randomCharacterIndex = getRandomIndex(characters);
      if (!characters.length) return;

      if (characters[randomCharacterIndex] === player.characterSuggestion) {
        if (characters.length === 1) {
          const otherPlayer = this.players[0];
          const otherPlayerCharacter = otherPlayer?.character;
          otherPlayer.character = player.characterSuggestion;
          player.character === otherPlayerCharacter;
          return;
        }
        randomCharacterIndex = (randomCharacterIndex + 1) % characters.length;
      }
      player.character = extractAt(characters, randomCharacterIndex);
    })
  }

  start() {
    this.isStarted = true;
    this.assignPlayerCharacters();
    this.firstPlayerName = pickRandom(this.players).name;
    this.emitChange();
  }

  reset() {
    this.init();
    this.emitChange();
  }
}