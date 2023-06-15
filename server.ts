// server.ts

import app from "./app";
const port = 5000;

// Route de test
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
