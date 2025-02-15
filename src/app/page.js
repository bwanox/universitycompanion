"use client";

import { useState } from "react";
import AccountCreation from "./auth/AccountCreation";
import Login from "./auth/Login";
import Navbar from "./components/Navbar";
import LeftDrawer from "./components/LeftDrawer";
import WelcomeSection from "./components/WelcomeSection";
import CommunityFeed from "./components/CommunityFeed";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onLoginClick={() => setShowLogin(true)}
        onAccountCreationClick={() => setShowAccountCreation(true)}
        onLogoutClick={handleLogout}
      />

      <div className="flex">
        {/* Left Drawer */}
        <div className="hidden lg:block">
          <LeftDrawer />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-12 space-y-12">
          <WelcomeSection />
          <CommunityFeed />
        </main>
      </div>

      {/* Authentication Modals */}
      {!isLoggedIn && (
        <>
          {showAccountCreation && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
              <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-lg w-full border border-gray-300">
                <AccountCreation
                  onClose={() => setShowAccountCreation(false)}
                  onSuccess={handleAccountCreationSuccess}
                />
              </div>
            </div>
          )}

          {showLogin && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
              <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-lg w-full border border-gray-300">
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
