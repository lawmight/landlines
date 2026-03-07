import { describe, expect, it } from "vitest";

import { getAllowedCorsOrigins, resolveCorsOrigin } from "@/server/lib/cors";

describe("server CORS origin resolution", () => {
  it("allows localhost, IPv4, and IPv6 loopback origins in local development", () => {
    expect(getAllowedCorsOrigins()).toEqual(["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000"]);
  });

  it("treats loopback hostnames as equivalent for the configured port", () => {
    expect(resolveCorsOrigin("http://127.0.0.1:3000", "http://localhost:3000")).toBe("http://127.0.0.1:3000");
    expect(resolveCorsOrigin("http://localhost:3000", "http://127.0.0.1:3000")).toBe("http://localhost:3000");
    expect(resolveCorsOrigin("http://[::1]:3000", "http://localhost:3000")).toBe("http://[::1]:3000");
  });

  it("rejects unrelated origins", () => {
    expect(resolveCorsOrigin("http://evil.example.com", "http://localhost:3000")).toBeNull();
  });
});
