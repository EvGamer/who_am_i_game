export class SocketApi {
  constructor() {
    this._socket = null
    this._listeners = new Map();

    this._handleMessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      console.log("message", type, payload);

      this._callMessageListenersOfType(type, payload);
    }
  }

  addMessageListener(messageType, callback) {
    const messageTypeListeners = this._getOrCreateMessageListenerSet(messageType);
    messageTypeListeners.add(callback);
  }

  connect() {
    if (!this._socket) {
      const hostname = window.location.hostname;
      this._socket = new WebSocket(`http://${hostname}/api/`);
      this._socket.addEventListener("message", this._handleMessage);
    }
    if (this._socket.readyState === WebSocket.CLOSED) {
      this._socket.open();
    }
    if (this._socket.readyState === WebSocket.OPEN) {
      this.send("ping");
    }
  }

  send(type, payload) {
    this._socket?.send(JSON.stringify({ type, payload }));
  }

  _getOrCreateMessageListenerSet(messageType) {
    let listenerSet = this._listeners.get(messageType);
    if (!listenerSet) {
      listenerSet = new Set();
      this._listeners.set(messageType, listenerSet);
    }
    return listenerSet;
  }

  _callMessageListenersOfType(messageType, payload) {
    const listeners = this._listeners.get(messageType);
    if (!listeners) return;
    for (const listener of listeners) {
      listener(payload);
    }
  }
}