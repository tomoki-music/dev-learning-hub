"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { EventApiError, EventFormInput, EventRecord } from "@/types/event";
import { validateEventForm } from "@/lib/validation";
import { toDatetimeLocalValue } from "@/lib/events";

type EventFormProps =
  | { mode: "create" }
  | { mode: "edit"; event: EventRecord };

const FIELD_LABELS: Record<keyof EventFormInput, string> = {
  title: "イベント名",
  description: "イベントの説明",
  date: "開催日時",
  location: "開催場所",
  capacity: "定員",
};

function initialValuesFor(props: EventFormProps): EventFormInput {
  if (props.mode === "edit") {
    return {
      title: props.event.title,
      description: props.event.description,
      date: toDatetimeLocalValue(props.event.date),
      location: props.event.location,
      capacity: String(props.event.capacity),
    };
  }
  return { title: "", description: "", date: "", location: "", capacity: "" };
}

/**
 * Registration + edit share one form: which endpoint/method to call and
 * where to redirect afterwards are the only real differences, so `mode`
 * is a discriminated union rather than two near-duplicate components —
 * the same instinct as a Vue component taking a `mode` prop instead of
 * being copy-pasted for "new" and "edit".
 */
export function EventForm(props: EventFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<EventFormInput>(() => initialValuesFor(props));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EventFormInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof EventFormInput>(key: K, value: EventFormInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Belt-and-braces double-submit guard: the submit button is already
    // disabled while `isSubmitting` is true, but a form's `onSubmit` can
    // also fire from a stray Enter keypress, so re-check here too.
    if (isSubmitting) return;

    setFormError(null);

    // Runs the exact same zod schema the API validates with (see
    // src/lib/validation.ts) — instant feedback with no network round
    // trip, and no risk of the two checks ever disagreeing.
    const validation = validateEventForm(values);
    if (!validation.success) {
      setFieldErrors(validation.error.fieldErrors ?? {});
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const endpoint =
        props.mode === "create" ? "/api/events" : `/api/events/${props.event.id}`;
      const method = props.mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorBody = (await response
          .json()
          .catch(() => null)) as EventApiError | null;
        setFieldErrors(errorBody?.fieldErrors ?? {});
        setFormError(errorBody?.error ?? "保存に失敗しました。もう一度お試しください。");
        setIsSubmitting(false);
        return;
      }

      const { event: saved } = (await response.json()) as { event: EventRecord };
      // router.push navigates client-side (no full page reload, like
      // vue-router's push); router.refresh() re-runs the destination
      // Server Component's data fetch so the freshly saved row is what
      // renders, instead of a cached pre-save version.
      router.push(`/events/${saved.id}`);
      router.refresh();
    } catch {
      setFormError(
        "通信エラーが発生しました。ネットワーク環境を確認してもう一度お試しください。",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          {formError}
        </p>
      )}

      <Field label={FIELD_LABELS.title} htmlFor="title" error={fieldErrors.title}>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
          className={inputClass(Boolean(fieldErrors.title))}
        />
      </Field>

      <Field
        label={FIELD_LABELS.description}
        htmlFor="description"
        error={fieldErrors.description}
      >
        <textarea
          id="description"
          name="description"
          rows={5}
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          aria-invalid={Boolean(fieldErrors.description)}
          className={inputClass(Boolean(fieldErrors.description))}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={FIELD_LABELS.date} htmlFor="date" error={fieldErrors.date}>
          <input
            id="date"
            name="date"
            type="datetime-local"
            value={values.date}
            onChange={(event) => updateField("date", event.target.value)}
            aria-invalid={Boolean(fieldErrors.date)}
            className={inputClass(Boolean(fieldErrors.date))}
          />
        </Field>

        <Field label={FIELD_LABELS.capacity} htmlFor="capacity" error={fieldErrors.capacity}>
          <input
            id="capacity"
            name="capacity"
            type="number"
            inputMode="numeric"
            min={1}
            value={values.capacity}
            onChange={(event) => updateField("capacity", event.target.value)}
            aria-invalid={Boolean(fieldErrors.capacity)}
            className={inputClass(Boolean(fieldErrors.capacity))}
          />
        </Field>
      </div>

      <Field label={FIELD_LABELS.location} htmlFor="location" error={fieldErrors.location}>
        <input
          id="location"
          name="location"
          type="text"
          value={values.location}
          onChange={(event) => updateField("location", event.target.value)}
          aria-invalid={Boolean(fieldErrors.location)}
          className={inputClass(Boolean(fieldErrors.location))}
        />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "送信中…"
            : props.mode === "create"
              ? "イベントを作成する"
              : "変更を保存する"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return (
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none " +
    (hasError
      ? "border-danger focus:border-danger"
      : "border-surface-border focus:border-brand-primary")
  );
}
