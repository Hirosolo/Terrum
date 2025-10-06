"use client";

import { useState } from "react";
import { motion } from "framer-motion"; // 👈 import
import BalanceChart from "../components/dashBoard/BalanceChart";
import StatsCards from "../components/dashBoard/StatsCards";
import MyPositionSection from "../components/dashBoard/MyPositionSectionClean";
import MarketplaceSearchBar from "../components/investment/header";
import { useUserPortfolioStats } from "../components/dashBoard/useUserPortfolioStats";

export default function Dashboard() {
  const [autoRedeem, setAutoRedeem] = useState(false);

  // Use real portfolio stats
  const { data: portfolioStats, isLoading } = useUserPortfolioStats();

  return (
    <motion.div
      className="w-full overflow-x-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <MarketplaceSearchBar />
      <main className="h-screen w-full bg-beige-100 text-white p-4 sm:p-6">
        <div className="w-full h-full flex flex-col gap-6">
          {/* Chart card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <BalanceChart
              balance={`$${
                portfolioStats?.totalBalance?.toLocaleString() ?? "0"
              }`}
              change="+0.57%"
              date={new Date().toDateString()}
            />
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <StatsCards
              rwaBalance={portfolioStats?.availableToClaim?.toString() ?? "0"}
              rentalYield={portfolioStats?.monthlyEarnings?.toString() ?? "120.50"}
              activeProperty={portfolioStats?.totalInvestment?.toString() ?? "0"}
              autoRedeem={autoRedeem}
              onAutoRedeemChange={setAutoRedeem}
            />
          </motion.div>

          {/* Positions table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <MyPositionSection />
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}