import express from "express";
import helmet from "helmet";

import { logger } from "../lib/logger";
import { resolveCorsOrigin } from "./lib/cors";
import { serverEnv } from "./lib/env";
import { twilioRouter } from "./routes/twilio";
import { webhookRouter } from "./routes/webhooks";

const app = express();
const port = serverEnv.SIGNALING_PORT ?? 4000;

app.set("trust proxy", true);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use((req, res, next) => {
  const requestOrigin = req.header("origin") ?? undefined;
  const allowedOrigin = resolveCorsOrigin(requestOrigin, serverEnv.CORS_ORIGIN);

  res.header("Vary", "Origin");
  if (allowedOrigin) {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.info(
      {
        durationMs: Date.now() - startedAt,
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
      },
      "HTTP request completed."
    );
  });
  next();
});

app.use(
  express.json({
    verify: (req, _res, buffer) => {
      (req as express.Request & { rawBody?: string }).rawBody = buffer.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/twilio", twilioRouter);
app.use("/webhooks", webhookRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  void next;
  const message = error instanceof Error ? error.message : "Unexpected signaling server error.";
  logger.error({ error }, "Unhandled signaling server error.");
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  logger.info({ port }, "Landlines signaling server listening.");
});
