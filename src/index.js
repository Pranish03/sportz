import "dotenv/config"
import express from 'express';
import http from 'http';
import { matchRouter } from './routes/matches.js';
import { attactWebSocketServer } from "./ws/server.js";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Root GET route returning a short message
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.use("/matches", matchRouter);

const { broadcastMatchCreated } = attactWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start listening on port 8000 and log the server URL
server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Server is running at ${baseUrl}`);
  console.log(`WebSocket Server is running on ${baseUrl.replace('http:', 'ws:')}/ws`)
});
