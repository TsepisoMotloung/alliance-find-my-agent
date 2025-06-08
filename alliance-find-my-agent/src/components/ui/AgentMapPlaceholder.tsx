"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const generateRandomPosition = () => ({
  left: `${Math.random() * 80 + 10}%`,
  top: `${Math.random() * 70 + 10}%`,
});

export default function AgentMapAnimation() {
  const [positions, setPositions] = useState([
    generateRandomPosition(),
    generateRandomPosition(),
    generateRandomPosition(),
    generateRandomPosition(),
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions([
        generateRandomPosition(),
        generateRandomPosition(),
        generateRandomPosition(),
        generateRandomPosition(),
      ]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="aspect-[16/9] w-full rounded-xl shadow-xl relative ">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent mix-blend-soft-light"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Moving pins */}
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          animate={{ left: pos.left, top: pos.top }}
          transition={{ duration: 5, ease: "easeInOut" }}
          className="absolute"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            className="relative"
          >
            {/* Radar pulse */}
            <motion.div
              className="absolute left-1/2 top-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/20 blur-sm"
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
            <MapPin size={28} className="text-red-500 drop-shadow" />
          </motion.div>
        </motion.div>
      ))}

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="text-red-600 font-semibold text-sm md:text-base bg-white/20 px-3 py-1 rounded shadow border border-white/10 backdrop-blur"
          animate={{ opacity: [0, 1, 0.6, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          Live Agent Activity
        </motion.div>
      </div>
    </div>
  );
}
