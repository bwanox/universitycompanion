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
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-950/98 via-teal-950/98 via-purple-950/98 to-slate-950/98 backdrop-blur-xl shadow-2xl shadow-teal-500/10 py-4 border-b border-teal-400/20 z-50 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-0 left-1/2 w-80 h-80 bg-orange-400/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      
      <div className="container mx-auto flex items-center justify-between px-6 relative z-10">
        {/* Logo */}
        <div className="group flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 flex items-center justify-center shadow-xl group-hover:shadow-teal-500/60 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></div>
          </div>
          <div>
            <span className="text-white font-black text-2xl tracking-tight bg-gradient-to-r from-teal-200 via-emerald-200 to-green-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-teal-100 group-hover:via-emerald-100 group-hover:to-green-100">
              University Companion
            </span>
            <p className="text-xs text-teal-300/70 font-bold">Connect • Share • Succeed</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 mx-8 max-w-2xl">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <input
              type="text"
              placeholder="Search posts, homework, study materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full py-3.5 pl-6 pr-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-teal-400/20 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400/60 text-white placeholder-teal-200/50 transition-all duration-300 shadow-lg focus:shadow-teal-500/30 font-medium"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <svg
                  className="h-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            {/* Dropdown for Search Suggestions */}
            {searchTerm && (
              <div className="absolute top-full mt-3 w-full bg-slate-950/98 backdrop-blur-xl border border-teal-400/20 rounded-2xl shadow-2xl shadow-teal-500/20 z-10 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-teal-200/80 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border-b border-teal-500/10 last:border-b-0 hover:bg-teal-500/10 cursor-pointer transition-all duration-200 group/item"
                    >
                      <p className="text-white font-medium group-hover/item:text-teal-200 transition-colors">
                        {post.content.slice(0, 100)}
                        {post.content.length > 100 && "..."}
                      </p>
                      {post.imageInfo && (
                        <p className="text-teal-200/60 text-xs mt-1">
                          {post.imageInfo.slice(0, 100)}
                          {post.imageInfo.length > 100 && "..."}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-teal-200/60">No results found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 backdrop-blur-xl border border-teal-400/20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">
                    {user.name || user.email}
                  </span>
                  <span className="text-xs text-teal-300/70 font-medium">
                    Student Account
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={onAccountCreationClick}
                className="group relative px-6 py-3 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 hover:from-teal-400 hover:via-emerald-400 hover:to-green-400 text-white rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Create Account</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
              <button
                onClick={onLoginClick}
                className="group relative px-6 py-3 border-2 border-teal-400/40 bg-white/5 backdrop-blur-xl hover:bg-gradient-to-r hover:from-teal-500/20 hover:to-emerald-500/20 text-teal-100 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-teal-500/20 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;