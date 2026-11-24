export type Question = {
  question: string;
  answer: string;
};

/** Ten questions, left column first, then the right. The first is open in the design. */
export const QUESTIONS: readonly Question[] = [
  {
    question: "What is the Visibility Grade?",
    answer:
      "A letter grade, with its score, for how your business shows up where buyers check: your website, your Google listing, maps, reviews, directories, social profiles and AI answers. It’s measured against a standard that anyone can read.",
  },
  {
    question: "What do I get for free?",
    answer:
      "Your letter grade and score, your biggest finding and your easiest win, by email. It usually takes about 15 minutes.",
  },
  {
    question: "What’s in the full report?",
    answer:
      "Every finding, each with its evidence and its exact fix, ranked by what to do first. You can read it on screen and download it as a PDF.",
  },
  {
    question: "What if the report fails?",
    answer:
      "If we cannot deliver your Report within 3 business days, we email you and you can ask for a full refund; if we cannot deliver it at all, we refund you without you having to ask.",
  },
  {
    question: "Does the report’s price count toward anything?",
    answer:
      "Yes. Within 14 days of your purchase, the full amount can be used once as a credit: toward Monitoring or your first statement of work, whichever you start first.",
  },
  {
    question: "What does monitoring do?",
    answer:
      "We re-check your business in full every week and run a quick check every day. You get a weekly summary, and an alert at once if something urgent breaks, such as your site going down or your booking link failing.",
  },
  {
    question: "Can I cancel monitoring?",
    answer: "Yes, anytime. It stops at the end of the period you’ve paid for.",
  },
  {
    question: "How is the grade measured?",
    answer:
      "Against Visigain’s standard, applied the same way to every business. We only grade what we could measure, and we say so when we couldn’t.",
  },
  {
    question: "Who is it for?",
    answer: "Local businesses of every category.",
  },
  {
    question: "Do you need access to my website or accounts?",
    answer: "No. We measure what a buyer, a search engine or an AI assistant can see from the outside.",
  },
];
