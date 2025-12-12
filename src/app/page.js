"use client";

import { useState, useEffect } from "react";
import AccountCreation from "./auth/AccountCreation";
import Login from "./auth/Login";
import CommunityFeed from "./components/CommunityFeed";
import NeonLoader from "./components/NeonLoader";
import { useAuth } from "./auth/AuthContext";
import PomodoroClock from "./components/pomodoroClock";
import DailyCalendar from "./components/DailyCalendar";
import Navbar from "./components/Navbar";
import LeftDrawer from "./components/LeftDrawer";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Get user and loading state from your AuthContext
  const { user, loading } = useAuth();

  // Sync local isLoggedIn state with auth context
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  // Show neon loader while auth status is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <NeonLoader />
      </div>
    );
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleAccountCreationSuccess = () => {
    setIsLoggedIn(true);
    setShowAccountCreation(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 via-purple-950 to-slate-950 text-white font-sans relative overflow-x-hidden">
      {/* Top Navigation Bar - Hidden on mobile */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onLoginClick={() => setShowLogin(true)}
          onAccountCreationClick={() => setShowAccountCreation(true)}
          onLogoutClick={handleLogout}
        />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-black bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">UniCompanion</h1>
          <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 border border-teal-400/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </button>
        </div>
      </div>
      {/* Dynamic Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Small floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-teal-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-lime-400 rounded-full animate-bounce-slow opacity-50"></div>
        <div className="absolute bottom-1/4 left-2/3 w-2 h-2 bg-coral-400 rounded-full animate-float opacity-70" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce-slow opacity-60" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="flex pt-14 lg:pt-16 pb-20 lg:pb-0">
        {/* Left Drawer - Desktop only */}
        <div className="hidden lg:block fixed top-16 left-0 bottom-0 z-40 w-72">
          <LeftDrawer />
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-0 lg:ml-72 px-3 py-4 lg:p-10 relative z-10 w-full max-w-full overflow-x-hidden">
          {/* Community Action Cards */}
          <section className="mb-6 lg:mb-10 w-full">
            {/* Mobile: Horizontal scroll cards */}
            <div className="lg:hidden overflow-x-auto pb-4 -mx-3 px-3 scrollbar-hide">
              <div className="flex gap-3 min-w-max">
                <a href="/pages/routine" className="flex-shrink-0 w-32 group relative bg-gradient-to-br from-teal-500/15 via-emerald-500/15 to-teal-600/15 backdrop-blur-xl border border-teal-400/30 rounded-2xl p-4 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="relative flex flex-col items-center space-y-2 text-center">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/></svg>
                    </span>
                    <div>
                      <p className="text-xs font-bold text-teal-100">My Space</p>
                    </div>
                  </div>
                </a>
                <a href="/pages/assignments" className="flex-shrink-0 w-32 group relative bg-gradient-to-br from-purple-500/15 via-violet-500/15 to-purple-600/15 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-4 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="relative flex flex-col items-center space-y-2 text-center">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6M9 8h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
                    </span>
                    <div>
                      <p className="text-xs font-bold text-purple-100">Assignments</p>
                    </div>
                  </div>
                </a>
                <a href="/pages/grades" className="flex-shrink-0 w-32 group relative bg-gradient-to-br from-orange-500/15 via-coral-500/15 to-orange-600/15 backdrop-blur-xl border border-orange-400/30 rounded-2xl p-4 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="relative flex flex-col items-center space-y-2 text-center">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z"/></svg>
                    </span>
                    <div>
                      <p className="text-xs font-bold text-orange-100">Grades</p>
                    </div>
                  </div>
                </a>
                <button className="flex-shrink-0 w-32 group relative bg-gradient-to-br from-lime-500/15 via-green-500/15 to-lime-600/15 backdrop-blur-xl border border-lime-400/30 rounded-2xl p-4 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="relative flex flex-col items-center space-y-2 text-center">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </span>
                    <p className="text-xs font-bold text-lime-100">Groups</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Desktop: Original grid */}
            <div className="hidden lg:grid grid-cols-6 gap-4 animate-fade-in">
              <a href="/pages/routine" className="group relative bg-gradient-to-br from-teal-500/15 via-emerald-500/15 to-teal-600/15 backdrop-blur-xl border border-teal-400/30 rounded-3xl p-6 hover:scale-110 hover:rotate-1 hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 via-teal-400/20 to-teal-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative flex flex-col items-center space-y-3 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-xl group-hover:shadow-teal-500/60 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/></svg>
                  </span>
                  <div>
                    <p className="text-sm font-black text-teal-100">My Space</p>
                    <p className="text-xs text-teal-300/70 font-semibold">Plan your day</p>
                  </div>
                </div>
              </a>
              <a href="/pages/assignments" className="group relative bg-gradient-to-br from-purple-500/15 via-violet-500/15 to-purple-600/15 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-6 hover:scale-110 hover:-rotate-1 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-purple-400/20 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative flex flex-col items-center space-y-3 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-xl group-hover:shadow-purple-500/60 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6M9 8h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
                  </span>
                  <div>
                    <p className="text-sm font-black text-purple-100">Assignments</p>
                    <p className="text-xs text-purple-300/70 font-semibold">Track deadlines</p>
                  </div>
                </div>
              </a>
              <a href="/pages/grades" className="group relative bg-gradient-to-br from-orange-500/15 via-coral-500/15 to-orange-600/15 backdrop-blur-xl border border-orange-400/30 rounded-3xl p-6 hover:scale-110 hover:rotate-1 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 via-orange-400/20 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative flex flex-col items-center space-y-3 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-xl group-hover:shadow-orange-500/60 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z"/></svg>
                  </span>
                  <div>
                    <p className="text-sm font-black text-orange-100">Grades</p>
                    <p className="text-xs text-orange-300/70 font-semibold">Track progress</p>
                  </div>
                </div>
              </a>
              <button className="group relative bg-gradient-to-br from-lime-500/15 via-green-500/15 to-lime-600/15 backdrop-blur-xl border border-lime-400/30 rounded-3xl p-6 hover:scale-110 hover:-rotate-1 hover:shadow-2xl hover:shadow-lime-500/40 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/0 via-lime-400/20 to-lime-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative flex flex-col items-center space-y-3 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center shadow-xl group-hover:shadow-lime-500/60 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </span>
                  <p className="text-xs font-black text-lime-100">Study Groups</p>
                </div>
              </button>
              <button className="group relative bg-gradient-to-br from-yellow-500/15 via-amber-500/15 to-yellow-600/15 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-6 hover:scale-110 hover:rotate-1 hover:shadow-2xl hover:shadow-yellow-500/40 transition-all duration-500 overflow-hidden hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative flex flex-col items-center space-y-3 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl group-hover:shadow-yellow-500/60 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  </span>
                  <p className="text-xs font-black text-yellow-100">Share Resources</p>
                </div>
              </button>
              <button className="group relative bg-gradient-to-br from-sky-500/15 via-blue-500/15 to-sky-600/15 backdrop-blur-xl border border-sky-400/30 rounded-3xl p-6 hover:scale-110 hover:-rotate-1 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-500 overflow-hidden hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/0 via-sky-400/20 to-sky-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-sky-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative flex flex-col items-center space-y-3 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-xl group-hover:shadow-sky-500/60 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </span>
                  <p className="text-xs font-black text-sky-100">Get Help</p>
                </div>
              </button>
            </div>
          </section>

          {/* Grid: Center feed with right sidebar widgets */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8 w-full">
            {/* Center Column (spans 2) */}
            <div className="xl:col-span-2 space-y-4 lg:space-y-8 w-full min-w-0">
              <CommunityFeed />
            </div>

            {/* Right Sidebar Widgets - Simplified for mobile */}
            <aside className="space-y-4 lg:space-y-6 w-full min-w-0">
              {/* Study Timer */}
              <div className="group relative bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-teal-600/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-teal-400/20 shadow-xl lg:shadow-2xl hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="hidden lg:block absolute -top-20 -right-20 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl group-hover:bg-teal-400/30 group-hover:scale-125 transition-all duration-700"></div>
                <div className="hidden lg:block absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all duration-700"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg lg:shadow-xl group-hover:rotate-12 transition-all duration-500">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h3 className="text-base lg:text-xl font-black bg-gradient-to-r from-teal-200 via-emerald-200 to-green-200 bg-clip-text text-transparent">Focus Timer</h3>
                  </div>
                  <PomodoroClock />
                </div>
              </div>

              {/* Today Calendar Snapshot */}
              <div className="group relative bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-purple-600/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-purple-400/20 shadow-xl lg:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="hidden lg:block absolute -top-20 -right-20 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl group-hover:bg-purple-400/30 group-hover:scale-125 transition-all duration-700"></div>
                <div className="hidden lg:block absolute bottom-0 left-0 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl group-hover:bg-violet-400/20 transition-all duration-700"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg lg:shadow-xl group-hover:-rotate-12 transition-all duration-500">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/></svg>
                    </div>
                    <h3 className="text-base lg:text-xl font-black bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">Today's Schedule</h3>
                  </div>
                  <DailyCalendar />
                </div>
              </div>

              {/* Trending Tags - Hidden on mobile */}
              <div className="hidden lg:block group relative bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-600/10 backdrop-blur-xl rounded-3xl p-6 border border-orange-400/20 shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl group-hover:bg-orange-400/30 group-hover:scale-125 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-400/10 rounded-full blur-2xl group-hover:bg-red-400/20 transition-all duration-700"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all duration-500">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <h3 className="text-xl font-black bg-gradient-to-r from-orange-200 via-red-200 to-rose-200 bg-clip-text text-transparent">Trending Now</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {tag: '#algorithms', color: 'from-teal-400 to-emerald-500', bg: 'bg-teal-500/20', border: 'border-teal-400/40'},
                      {tag: '#physics', color: 'from-purple-400 to-violet-500', bg: 'bg-purple-500/20', border: 'border-purple-400/40'},
                      {tag: '#machinelearning', color: 'from-orange-400 to-red-500', bg: 'bg-orange-500/20', border: 'border-orange-400/40'},
                      {tag: '#databases', color: 'from-lime-400 to-green-500', bg: 'bg-lime-500/20', border: 'border-lime-400/40'},
                      {tag: '#midterms', color: 'from-yellow-400 to-orange-500', bg: 'bg-yellow-500/20', border: 'border-yellow-400/40'},
                      {tag: '#studygroup', color: 'from-sky-400 to-blue-500', bg: 'bg-sky-500/20', border: 'border-sky-400/40'}
                    ].map(({tag, color, bg, border}) => (
                      <button key={tag} className={`px-4 py-2 text-sm font-bold rounded-full ${bg} border ${border} hover:scale-110 hover:-rotate-2 hover:shadow-lg transition-all duration-300 text-white`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Community Stats - Hidden on mobile */}
              <div className="hidden lg:block group relative bg-gradient-to-br from-lime-500/10 via-green-500/10 to-lime-600/10 backdrop-blur-xl rounded-3xl p-6 border border-lime-400/20 shadow-2xl hover:shadow-lime-500/40 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-lime-400/20 rounded-full blur-3xl group-hover:bg-lime-400/30 group-hover:scale-125 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-400/10 rounded-full blur-2xl group-hover:bg-green-400/20 transition-all duration-700"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center shadow-xl group-hover:-rotate-12 transition-all duration-500">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    </div>
                    <h3 className="text-xl font-black bg-gradient-to-r from-lime-200 via-green-200 to-emerald-200 bg-clip-text text-transparent">Your Impact</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-lime-500/10 backdrop-blur-sm border border-lime-400/20 hover:scale-105 transition-all duration-300">
                      <span className="text-sm font-semibold text-lime-100">Study Streak</span>
                      <span className="text-xl font-black text-lime-200">7 🔥</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-green-500/10 backdrop-blur-sm border border-green-400/20 hover:scale-105 transition-all duration-300">
                      <span className="text-sm font-semibold text-green-100">Posts Shared</span>
                      <span className="text-xl font-black text-green-200">12</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/20 hover:scale-105 transition-all duration-300">
                      <span className="text-sm font-semibold text-emerald-100">Helped Students</span>
                      <span className="text-xl font-black text-emerald-200">23 ❤️</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around items-center px-4 py-3">
          <a href="/" className="flex flex-col items-center gap-1 text-teal-400">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span className="text-xs font-bold">Home</span>
          </a>
          <a href="/pages/routine" className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-300 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/></svg>
            <span className="text-xs font-bold">Routine</span>
          </a>
          <button className="flex flex-col items-center gap-1 -mt-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center shadow-xl shadow-teal-500/40">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
            </div>
          </button>
          <a href="/pages/assignments" className="flex flex-col items-center gap-1 text-gray-400 hover:text-purple-300 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6M9 8h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
            <span className="text-xs font-bold">Tasks</span>
          </a>
          <a href="/pages/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-purple-300 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span className="text-xs font-bold">Profile</span>
          </a>
        </div>
      </div>

      {/* Authentication Modals */}
      {!isLoggedIn && (
        <>
          {showAccountCreation && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[10000] p-4">
              <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-12 shadow-2xl max-w-lg w-full border border-gray-300 mx-4 my-auto max-h-[90vh] overflow-y-auto">
                <AccountCreation
                  onClose={() => setShowAccountCreation(false)}
                  onSuccess={handleAccountCreationSuccess}
                />
              </div>
            </div>
          )}

          {showLogin && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[10000] p-4">
              <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-12 shadow-2xl max-w-lg w-full border border-gray-300 mx-4 my-auto max-h-[90vh] overflow-y-auto">
                <Login
                  onClose={() => setShowLogin(false)}
                  onSuccess={handleLoginSuccess}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
