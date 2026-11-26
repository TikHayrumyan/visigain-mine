export const TOPICS = ["Free grade", "Full report", "Monitoring", "Partnership", "Press", "Something else"] as const;

export type Topic = (typeof TOPICS)[number];

export const DEFAULT_TOPIC: Topic = "Free grade";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FIELD_ERROR = {
  name: "Enter your name.",
  email: "Enter a valid email, like you@yourbusiness.com.",
  message: "Write a short message so we know how to help.",
} as const;

export type FieldName = keyof typeof FIELD_ERROR;

/** Empty and malformed addresses share one message. A value is valid once it has a name, a dot and a domain. */
export function fieldError(field: FieldName, value: string): string | null {
  const text = value.trim();
  if (field === "email") return EMAIL.test(text) ? null : FIELD_ERROR.email;
  return text ? null : FIELD_ERROR[field];
}

/** The first word of the name, used in the confirmation. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}
