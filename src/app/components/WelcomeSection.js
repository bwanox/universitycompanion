"use client";

import React from 'react';

const WelcomeSection = () => {
  return (
    <div className="group relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-800/30 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/30">
      <div className="space-y-5">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent transition-all duration-500 hover:bg-gradient-to-l">
          Welcome to University Companion
        </h1>
        <p className="text-lg text-blue-200/80 leading-relaxed">
          Your personal assistant for academic success. Seamlessly track assignments, 
          monitor grades, and stay connected with your learning community.
        </p>
      </div>
      
      {/* Animated gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default WelcomeSection;