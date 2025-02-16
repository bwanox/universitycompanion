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
        className="fixed top-0 left-0 right-0 z-50"
      />

      <div className="flex pt-16"> {/* Add padding to avoid overlap with fixed navbar */}
        {/* Left Drawer */}
        <div className="hidden lg:block fixed top-16 left-0 bottom-0 z-40 w-72"> {/* Adjust top padding to match navbar height */}
          <LeftDrawer />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-12 space-y-12 ml-72"> {/* Add margin-left to avoid overlap with fixed left drawer */}
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