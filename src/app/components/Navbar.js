"use client";

import React from "react";
import { useAuth } from "../auth/AuthContext";
import useSearchPosts from "../hooks/useSearchPosts";

const Navbar = ({
  searchTerm,
  setSearchTerm,
  onLoginClick,
  onAccountCreationClick,
  onLogoutClick,
}) => {
  const { user, logout } = useAuth();
  const { posts: searchResults, loading } = useSearchPosts(searchTerm);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl py-4 border-b border-blue-800/50 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 relative">
        {/* Logo */}
        <div className="group flex items-center space-x-2">
          <span className="text-white font-bold text-2xl tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-300 group-hover:bg-gradient-to-l">
            University Companion
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 mx-8 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses, materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 pl-5 pr-12 rounded-xl bg-white/5 backdrop-blur-sm border border-blue-800/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 text-gray-200 placeholder-blue-200/50 transition-all duration-300 shadow-lg"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
              <svg
                className="h-5 w-5 text-cyan-400/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {/* Dropdown for Search Suggestions */}
            {searchTerm && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-gray-600">Loading...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                      // You can add an onClick handler here to navigate to the post.
                    >
                      <p className="text-gray-800 font-medium">
                        {post.content.slice(0, 100)}
                        {post.content.length > 100 && "..."}
                      </p>
                      {post.imageInfo && (
                        <p className="text-gray-500 text-xs mt-1">
                          {post.imageInfo.slice(0, 100)}
                          {post.imageInfo.length > 100 && "..."}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-gray-600">No results found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-cyan-100">
                  {user.name || user.email}
                </span>
                <span className="text-xs text-cyan-400/80 font-light">
                  Student Account
                </span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400/90 hover:to-blue-500/90 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={onAccountCreationClick}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600/90 to-cyan-600/90 hover:from-blue-500/90 hover:to-cyan-500/90 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                Create Account
              </button>
              <button
                onClick={onLoginClick}
                className="px-4 py-2.5 border border-cyan-500/30 bg-slate-900/50 hover:bg-slate-900/70 text-cyan-100 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/10 active:scale-95"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;