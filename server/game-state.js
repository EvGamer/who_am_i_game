
const getRandomIndex = (length, start = 0) => {
  return Math.floor((length - start) * Math.random()) + start;
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