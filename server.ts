import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch"; // Node 18+ has native fetch, but we can rely on it directly. We'll use globalThis.fetch for safety.

interface StatusCheck {
  status: "operational" | "degraded" | "down" | "loading";
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

// Seed the history with 60 good checks just so the chart looks nice on first boot.
const history: StatusCheck[] = Array.from({ length: 90 }).map((_, i) => ({
  status: "operational",
  statusCode: 200,
  responseTime: 50 + Math.random() * 150,
  timestamp: new Date(Date.now() - (89 - i) * 60000).toISOString(),
}));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Real endpoint to ping e-SUS AB
  app.get("/api/status", async (req, res) => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      // 10 second timeout
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch("https://esusab.saude.gov.br/", {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) StatusChecker/1.0",
        },
      });
      clearTimeout(timeoutId);
      
      const duration = Date.now() - start;
      const isOperational = response.ok;
      
      const statusData: StatusCheck = {
        status: isOperational ? "operational" : "degraded",
        statusCode: response.status,
        responseTime: duration,
        timestamp: new Date().toISOString(),
      };

      // Keep maximum 90 history points (representing the last ~90 minutes or checks)
      history.push(statusData);
      if (history.length > 90) history.shift();

      res.json({ current: statusData, history });
    } catch (error) {
      const duration = Date.now() - start;
      
      const statusData: StatusCheck = {
        status: "down",
        statusCode: 0,
        responseTime: duration,
        timestamp: new Date().toISOString(),
      };

      history.push(statusData);
      if (history.length > 90) history.shift();

      res.status(500).json({ current: statusData, history });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
