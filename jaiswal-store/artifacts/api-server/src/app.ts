import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import { uploadsDir } from "./routes/upload";
import { logger } from "./lib/logger";

const app: Express = express();

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET ?? "jaiswal_store_secret_change_this";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api/uploads", express.static(uploadsDir));
app.use("/api", router);

const clientDist = path.join(process.cwd(), "artifacts/jaiswal-store/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*splat", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
