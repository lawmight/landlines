import type { Request } from "express";
import twilio from "twilio";

type RequestWithRawBody = Request & { rawBody?: string };

function getWebhookUrl(request: Request): string {
  const forwardedProto = request.header("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.header("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? request.get("host");
  const protocol = forwardedProto ?? request.protocol;

  return `${protocol}://${host}${request.originalUrl}`;
}

export function validateTwilioSignature(request: RequestWithRawBody, authToken: string): boolean {
  const signature = request.header("x-twilio-signature");
  if (!signature) {
    return false;
  }

  const contentType = request.header("content-type")?.toLowerCase() ?? "";
  const webhookUrl = getWebhookUrl(request);

  if (contentType.includes("application/json")) {
    const rawBody = request.rawBody ?? "";
    return twilio.validateRequestWithBody(authToken, signature, webhookUrl, rawBody);
  }

  const params = (request.body ?? {}) as Record<string, string | string[]>;
  return twilio.validateRequest(authToken, signature, webhookUrl, params);
}
