"use client";

import React from 'react';

const WelcomeSection = () => {
  return (
    <div className="group relative bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-10 border border-cyan-400/20 shadow-2xl shadow-cyan-500/10 transition-all duration-500 hover:shadow-cyan-500/20 hover:border-cyan-400/40 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl group-hover:bg-fuchsia-500/30 transition-all duration-500"></div>
      
      <div className="relative space-y-6">
        <div className="flex items-start gap-4">
          {/* Decorative icon */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
          </div>
          
          <div className="flex-1">
            <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent transition-all duration-500 group-hover:from-cyan-200 group-hover:via-blue-200 group-hover:via-violet-200 group-hover:to-fuchsia-200 leading-tight mb-2">
              Welcome to Your
              <span className="block mt-2">Study Universe</span>
            </h1>
            
            <div className="flex flex-wrap gap-2 mt-4 mb-6">
              {[
                { emoji: '🎯', text: 'Track Goals', color: 'from-cyan-400 to-blue-500' },
                { emoji: '📚', text: 'Study Smart', color: 'from-violet-400 to-purple-500' },
                { emoji: '🚀', text: 'Achieve More', color: 'from-pink-400 to-rose-500' },
              ].map((badge, index) => (
                <span key={index} className={`px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer`}>
                  {badge.emoji} {badge.text}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-lg text-cyan-100/90 leading-relaxed font-medium">
          Your personal hub for academic excellence. Connect with peers, share homework solutions, 
          track assignments, and build a thriving learning community together.
        </p>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-cyan-400/20">
          {[
            { number: '10K+', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { number: '500+', label: 'Study Groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { number: '1M+', label: 'Solutions Shared', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          ].map((stat, index) => (
            <div key={index} className="text-center group/stat">
              <div className="flex justify-center mb-2">
                <svg className="w-6 h-6 text-cyan-300 group-hover/stat:text-cyan-200 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/>
                </svg>
              </div>
              <p className="text-2xl font-black text-white group-hover/stat:text-cyan-200 transition-colors">{stat.number}</p>
              <p className="text-sm text-cyan-200/70 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Animated gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 via-violet-500 to-fuchsia-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default WelcomeSection;