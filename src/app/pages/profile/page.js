"use client";

import { useUser } from "../../hooks/useUser";
import AccountCreation from "../../auth/AccountCreation";
import Login from "../../auth/Login";
import { useState, useEffect } from "react";
import { db, auth } from "../../auth/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const ProfilePage = () => {
  const { user, loading } = useUser();
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Toggle for editing profile info (username, phone, bio)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Toggle for changing password
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Local state for profile info (username, phone, bio)
  const [profileData, setProfileData] = useState({
    username: "",
    phone: "",
    bio: "",
  });

  // State for password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Initialize profileData from user Firestore document (if available)
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // Toggle login/account creation UIs
  const handleLoginClick = () => {
    setShowLogin(true);
    setShowAccountCreation(false);
  };
  const handleAccountCreationClick = () => {
    setShowAccountCreation(true);
    setShowLogin(false);
  };

  // Handle changes in the profile info form
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated profile info (username, phone, bio) to Firestore
  const handleProfileSave = async () => {
    console.log("Saving profile...",user);
    if (!user || !user.uid) {
      console.error("User or user ID is undefined.");
      alert("Unable to save profile. Please log in again.");
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        username: profileData.username,
        phone: profileData.phone || null,
        bio: profileData.bio || null,
      });
      alert("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile. Please try again.");
    }
  };
  

  // Handle changes in the password change form
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate new password conditions
  const validateNewPassword = (password) => {
    const isMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return isMinLength && hasUppercase && hasNumber;
  };

  // Submit password change form
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (!validateNewPassword(newPassword)) {
      setPasswordError(
        "New password must be at least 6 characters and include an uppercase letter and a number."
      );
      return;
    }

    try {
      // Reauthenticate the user with their current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      // Update the password
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError("Error updating password: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-950 via-emerald-900 to-cyan-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-float delay-700"></div>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-teal-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-teal-950 via-emerald-900 to-cyan-950 flex flex-col items-center relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-float delay-500"></div>
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float delay-1000"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-teal-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <h1 className="text-5xl font-black bg-gradient-to-r from-teal-300 via-emerald-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl mb-12 relative z-10 animate-shimmer">
        Your Profile
      </h1>
      {user ? (
        <div className="w-full max-w-2xl relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
            {/* Display user details */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                  <span className="text-4xl">👤</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent">
                    {profileData.username || user.email}
                  </h2>
                  <p className="text-teal-300 font-medium text-lg">Email: {user.email}</p>
                </div>
              </div>
              <div className="space-y-3 pl-24">
                {profileData.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <p className="text-white font-medium">Phone: {profileData.phone}</p>
                  </div>
                )}
                {profileData.bio && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📝</span>
                    <p className="text-white/90 leading-relaxed">Bio: {profileData.bio}</p>
                  </div>
                )}
              </div>
            </div>

          {/* Toggle for editing profile info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white rounded-2xl shadow-xl font-bold hover:scale-105 transform transition-all duration-300"
            >
              {isEditingProfile ? "❌ Cancel Edit" : "✏️ Edit Profile"}
            </button>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-2xl shadow-xl font-bold hover:scale-105 transform transition-all duration-300"
            >
              {isChangingPassword ? "❌ Cancel Password Change" : "🔒 Change Password"}
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditingProfile && (
            <div className="mt-6 border-t border-white/20 pt-6 space-y-5">
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <label className="block text-white font-bold mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
                />
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <label className="block text-white font-bold mb-2">Phone (optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
                />
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <label className="block text-white font-bold mb-2">Bio (optional)</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium min-h-[100px]"
                ></textarea>
              </div>
              <button
                onClick={handleProfileSave}
                className="px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600 text-white rounded-2xl shadow-xl font-black hover:scale-105 transform transition-all duration-300"
              >
                💾 Save Profile
              </button>
            </div>
          )}

          {/* Password Change Form */}
          {isChangingPassword && (
            <form
              onSubmit={handlePasswordChangeSubmit}
              className="mt-6 border-t border-white/20 pt-6 space-y-5"
            >
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <label className="block text-white font-bold mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
                />
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <label className="block text-white font-bold mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
                />
                <div className="mt-3 space-y-1 text-sm">
                  <p
                    className={
                      passwordForm.newPassword.length >= 6
                        ? "text-lime-400 font-medium"
                        : "text-red-400 font-medium"
                    }
                  >
                    • At least 6 characters.
                  </p>
                  <p
                    className={
                      /[A-Z]/.test(passwordForm.newPassword)
                        ? "text-lime-400 font-medium"
                        : "text-red-400 font-medium"
                    }
                  >
                    • Contains an uppercase letter.
                  </p>
                  <p
                    className={
                      /\d/.test(passwordForm.newPassword)
                        ? "text-lime-400 font-medium"
                        : "text-red-400 font-medium"
                    }
                  >
                    • Contains a number.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <label className="block text-white font-bold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
                />
              </div>
              {passwordError && <p className="text-red-400 font-bold bg-red-500/10 p-3 rounded-xl">{passwordError}</p>}
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600 text-white rounded-2xl shadow-xl font-black hover:scale-105 transform transition-all duration-300"
              >
                🔐 Update Password
              </button>
            </form>
          )}
        </div>
        </div>
        </div>
      ) : (
        <div className="w-full max-w-lg relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl items-center justify-center mb-4 animate-pulse">
                  <span className="text-5xl">🔐</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">
                  You are not logged in
                </h2>
                <p className="text-teal-200">Please log in or create an account to continue</p>
              </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleLoginClick}
              className="px-8 py-4 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-2xl shadow-xl font-black hover:scale-105 transform transition-all duration-300"
            >
              🔑 Log in
            </button>
            <button
              onClick={handleAccountCreationClick}
              className="px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600 text-white rounded-2xl shadow-xl font-black hover:scale-105 transform transition-all duration-300"
            >
              ✨ Create Account
            </button>
          </div>
          <div className="mt-6">
            {showAccountCreation && <AccountCreation />}
            {showLogin && <Login />}
          </div>
        </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
