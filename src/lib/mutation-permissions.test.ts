import { afterEach, describe, expect, it, vi } from "vitest";
import {
  areEventMutationsEnabled,
  mutationsDisabledResponse,
} from "@/lib/mutation-permissions";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("areEventMutationsEnabled", () => {
  it("is true only when EVENT_MUTATIONS_ENABLED is exactly \"true\"", () => {
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", "true");
    expect(areEventMutationsEnabled()).toBe(true);
  });

  it("is false when unset", () => {
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", undefined);
    expect(areEventMutationsEnabled()).toBe(false);
  });

  it("is false for \"false\"", () => {
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", "false");
    expect(areEventMutationsEnabled()).toBe(false);
  });

  it("is false for any other truthy-looking string (no loose coercion)", () => {
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", "1");
    expect(areEventMutationsEnabled()).toBe(false);
  });
});

describe("mutationsDisabledResponse", () => {
  it("returns 403 with a Japanese, detail-free error message", async () => {
    const response = mutationsDisabledResponse();
    expect(response.status).toBe(403);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("この環境ではイベントの変更はできません");
  });
});
