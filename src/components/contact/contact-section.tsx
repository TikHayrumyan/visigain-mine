"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContactAside } from "./contact-aside";
import { ContactForm } from "./contact-form";

const REVEAL = { duration: 0.6, ease: [0, 0, 0.58, 1] as const };

/** The form and the office column. They fade and rise, the office a short beat after the form. */
export function ContactSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-bg pt-8 pb-hero lg:pt-15 lg:pb-24">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-5 lg:flex-row lg:items-start lg:gap-16 lg:px-30">
        <motion.div
          className="min-w-0 lg:basis-150.25 lg:shrink"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduceMotion ? { duration: 0 } : REVEAL}
        >
          <ContactForm />
        </motion.div>
        <motion.div
          className="min-w-0 lg:basis-133.75 lg:shrink"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduceMotion ? { duration: 0 } : { ...REVEAL, delay: 0.08 }}
        >
          <ContactAside />
        </motion.div>
      </div>
    </section>
  );
}
