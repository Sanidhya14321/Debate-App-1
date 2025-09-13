"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does the AI scoring system work?",
    answer: "Our AI scoring system evaluates arguments based on multiple criteria including clarity, logical structure, evidence quality, vocabulary richness, and sentiment analysis. The AI uses advanced natural language processing to provide real-time feedback and scores that help you improve your debating skills."
  },
  {
    question: "Can I practice debates alone?",
    answer: "Yes! You can create practice debates and submit arguments to receive AI feedback even without other participants. The system will analyze your arguments and provide detailed scoring to help you improve your debate techniques."
  },
  {
    question: "How are debate topics selected?",
    answer: "You can create custom debate topics when starting a new debate, or choose from our curated list of trending topics. Topics range from current events and politics to philosophy, science, and social issues."
  },
  {
    question: "What makes a high-scoring argument?",
    answer: "High-scoring arguments typically feature clear logical structure, strong evidence or reasoning, sophisticated vocabulary, balanced tone, and direct engagement with the debate topic. The AI also rewards creativity and original thinking."
  },
  {
    question: "Can I debate with friends privately?",
    answer: "Absolutely! You can create private debates and share the access code with specific people. Private debates don't appear in the public debate list and are only accessible to invited participants."
  },
  {
    question: "How does the leaderboard ranking work?",
    answer: "Leaderboard rankings are based on your average argument scores, total number of debates participated in, win rate, and consistency of performance. Active participation and high-quality arguments will improve your ranking over time."
  },
  {
    question: "Is there a mobile app available?",
    answer: "Currently, DebAI is available as a responsive web application that works great on mobile browsers. We're working on dedicated mobile apps for iOS and Android, which will be available soon."
  },
  {
    question: "How can I improve my debate skills?",
    answer: "Practice regularly, pay attention to AI feedback, study high-scoring arguments from other users, participate in different types of debates, and focus on the scoring criteria: clarity, logic, evidence, vocabulary, and engagement with opposing viewpoints."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqData.map((faq, index) => (
        <Card key={index} className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
          <CardContent className="p-0">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left hover:bg-zinc-800/50 transition-colors duration-200 flex items-center justify-between"
            >
              <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="w-5 h-5 text-[#ff6b35]" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 pt-2 border-t border-zinc-800">
                    <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}