"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`border rounded-xl overflow-hidden transition-all ${
              isOpen ? "border-[#1e40af]" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <button
              className="w-full flex items-center justify-between text-left px-6 py-4 bg-white"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span className={`font-semibold text-base ${isOpen ? "text-[#1e40af]" : "text-[#0f172a]"}`}>
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 ml-4 transition-transform ${
                  isOpen ? "rotate-180 text-[#1e40af]" : "text-gray-400"
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-4 bg-white">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
