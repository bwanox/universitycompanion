"use client";

import React from "react";

export default function NeonLoader() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-t-4 border-blue-400 border-t-transparent rounded-full animate-spin neon-glow" />
      <style jsx>{`
        .neon-glow {
          filter: drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #00ffff);
        }
      `}</style>
    </div>
  );
}
