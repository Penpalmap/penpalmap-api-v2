// server.ts

import app from "./app/app";
import { MessageSocket } from "./message/message.socket";
const port = 5000;

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`Sarted server on port ${port}`);

  // Appel de la fonction createSocketServer en lui passant le serveur
  MessageSocket.getInstance(server);
});
