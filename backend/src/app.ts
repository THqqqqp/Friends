import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import routes from "./routes";
import { env } from "./config/env";
import { prepareFileSystem } from "./config/bootstrap";
import { requestLogger } from "./lib/logger";
import { errorHandler } from "./middlewares/errorHandler";

prepareFileSystem();

const app = express();

const allowedOrigins = [...(env.clientUrls || []), ...(env.adminUrls || [])].filter(
  Boolean
);
const allowedHostnames = allowedOrigins
  .map((value) => {
    try {
      return new URL(value).hostname;
    } catch {
      return null;
    }
  })
  .filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      try {
        const { hostname } = new URL(origin);
        if (allowedHostnames.includes(hostname)) {
          return callback(null, true);
        }
      } catch {
        // ignore parse errors so we can fall through to rejection
      }
      if (allowedHostnames.length === 0) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/uploads", express.static(path.join(env.uploadDir)));

app.use("/api", routes);

app.use(errorHandler);

export { app };
