import { WebSocketServer } from 'ws';
import { createServer } from "http";

const server = createServer();

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(connection) {
  connection.on('error', console.error);

  connection.send("Hello world!");

  connection.on('message', function message(data) {
    console.log('received: %s', data);
  });

  connection.send('something');
});

server.listen(8080);