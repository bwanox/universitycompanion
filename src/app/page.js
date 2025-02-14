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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
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
        <LeftDrawer />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <WelcomeSection />
          <CommunityFeed />

          {/* Authentication Modals */}
          {!isLoggedIn && (
            <>
              {showAccountCreation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-lg w-full">
                    <AccountCreation
                      onClose={() => setShowAccountCreation(false)}
                      onSuccess={handleAccountCreationSuccess}
                    />
                  </div>
                </div>
              )}

              {showLogin && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-lg w-full">
                    <Login
                      onClose={() => setShowLogin(false)}
                      onSuccess={handleLoginSuccess}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
