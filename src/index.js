import express from 'express';
import { matchRouter } from './routes/matches';

const app = express();
const PORT = 8000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

app.use("/matches", matchRouter)

// Root GET route returning a short message
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Start listening on port 8000 and log the server URL
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
