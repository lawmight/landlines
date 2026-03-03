import twilio from "twilio";
import type { NextRequest } from "next/server";

function getWebhookUrl(request: NextRequest): string {
  const base = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto) {
    base.protocol = `${forwardedProto}:`;
  }

  if (forwardedHost) {
    base.host = forwardedHost;
  }

  return base.toString();
}

function getTwilioSignature(request: NextRequest): string | null {
  return request.headers.get("x-twilio-signature");
}

export function formDataToParams(formData: FormData): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  for (const [key, value] of formData.entries()) {
    const stringValue = String(value);
    const existing = params[key];
    if (!existing) {
      params[key] = stringValue;
      continue;
    }

    params[key] = Array.isArray(existing) ? [...existing, stringValue] : [existing, stringValue];
  }

  return params;
}

export function validateTwilioFormRequest(
  authToken: string,
  request: NextRequest,
  params: Record<string, string | string[]>
): boolean {
  const signature = getTwilioSignature(request);
  if (!signature) {
    return false;
  }

  return twilio.validateRequest(authToken, signature, getWebhookUrl(request), params);
}

export function validateTwilioJsonRequest(authToken: string, request: NextRequest, rawBody: string): boolean {
  const signature = getTwilioSignature(request);
  if (!signature) {
    return false;
  }

  return twilio.validateRequestWithBody(authToken, signature, getWebhookUrl(request), rawBody);
}
