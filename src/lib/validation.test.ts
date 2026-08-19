import { describe, expect, it } from "vitest";
import { toEventWriteData, validateEventForm } from "@/lib/validation";

const validInput = {
  title: "秋の弾き語りナイト",
  description: "アコースティック限定のオープンマイクです。",
  date: "2026-09-10T19:00",
  location: "下北沢 Live House Moon",
  capacity: "20",
};

describe("validateEventForm", () => {
  it("accepts valid input", () => {
    const result = validateEventForm(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields with a message per field", () => {
    const result = validateEventForm({
      title: "",
      description: "",
      date: "",
      location: "",
      capacity: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return; // narrows the type for TS below
    expect(result.error.fieldErrors?.title).toBeDefined();
    expect(result.error.fieldErrors?.description).toBeDefined();
    expect(result.error.fieldErrors?.date).toBeDefined();
    expect(result.error.fieldErrors?.location).toBeDefined();
    expect(result.error.fieldErrors?.capacity).toBeDefined();
  });

  it.each(["abc", "1.5", "-3", "0", "3.0"])(
    "rejects a non-positive-integer capacity: %s",
    (capacity) => {
      const result = validateEventForm({ ...validInput, capacity });
      expect(result.success).toBe(false);
    },
  );

  it("rejects a capacity above the upper bound", () => {
    const result = validateEventForm({ ...validInput, capacity: "100001" });
    expect(result.success).toBe(false);
  });

  it("rejects an unparsable date", () => {
    const result = validateEventForm({ ...validInput, date: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("trims leading/trailing whitespace from text fields", () => {
    const result = validateEventForm({ ...validInput, title: "  余白付きタイトル  " });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.title).toBe("余白付きタイトル");
  });
});

describe("toEventWriteData", () => {
  it("converts capacity to a number and date to a Date", () => {
    const parsed = validateEventForm(validInput);
    if (!parsed.success) throw new Error("expected valid input to parse");

    const data = toEventWriteData(parsed.data);
    expect(data.capacity).toBe(20);
    expect(data.date).toBeInstanceOf(Date);
    expect(data.title).toBe(validInput.title);
  });
});
