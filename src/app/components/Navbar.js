"use client";

import React from "react";
import { useAuth } from "../auth/AuthContext";

const Navbar = ({
  searchTerm,
  setSearchTerm,
  onLoginClick,
  onAccountCreationClick,
  onLogoutClick,
}) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-700 shadow-md py-4">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <div className="text-white font-semibold text-2xl">
          University Companion
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 mx-6">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-4 pr-10 rounded-full bg-blue-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM8 14A6 6 0 108 2a6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Account Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-300 font-medium">{user.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 border border-blue-500 text-white rounded-full hover:bg-gray-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onAccountCreationClick}
                className="px-4 py-2 border border-blue-500 text-white rounded-full hover:bg-gray-600 transition"
              >
                Create Account
              </button>
              <button
                onClick={onLoginClick}
                className="px-4 py-2 border border-blue-500 text-white rounded-full hover:bg-gray-600 transition"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
