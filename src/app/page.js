"use client";

import { useState } from 'react';
import AccountCreation from './auth/AccountCreation';
import Login from './auth/Login';
import Navbar from './components/Navbar';
import LeftDrawer from './components/LeftDrawer';
import WelcomeSection from './components/WelcomeSection';
import CommunityFeed from './components/CommunityFeed';

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowAccountCreation(false);
  };

  const handleAccountCreationClick = () => {
    setShowAccountCreation(true);
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onLoginClick={handleLoginClick}
        onAccountCreationClick={handleAccountCreationClick}
      />

      <div className="flex">
        {/* Left Drawer */}
        <LeftDrawer />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Conditional Rendering for Account Creation / Login */}
          {!isLoggedIn ? (
            <>
              {showAccountCreation && <AccountCreation />}
              {showLogin && <Login />}
            </>
          ) : (
            <>
              <WelcomeSection />
              <CommunityFeed />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
