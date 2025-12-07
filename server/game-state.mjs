
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

  submitCharacter(playerName, characterSuggestion) {
    this.players.push({
      name: playerName,
      characterSuggestion,
      character: null,
    });
    this.emitChange();
  }

  assignPlayerCharacters() {
    const characters = this.players.map(player => player.characterSuggestion);

    this.players.forEach((player, i) => {
      const randomCharacterIndex = getRandomIndex(characters.length); 
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