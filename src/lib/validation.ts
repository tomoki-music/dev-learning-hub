import { z } from "zod";
import type { EventApiError, EventFormInput } from "@/types/event";

/**
 * Single source of truth for "is this event input valid?".
 *
 * Both the API Route Handlers (server) and `EventForm` (client, for
 * inline error messages before submit) import this same schema, so the
 * rules can never drift between client-side and server-side checks —
 * comparable to sharing an ActiveModel::Validations block, except here
 * the browser can also run it directly since it's plain TypeScript.
 */
export const eventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "イベント名を入力してください")
    .max(100, "イベント名は100文字以内で入力してください"),
  description: z
    .string()
    .trim()
    .min(1, "イベントの説明を入力してください")
    .max(2000, "イベントの説明は2000文字以内で入力してください"),
  date: z
    .string()
    .min(1, "開催日時を入力してください")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "開催日時の形式が正しくありません",
    }),
  location: z
    .string()
    .trim()
    .min(1, "開催場所を入力してください")
    .max(200, "開催場所は200文字以内で入力してください"),
  capacity: z
    .string()
    .min(1, "定員を入力してください")
    .refine((value) => /^\d+$/.test(value), {
      message: "定員は半角の整数で入力してください",
    })
    .refine((value) => Number(value) >= 1, {
      message: "定員は1名以上で入力してください",
    })
    .refine((value) => Number(value) <= 100000, {
      message: "定員は100000名以下で入力してください",
    }),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export type EventValidationResult =
  | { success: true; data: EventFormValues }
  | { success: false; error: EventApiError };

/** Runs `eventFormSchema` and reshapes zod's error tree into the flat,
 * per-field message map `EventForm` and the API responses both expect. */
export function validateEventForm(input: unknown): EventValidationResult {
  const result = eventFormSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors: Partial<Record<keyof EventFormInput, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key as keyof EventFormInput] = issue.message;
    }
  }

  return {
    success: false,
    error: { error: "入力内容に誤りがあります", fieldErrors },
  };
}

/** Converts validated string-based form values into the types Prisma
 * expects (`date` -> Date, `capacity` -> number). */
export function toEventWriteData(values: EventFormValues) {
  return {
    title: values.title,
    description: values.description,
    date: new Date(values.date),
    location: values.location,
    capacity: Number(values.capacity),
  };
}
