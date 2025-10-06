"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is Terrum?",
    answer:
      "Terrum is a Real-World Asset (RWA) platform that fractionalizes real estate using Investment NFTs. Each NFT represents direct ownership in a property, entitling holders to monthly rental income and a share of the property’s appreciation value.",
  },
  {
    question: "How does the Investment NFT model work?",
    answer:
      "Terrum acquires an income-generating property. We issue a limited series of NFTs representing fractional ownership (e.g., 20 NFTs for a $20,000 property). Holders receive monthly rental income proportional to their stake. If the property value rises, NFT holders benefit from capital appreciation.",
  },
  {
    question: "What happens if the project fails?",
    answer:
      "Since Terrum is property-backed, your investment is tied to a real, tangible asset. If the project fails, the property will be sold on the market, and proceeds will be distributed proportionally to NFT holders. This ensures investors’ capital is supported by the underlying real estate, not just a digital promise.",
  },
  {
    question: "What do I gain as an NFT holder?",
    answer:
      "Owning an Investment NFT provides three benefits: Passive income from monthly rental payouts, capital appreciation if the property value increases, and an exit opportunity since you can resell your NFT on secondary markets anytime.",
  },
  {
    question: "How are rental incomes distributed?",
    answer:
      "Rental income is collected from tenants and distributed monthly to NFT holders, in proportion to the number of NFTs owned. The process is automated via smart contracts, ensuring transparency.",
  },
  {
    question: "Can I sell my NFT before the investment term ends?",
    answer:
      "Yes. NFTs can be traded on secondary marketplaces, giving investors liquidity. You are not locked in until maturity.",
  },
  {
    question: "What types of properties does Terrum focus on?",
    answer:
      "Terrum targets income-generating assets with stable demand, such as residential rentals, student housing, vacation rentals, and commercial rental units.",
  },
  {
    question: "Why should I choose Terrum?",
    answer:
      "Low entry point: Invest in real estate with just one NFT. Asset-backed security: Each NFT is tied to a real property, ensuring tangible value. Recurring income: Monthly rental payouts. Liquidity: Trade NFTs freely in secondary markets. Transparency: Blockchain ensures verifiable ownership and cashflows.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-darkGreen py-16 px-6 md:px-20 ">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-beige-100 mb-10">
          Frequently Asked Questions
        </h2>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto divide-y divide-gray-200">
        {faqs.map((faq, index) => (
          <div key={index} className="py-4">
            <button
              className="flex justify-between items-center w-full text-left text-beige-100 font-medium"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <ChevronDownIcon
                className={`h-5 w-5 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.p
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3}}
                  className="mt-3 text-beige-100 text-sm leading-relaxed overflow-hidden"
                >
                  {faq.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
