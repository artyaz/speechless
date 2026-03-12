"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PRACTICE_TYPES } from "~/types/practice";
import { PracticeTypeCard } from "~/components/practice/practice-type-card";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Practice
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Choose your training mode
        </p>
      </div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {PRACTICE_TYPES.map((config) => (
          <motion.div key={config.type} variants={item}>
            <PracticeTypeCard
              {...config}
              onClick={() => router.push(`/practice/${config.type}`)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
