import express from "express";

import { twilioRouter } from "./routes/twilio";
import { webhookRouter } from "./routes/webhooks";

const app = express();
const port = Number(process.env.SIGNALING_PORT ?? 4000);

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/twilio", twilioRouter);
app.use("/webhooks", webhookRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  void next;
  const message = error instanceof Error ? error.message : "Unexpected signaling server error.";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`Landlines signaling server listening on http://localhost:${port}`);
});
