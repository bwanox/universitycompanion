// pages/profile.js
"use client";

import { useUser } from "../../hooks/useUser";
import AccountCreation from "../../auth/AccountCreation";
import Login from "../../auth/Login";
import { useState } from "react";

const ProfilePage = () => {
  const { user, loading } = useUser();
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-white text-blue-900">
      <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
      {user ? (
        <div className="bg-blue-100 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold">Welcome, {user.name}!</h2>
          <p>Email: {user.email}</p>
          <p>Bio: {user.bio || "No bio available"}</p>
          {/* Display additional user data if available */}
        </div>
      ) : (
        <div className="bg-blue-100 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">You are not logged in</h2>
          <div className="space-x-4">
            <button
              onClick={handleLoginClick}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Log in
            </button>
            <button
              onClick={handleAccountCreationClick}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Account
            </button>
          </div>
          {showAccountCreation && <AccountCreation />}
          {showLogin && <Login />}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
