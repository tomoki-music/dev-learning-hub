import { describe, expect, it } from "vitest";
import { toEventWriteData, validateEventForm } from "@/lib/validation";

const validInput = {
  title: "Ruby基礎もくもく会",
  description: "Rubyの基礎文法を教材に沿って学びながら、黙々と手を動かす会です。",
  date: "2026-09-10T19:00",
  location: "オンライン（Discord）",
  capacity: "20",
  category: "Ruby",
  difficulty: "初心者",
  format: "オンライン",
  organizer: "Dev Learning Hub 運営",
  technologyTagNames: ["Ruby"],
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
      category: "",
      difficulty: "",
      format: "",
      organizer: "",
      technologyTagNames: [],
    });

    expect(result.success).toBe(false);
    if (result.success) return; // narrows the type for TS below
    expect(result.error.fieldErrors?.title).toBeDefined();
    expect(result.error.fieldErrors?.description).toBeDefined();
    expect(result.error.fieldErrors?.date).toBeDefined();
    expect(result.error.fieldErrors?.location).toBeDefined();
    expect(result.error.fieldErrors?.capacity).toBeDefined();
    expect(result.error.fieldErrors?.category).toBeDefined();
    expect(result.error.fieldErrors?.difficulty).toBeDefined();
    expect(result.error.fieldErrors?.format).toBeDefined();
    expect(result.error.fieldErrors?.organizer).toBeDefined();
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

  it.each(["Ruby", "AWS", "Vue.js", "その他"])(
    "accepts every documented category: %s",
    (category) => {
      const result = validateEventForm({ ...validInput, category });
      expect(result.success).toBe(true);
    },
  );

  it("rejects a category outside the fixed candidate list", () => {
    const result = validateEventForm({ ...validInput, category: "Kotlin" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.fieldErrors?.category).toBeDefined();
  });

  it.each(["初心者", "初級", "中級", "上級", "レベル不問"])(
    "accepts every documented difficulty: %s",
    (difficulty) => {
      const result = validateEventForm({ ...validInput, difficulty });
      expect(result.success).toBe(true);
    },
  );

  it("rejects a difficulty outside the fixed candidate list", () => {
    const result = validateEventForm({ ...validInput, difficulty: "神" });
    expect(result.success).toBe(false);
  });

  it.each(["オンライン", "オフライン", "ハイブリッド"])(
    "accepts every documented format: %s",
    (format) => {
      const result = validateEventForm({ ...validInput, format });
      expect(result.success).toBe(true);
    },
  );

  it("rejects a format outside the fixed candidate list", () => {
    const result = validateEventForm({ ...validInput, format: "テレパシー" });
    expect(result.success).toBe(false);
  });

  it("rejects a blank organizer", () => {
    const result = validateEventForm({ ...validInput, organizer: "  " });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.fieldErrors?.organizer).toBeDefined();
  });

  it("accepts an empty technologyTagNames array (tags are optional)", () => {
    const result = validateEventForm({ ...validInput, technologyTagNames: [] });
    expect(result.success).toBe(true);
  });

  it("accepts multiple technology tags from the fixed candidate list", () => {
    const result = validateEventForm({
      ...validInput,
      technologyTagNames: ["Ruby", "Ruby on Rails", "RSpec"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a technology tag outside the fixed candidate list", () => {
    const result = validateEventForm({ ...validInput, technologyTagNames: ["COBOL"] });
    expect(result.success).toBe(false);
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
    expect(data.category).toBe(validInput.category);
    expect(data.difficulty).toBe(validInput.difficulty);
    expect(data.format).toBe(validInput.format);
    expect(data.organizer).toBe(validInput.organizer);
  });
});
