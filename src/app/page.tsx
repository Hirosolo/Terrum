"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import MarketplaceSearchBar from "./components/investment/header";
import LandingPagePropertyList from "./components/landingPage/landingPagePropertyList";
import LandingPageGuide from "./components/landingPage/guide";
import AboutUs from "./components/landingPage/aboutUs";
import FAQ from "./components/landingPage/FAQ";
import LogoLoop from "./components/landingPage/LogoLoop";
import PropertyInfoContent from "./components/propertyInfo/PropertyInfoContent";
import { PropertyData } from "@/lib/hooks";

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const infoRef = useRef<HTMLElement | null>(null);

  const handleBuy = (property: PropertyData) => {
    setSelectedProperty(property);
  };

  const closeInfo = () => setSelectedProperty(null);

  // Prevent background scroll when modal open and handle ESC
  useEffect(() => {
    if (selectedProperty) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeInfo();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [selectedProperty]);

  const imageLogos = [
    { src: "/logo-Vikki.svg", alt: "Vikki", href: "https://company1.com" },
    { src: "/logo-Vietjet.svg", alt: "Vietjet", href: "https://company2.com" },
    { src: "/logo-Superteam.svg", alt: "Superteam", href: "https://company3.com" },
    { src: "/logo-SovicoGroup.svg", alt: "SovicoGroup", href: "https://company3.com" },
    { src: "/logo-NamiFoundation.svg", alt: "NamiFoundation", href: "https://company3.com" },
    { src: "/logo-HDBank.svg", alt: "HDBank", href: "https://company3.com" },
  ];

  return (
    <main className="w-full overflow-x-hidden bg-beige-100 text-gray-900">
      <MarketplaceSearchBar />
      {/* Hero Section */}
      <section className="px-6 sm:px-12 py-16 flex flex-col lg:flex-row items-center justify-between gap-12 bg-darkGreen overflow-hidden">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeIn" }}
          className="flex-1 space-y-6"
        >
          <motion.h1 
            className="text-5xl font-extrabold leading-tight text-beige-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="block"
            >
              FROM
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="block"
            >
              SMALL FUNDS
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="block"
            >
              TO
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="block"
            >
              BIG PROPERTIES
            </motion.span>
          </motion.h1>
          <motion.p
            className="max-w-lg text-beige-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            We make it possible for anyone to invest in premium real estate with
            small amounts of capital. Through tokenization, you can own a
            fraction of global properties, earn rental yields, and benefit from
            appreciation—all starting with just a few dollars.
          </motion.p>
          <motion.button
            onClick={() => {
              window.location.href = "/marketPlace";
            }}
            className="px-6 py-3 bg-beige-100 rounded-lg font-medium shadow hover:bg-beige-300 text-black font-semibold hover:scale-105 transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View projects →
          </motion.button>
        </motion.div>

        {/* Right illustration */}
        <motion.div 
          className="flex-1 flex justify-center"
        >
          <motion.img
            src="/image-heroSection.png"
            alt="Hero illustration"
            className="max-h-[400px]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1,
              scale: {
                type: "spring",
                damping: 30,
                stiffness: 85,
                mass: 0.5
              },
              opacity: {
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { 
                type: "spring",
                stiffness: 300,
                damping: 15
              }
            }}
            whileTap={{ scale: 0.98 }}
          />
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="px-6 sm:px-12 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured projects</h2>
          <a href="/invesment" className="text-xs md:text-xl font-semibold hover:border-b-2 hover:border-green hover:pb-1 transition-all duration-200">
            View more
          </a>
        </div>
        <LandingPagePropertyList onBuy={handleBuy} />
      </section>

      {/* About Us */}
      <section id="about-us">
        <AboutUs />
      </section>

      {/* Guide */}
      <section id="guide">
        <LandingPageGuide />
      </section>

      {/* FAQ */}
      <section id="faq">
        <FAQ />
      </section>

      {/* Property Info Modal */}
      {selectedProperty && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeInfo();
          }}
          aria-modal="true"
          role="dialog"
        >
          <div className="relative w-full max-w-7xl mx-4 sm:mx-8 my-12 sm:my-0">
            <button
              onClick={closeInfo}
              className="absolute -top-10 right-0 sm:-top-12 sm:-right-12 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-beige-100">
              <PropertyInfoContent property={selectedProperty} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-darkGreen text-beige-100 py-16">
        <div className="container mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <img src="/logo-landzen.svg" alt="Landzen" className="h-8" />
              <p className="text-sm opacity-80 mt-4">
                Making real estate investment accessible to everyone through blockchain technology.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  <span>University of Information and Technology, Thu Duc, HCMC, Vietnam</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <a href="mailto:contact@terrum.com" className="hover:text-green">
                    contact@terrum.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  <a href="tel:+8400000000" className="hover:text-green">
                    +84 00000000
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#projects" className="hover:text-green">Featured Projects</a>
                </li>
                <li>
                  <a href="#about-us" className="hover:text-green">About Us</a>
                </li>
                <li>
                  <a href="#guide" className="hover:text-green">Guide</a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-green">FAQ</a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stay Updated</h3>
              <p className="text-sm opacity-80">
                Subscribe to our newsletter for the latest updates and opportunities.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-beige-100/10 border border-beige-100/20 text-sm focus:outline-none focus:border-green"
                />
                <button className="px-4 py-2 bg-green rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-beige-100/20 text-sm text-center opacity-80">
            <p>© 2025 Terrum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
