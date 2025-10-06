"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useUserPortfolioStats } from "./useUserPortfolioStats";
import { HarvestModal } from "./HarvestModal";

type StatsCardsProps = {
  rwaBalance: string;
  rentalYield: string;
  activeProperty: string;
  autoRedeem?: boolean;
  onAutoRedeemChange?: (checked: boolean) => void;
};

// 🔹 Reusable hook to count up without rounding
function useCountUp(target: number, duration = 1.5, decimals = 0) {
  const [value, setValue] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        // keep the raw increasing value, not rounded up
        setValue(Number(latest));
      },
    });
    return () => controls.stop();
  }, [target, duration, motionValue]);

  return value.toFixed(decimals); // keep decimals but no forced rounding up
}

export default function StatsCards({
  rwaBalance,
  rentalYield,
  activeProperty,
  autoRedeem = false,
  onAutoRedeemChange,
}: StatsCardsProps) {
  // Get real portfolio stats
  const { data: portfolioStats } = useUserPortfolioStats();

  // State for harvest modal
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  // Use real data or fallback to props
  const availableToClaim =
    portfolioStats?.availableToClaim ?? (parseFloat(rwaBalance) || 0);
  const totalInvestment =
    portfolioStats?.totalInvestment ?? (parseFloat(activeProperty) || 0);
  const monthlyEarnings =
    portfolioStats?.monthlyEarnings ?? (parseFloat(rentalYield) || 7.165);
  const totalBalance =
    portfolioStats?.totalBalance ?? availableToClaim + totalInvestment;

  // animated numbers
  const availableAnimated = useCountUp(availableToClaim, 1.5, 2);
  const monthlyAnimated = useCountUp(monthlyEarnings, 1.5, 3);
  const investmentAnimated = useCountUp(totalInvestment, 1.5, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-60">
      {/* Available to claim */}
      <motion.div
        className="rounded-xl p-6 flex flex-col items-start justify-center bg-green"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-2xl text-beige-100">Available to claim</p>
        <p className="text-4xl font-bold mt-2 text-beige-100">
          ${availableAnimated}
        </p>
        <button
          onClick={() => setShowHarvestModal(true)}
          className="mt-3 text-sm text-green bg-beige-100 rounded-md border px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          Harvest
        </button>

        {/* Harvest Modal */}
        {showHarvestModal && (
          <HarvestModal
            onClose={() => setShowHarvestModal(false)}
            availableToClaim={availableToClaim}
          />
        )}
      </motion.div>

      {/* Monthly Earnings */}
      <motion.div
        className="rounded-xl p-6 flex flex-col justify-center bg-green"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-2xl text-beige-100">Monthly Earnings</p>
        <p className="text-4xl font-bold mt-2 text-beige-100">
          ${monthlyAnimated}
        </p>
      </motion.div>

      {/* Total Investment */}
      <motion.div
        className="rounded-xl p-6 flex flex-col justify-center bg-green"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p className="text-2xl text-beige-100">Total Investment</p>
        <p className="text-4xl font-bold mt-2 text-beige-100">
          ${investmentAnimated}
        </p>
      </motion.div>
    </div>
  );
}
