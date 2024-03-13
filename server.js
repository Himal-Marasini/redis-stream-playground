const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const {
  createStream,
  readStream,
  deleteStreamLength,
  deleteStream,
} = require("./redisMethod");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", async (req, res) => {
  const payload = {
    userId: "2",
    spent: 20,
    won: 30,
  };

  const response = await createStream(payload);

  return res.json({ success: true, message: response });
});

app.get("/data", async (req, res) => {
  const response = await readStream();

  return res.json({ success: true, data: response });
});

app.get("/read-trim", async (req, res) => {
  const response = await deleteStreamLength();

  return res.json({ success: true, data: response });
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
