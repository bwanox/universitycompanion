"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LeftDrawer = () => {
  const pathname = usePathname(); // Get current path to highlight active link

  // Define menu items
  const menuItems = [
    { name: "🏠 Home", path: "/" },
    { name: "📝 Assignments", path: "/pages/assignments" },
    { name: "📊 Grades", path: "/pages/grades" },
    { name: "👤 Profile", path: "/pages/profile" },
  ];

  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-white">Dashboard</h2>
      <ul className="space-y-4">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link href={item.path}>
              <span
                className={`block cursor-pointer rounded-lg p-3 transition duration-300 ${
                  pathname === item.path
                    ? "bg-blue-600 text-white font-bold"
                    : "hover:bg-blue-700"
                }`}
              >
                {item.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftDrawer;
