import { Server as IOServer } from "socket.io";
import { NextRequest } from "next/server";

const ioMap = new Map();

export async function GET(req: NextRequest) {
  if (!ioMap.has("io")) {
    const io = new IOServer({
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("join-session", (sessionId) => {
        socket.join(sessionId);
        console.log(`Client ${socket.id} joined ${sessionId}`);
      });

      socket.on("send-signal", ({ sessionId, type }) => {
        console.log(`Signal from ${socket.id}: ${type}`);
        io.to(sessionId).emit("receive-signal", type);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected");
      });
    });

    ioMap.set("io", io);
  }

  return new Response("Socket server running!");
}
