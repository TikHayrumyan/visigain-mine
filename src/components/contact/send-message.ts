"use server";

import { z } from "zod";
import { backendApiOrigin, backendSiteOrigin } from "@/lib/api/backend";
import {
  contactSchema,
  FIELD_ERROR,
  fieldErrors,
  firstName,
  initialContactState,
  type ContactFormState,
  type FieldName,
} from "./schema";

/** A handoff that never settles becomes the failed state. */
const SEND_LIMIT_MS = 8_000;

const contactErrorSchema = z
  .object({
    error: z.object({ code: z.string() }).passthrough(),
  })
  .passthrough();

const FIELD_BY_CODE: Record<string, FieldName> = {
  invalid_name: "name",
  invalid_email: "email",
  disposable_email: "email",
  invalid_message: "message",
};

function read(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    website: String(formData.get("website") ?? ""),
  };
}

/** Posts the message. Topic stays on the page; the API does not accept it yet. */
async function postContact(input: {
  name: string;
  email: string;
  message: string;
  website: string;
}): Promise<FieldName | null | "failed"> {
  const response = await fetch(`${backendApiOrigin()}/api/v1/contact`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      origin: backendSiteOrigin(),
    },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      message: input.message,
      website: input.website,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(SEND_LIMIT_MS),
  });

  if (response.status === 204) return null;

  if (response.status === 422) {
    const parsed = contactErrorSchema.safeParse(await response.json().catch(() => null));
    const field = parsed.success ? FIELD_BY_CODE[parsed.data.error.code] : undefined;

    return field ?? "failed";
  }

  return "failed";
}

/** Sends the contact form. `intent=reset` brings back an empty form and keeps the topic. */
export async function sendContactMessage(previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  if (formData.get("intent") === "reset") {
    const topic = contactSchema.shape.topic.safeParse(formData.get("topic"));
    return {
      ...initialContactState,
      topic: topic.success ? topic.data : previous.topic,
      generation: previous.generation + 1,
    };
  }

  const raw = read(formData);
  const topic = contactSchema.shape.topic.safeParse(raw.topic);
  const keptTopic = topic.success ? topic.data : previous.topic;
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "invalid",
      errors: fieldErrors(parsed.error),
      values: { name: raw.name, email: raw.email, message: raw.message, topic: keptTopic },
      topic: keptTopic,
      sent: null,
      generation: previous.generation,
    };
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let result: FieldName | null | "failed";
  try {
    result = await Promise.race([
      postContact({
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
        website: raw.website,
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), SEND_LIMIT_MS);
      }),
    ]);
  } catch {
    result = "failed";
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (result) {
    if (result === "failed") {
      return {
        status: "failed",
        errors: {},
        values: parsed.data,
        topic: parsed.data.topic,
        sent: null,
        generation: previous.generation,
      };
    }

    return {
      status: "invalid",
      errors: { [result]: FIELD_ERROR[result] },
      values: parsed.data,
      topic: parsed.data.topic,
      sent: null,
      generation: previous.generation,
    };
  }

  return {
    status: "sent",
    errors: {},
    values: null,
    topic: parsed.data.topic,
    sent: { name: firstName(parsed.data.name), email: parsed.data.email },
    generation: previous.generation,
  };
}
