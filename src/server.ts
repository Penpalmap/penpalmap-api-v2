// server.ts

import app from "./app";
import createSocketServer from "./socket";
const port = 5000;

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Appel de la fonction createSocketServer en lui passant le serveur
  createSocketServer(server);
});
