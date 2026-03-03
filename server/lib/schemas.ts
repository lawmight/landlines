import { z } from "zod";

export const tokenRequestSchema = z.object({
  identity: z.string().min(1).max(121).regex(/^[A-Za-z0-9_]+$/, "Identity must be alphanumeric or underscore."),
  roomName: z.string().min(1).max(120),
  mode: z.enum(["voice", "video"]).default("video")
});
