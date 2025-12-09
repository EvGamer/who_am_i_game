
const getRandomIndex = (length) => {
  return Math.floor((length) * Math.random());
}

export class GameState {
  constructor() {
    this._changeListeners = new Set();

    this.players = [];
    this.isStarted = false;
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

  createPlayer(playerName) {
    const player = {
      name: playerName,
      characterSuggestion: null,
      character: null,
    }
    this.players.push(player);
    return player;
  }

  submitCharacter(playerName, characterSuggestion) {
    const player = this.players.find((player) => player.name === playerName) ?? this.createPlayer(playerName);
    player.characterSuggestion = characterSuggestion;
    this.emitChange();
  }

  assignPlayerCharacters() {
    const characters = this.players.map(player => player.characterSuggestion);

    this.players.forEach((player, i) => {
      let randomCharacterIndex = getRandomIndex(characters.length); 
      if (characters[randomCharacterIndex] === player.characterSuggestion) {
        randomCharacterIndex = (randomCharacterIndex + 1) % characters.length;
      }
      player.character = characters.splice(randomCharacterIndex, 1)[0];
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