const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const axios = require("axios");

const port = process.env.PORT || 4001;

const index = require("./routes/index");

const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIO(server);
const getApiAndEmit = async socket => {
  try {
    const res = await axios.get(
      "https://api.darksky.net/forecast/cc4f9001837d1228b9fe92bea33b7d6d/43.7695,11.2558"
    );
    socket.emit("FromAPI", res.data.currently.temperature);
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

let interval;
io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 10000);
  socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(port, () => console.log(`Listening on port ${port}`));
