"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <section className="bg-[#2B342B] text-white py-16 px-6 md:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center md:text-left">
        {/* Title */}
        <motion.h2 
          className="text-2xl md:text-3xl font-bold mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          About us
        </motion.h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          {/* Left side - Image */}
          <motion.div 
            className="flex justify-center"
           
          >
            <motion.img
            src="/image-aboutUs.png"
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

          {/* Right side - Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h3 
              className="text-xl md:text-2xl font-semibold leading-snug"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              Invest with Confidence <br />
              <span className="text-[#E0E0E0]">
                Your Gateway to Secure Real Estate Profits
              </span>
            </motion.h3>
            <motion.p 
              className="mt-6 text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              At Terrum, we were founded on a simple belief: the wealth-building
              power of real estate should be accessible to everyone, not just a
              select few. We saw a world of ambitious individuals locked out of
              one of the most stable investment classes. Our mission is to tear
              down those barriers, providing a platform that is not only
              accessible but fundamentally profitable and secure.
            </motion.p>
            <motion.p 
              className="mt-4 text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              We are more than a technology platform; we are your partner in
              building long-term wealth on a foundation of trust and tangible
              value.
            </motion.p>

            <motion.button 
              className="mt-8 bg-white text-[#1B231B] px-6 py-3 rounded-md font-semibold shadow-md hover:bg-gray-200 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Explore now →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
