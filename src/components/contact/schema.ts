import { z } from "zod";

export const TOPICS = ["Free grade", "Full report", "Monitoring", "Partnership", "Press", "Something else"] as const;

export type Topic = (typeof TOPICS)[number];

export const DEFAULT_TOPIC: Topic = "Free grade";

export const FIELD_ERROR = {
  name: "Enter your name.",
  email: "Enter a valid email, like you@yourbusiness.com.",
  message: "Write a short message so we know how to help.",
} as const;

export type FieldName = keyof typeof FIELD_ERROR;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** One message for an empty address and a malformed one. Topic is always one of the chips. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, { error: FIELD_ERROR.name }),
  email: z.string().trim().regex(EMAIL, { error: FIELD_ERROR.email }),
  message: z.string().trim().min(1, { error: FIELD_ERROR.message }),
  topic: z.enum(TOPICS, { error: FIELD_ERROR.message }),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** The message for one field, or null when the current value is valid. */
export function fieldIssue(field: FieldName, value: string): string | null {
  const parsed = contactSchema.shape[field].safeParse(value);
  if (parsed.success) return null;
  return parsed.error.issues[0]?.message ?? FIELD_ERROR[field];
}

export function fieldErrors(error: z.ZodError<ContactInput>): Partial<Record<FieldName, string>> {
  const flat = z.flattenError(error).fieldErrors;
  return {
    name: flat.name?.[0],
    email: flat.email?.[0],
    message: flat.message?.[0],
  };
}

/** The first word of the name, used in the confirmation. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export interface ContactFormState {
  status: "idle" | "invalid" | "sent" | "failed";
  errors: Partial<Record<FieldName, string>>;
  /** Submitted text, kept so a failed or invalid send does not wipe the fields. */
  values: { name: string; email: string; message: string; topic: Topic } | null;
  topic: Topic;
  sent: { name: string; email: string } | null;
  /** Bumps when the form should mount empty again, with the same topic. */
  generation: number;
}

export const initialContactState: ContactFormState = {
  status: "idle",
  errors: {},
  values: null,
  topic: DEFAULT_TOPIC,
  sent: null,
  generation: 0,
};
