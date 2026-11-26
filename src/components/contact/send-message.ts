"use server";

import {
  contactSchema,
  fieldErrors,
  firstName,
  initialContactState,
  type ContactFormState,
  type ContactInput,
} from "./schema";

/** A handoff that never settles becomes the failed state. */
const SEND_LIMIT_MS = 10_000;

/**
 * Accepts the message. There is no mail transport yet, so a valid message is confirmed here.
 * The caller still races this with the send limit.
 */
function acceptMessage(message: ContactInput): Promise<void> {
  void message;
  return Promise.resolve();
}

function read(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    topic: String(formData.get("topic") ?? ""),
  };
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
  try {
    await Promise.race([
      acceptMessage(parsed.data),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), SEND_LIMIT_MS);
      }),
    ]);
  } catch {
    return {
      status: "failed",
      errors: {},
      values: parsed.data,
      topic: parsed.data.topic,
      sent: null,
      generation: previous.generation,
    };
  } finally {
    if (timer) clearTimeout(timer);
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
