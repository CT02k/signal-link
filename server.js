import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    if (req.url?.startsWith("/socket.io")) return;
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("New Socket.IO connection:", socket.id);

    const room = socket.handshake.query.room;
    if (room) socket.join(room);

    socket.on("message", (msg) => {
      io.to(room).emit("message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  server.listen(3000, () => console.log("🚀 http://localhost:3000"));
});
