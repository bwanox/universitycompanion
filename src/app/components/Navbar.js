"use client";

import React from "react";
import { useAuth } from "../auth/AuthContext"; // Use AuthContext

const Navbar = ({ searchTerm, setSearchTerm, onLoginClick, onAccountCreationClick }) => {
  const { user, logout } = useAuth(); // Get user state & logout function

  return (
    <div className="bg-blue-600 p-4 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <div className="text-white font-bold text-2xl">University Companion</div>

      {/* Search Bar */}
      <div className="w-1/3 bg-white rounded-full p-2 flex items-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 rounded-full focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Account Section */}
      <div className="flex items-center space-x-4">
        {user ? (
          // If logged in, show email and logout button
          <>
            <span className="text-white">{user.email}</span>
            <button className="text-white font-semibold" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          // If not logged in, show login and create account buttons
          <>
            <button className="text-white font-semibold" onClick={onAccountCreationClick}>
              Create Account
            </button>
            <button className="text-white font-semibold" onClick={onLoginClick}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
