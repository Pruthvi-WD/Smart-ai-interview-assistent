import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Socket.IO logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-interview", (interviewId) => {
      socket.join(interviewId);
      console.log(`User ${socket.id} joined interview ${interviewId}`);
    });

    socket.on("speech-data", (data) => {
      // Real-time speech analysis feedback could go here
      // For now, we just broadcast back some mock feedback
      const { interviewId, text } = data;
      const fillers = ["um", "uh", "like", "you know"];
      const foundFillers = fillers.filter(f => text.toLowerCase().includes(f));
      
      if (foundFillers.length > 0) {
        io.to(interviewId).emit("realtime-feedback", {
          type: "filler-word",
          message: `Try to avoid: ${foundFillers.join(", ")}`,
          timestamp: Date.now()
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
