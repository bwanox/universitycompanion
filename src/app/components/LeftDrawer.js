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

  return (
    <div className="w-72 bg-slate-900/95 backdrop-blur-lg min-h-screen p-6 border-r border-blue-800/30 shadow-2xl">
      {/* Title with gradient text */}
      <h2 className="text-xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
        University Companion
      </h2>

      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link href={item.path}>
              <div
                className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 
                  ${
                    pathname === item.path 
                      ? "bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/20 shadow-lg"
                      : "hover:bg-white/5 border border-transparent hover:border-cyan-500/10"
                  }`
                }
              >
                {/* Icon */}
                <svg
                  className={`h-5 w-5 flex-shrink-0 ${
                    pathname === item.path 
                      ? "text-cyan-400" 
                      : "text-blue-400/60 group-hover:text-cyan-400"
                  } transition-colors`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>

                {/* Text */}
                <span
                  className={`font-medium ${
                    pathname === item.path
                      ? "text-cyan-100"
                      : "text-blue-200/80 group-hover:text-cyan-100"
                  } transition-colors`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftDrawer;