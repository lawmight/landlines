import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, mockEnv, mutationMock } = vi.hoisted(() => {
  return {
    authMock: vi.fn(),
    mockEnv: {
      LANDLINES_REDEEM_CODES: undefined as string | undefined,
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
    },
    mutationMock: vi.fn(),
  };
});

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));

vi.mock("@/lib/env", () => ({ env: mockEnv }));

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(function (this: unknown) {
    return { mutation: mutationMock };
  }),
}));

import { POST } from "@/app/api/redeem/route";

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("POST /api/redeem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.LANDLINES_REDEEM_CODES = "valid-code";
  });

  it("returns 401 when not authenticated", async () => {
    authMock.mockResolvedValue({ userId: null });

    const res = await POST(postRequest({ code: "x" }));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized." });
  });

  it("returns 400 when body is missing or non-JSON", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    const noBody = new Request("http://localhost/api/redeem", { method: "POST" });
    const res = await POST(noBody);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Code is required." });
  });

  it("returns 400 when body is invalid JSON", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    const badJson = new Request("http://localhost/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(badJson);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Code is required." });
  });

  it("returns 400 when code is empty or whitespace", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    for (const body of [{}, { code: "" }, { code: "   " }]) {
      const res = await POST(postRequest(body));
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({ error: "Code is required." });
    }
  });

  it("returns 400 when redeem codes are not configured", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    mockEnv.LANDLINES_REDEEM_CODES = "";

    const res = await POST(postRequest({ code: "x" }));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Redeem codes are not configured.",
    });
  });

  it("returns 400 when code is invalid or expired", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    const res = await POST(postRequest({ code: "wrong" }));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Invalid or expired code.",
    });
  });

  it("returns 200 and calls setSubscriptionTier for valid code (case-insensitive)", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    mutationMock.mockResolvedValue(undefined);

    const res = await POST(postRequest({ code: "Valid-Code" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true });
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith(
      expect.anything(),
      { userClerkId: "user_123", subscriptionTier: "pro" },
    );
  });

  it("returns 500 when Convex mutation fails", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    mutationMock.mockRejectedValueOnce(new Error("Convex error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(postRequest({ code: "valid-code" }));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Something went wrong. Please try again.",
    });
    consoleSpy.mockRestore();
  });
});
