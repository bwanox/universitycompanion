"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LeftDrawer = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard Home", path: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Assignments", path: "/pages/assignments", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "Grades Overview", path: "/pages/grades", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { name: "My space", path: "/pages/routine", icon: "M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" },
    { name: "User Profile", path: "/pages/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },

  ];

  const gradients = [
    { from: 'from-teal-500/20', to: 'to-emerald-600/20', border: 'border-teal-400/30', icon: 'text-teal-300', shadow: 'shadow-teal-500/30', glow: 'bg-teal-400' },
    { from: 'from-purple-500/20', to: 'to-violet-600/20', border: 'border-purple-400/30', icon: 'text-purple-300', shadow: 'shadow-purple-500/30', glow: 'bg-purple-400' },
    { from: 'from-orange-500/20', to: 'to-red-600/20', border: 'border-orange-400/30', icon: 'text-orange-300', shadow: 'shadow-orange-500/30', glow: 'bg-orange-400' },
    { from: 'from-lime-500/20', to: 'to-green-600/20', border: 'border-lime-400/30', icon: 'text-lime-300', shadow: 'shadow-lime-500/30', glow: 'bg-lime-400' },
    { from: 'from-yellow-500/20', to: 'to-amber-600/20', border: 'border-yellow-400/30', icon: 'text-yellow-300', shadow: 'shadow-yellow-500/30', glow: 'bg-yellow-400' },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-950/98 via-teal-950/95 to-slate-950/98 backdrop-blur-xl min-h-screen p-6 border-r border-teal-400/20 shadow-2xl shadow-teal-500/10 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-10 right-5 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-5 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-orange-400/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      {/* Navigation Title */}
      <div className="mb-4 relative">
        <h3 className="text-xs font-bold text-teal-300/60 uppercase tracking-wider px-2">Navigation</h3>
      </div>

      <ul className="space-y-3 relative">
        {menuItems.map((item, index) => {
          const gradient = gradients[index % gradients.length];
          const isActive = pathname === item.path;
          
          return (
            <li key={index} className="relative">
              <Link href={item.path}>
                <div
                  className={`group relative flex items-center space-x-3 p-4 rounded-2xl transition-all duration-500 overflow-hidden
                    ${
                      isActive
                        ? `bg-gradient-to-r ${gradient.from} ${gradient.to} border ${gradient.border} ${gradient.shadow} shadow-xl scale-[1.02]`
                        : `bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-gradient-to-r hover:${gradient.from} hover:${gradient.to} hover:${gradient.border} hover:scale-105 hover:${gradient.shadow} hover:shadow-xl`
                    }`
                  }
                >
                  {/* Hover shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  {/* Icon container with gradient */}
                  <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-xl ${gradient.shadow}`
                      : `bg-white/10 group-hover:bg-gradient-to-br group-hover:${gradient.from} group-hover:${gradient.to} group-hover:shadow-xl group-hover:${gradient.shadow}`
                  }`}>
                    <svg
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-500 ${
                        isActive 
                          ? gradient.icon
                          : `text-white/60 group-hover:${gradient.icon} group-hover:scale-110`
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                    </svg>
                  </div>

                  {/* Text */}
                  <span
                    className={`font-black text-sm transition-all duration-500 ${
                      isActive
                        ? "text-white"
                        : "text-blue-200/70 group-hover:text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute right-3 w-2.5 h-2.5 rounded-full ${gradient.glow} animate-pulse shadow-lg ${gradient.shadow}`}></div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      
      {/* Bottom decorative element */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-400/20 backdrop-blur-xl hover:scale-105 transition-all duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-xl animate-pulse">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-teal-100">Quick Access</p>
              <p className="text-xs text-teal-300/70 font-semibold">Always connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftDrawer;