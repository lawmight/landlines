import express from "express";
import helmet from "helmet";

import { logger } from "../lib/logger";
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

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", serverEnv.CORS_ORIGIN ?? "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
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
