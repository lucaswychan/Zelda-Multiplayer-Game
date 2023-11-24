const express = require("express");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

const { createServer } = require("http");
const httpServer = createServer(app);

httpServer.listen(8000, () => {
    console.log("The game server has started...");
});