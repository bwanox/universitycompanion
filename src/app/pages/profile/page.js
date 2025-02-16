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
    if (user) {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-black flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400 drop-shadow-2xl">
        Your Profile
      </h1>
      {user ? (
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl">
          {/* Display user details */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-cyan-300">
              {profileData.username || user.email}
            </h2>
            <p className="text-white">Email: {user.email}</p>
            {profileData.phone && <p className="text-white">Phone: {profileData.phone}</p>}
            {profileData.bio && <p className="text-white">Bio: {profileData.bio}</p>}
          </div>

          {/* Toggle for editing profile info */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full shadow-xl"
            >
              {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
            </button>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full shadow-xl"
            >
              {isChangingPassword ? "Cancel Password Change" : "Change Password"}
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditingProfile && (
            <div className="mt-6 border-t border-white/20 pt-6 space-y-4">
              <div>
                <label className="block text-white mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Phone (optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Bio (optional)</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                ></textarea>
              </div>
              <button
                onClick={handleProfileSave}
                className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-full shadow-xl"
              >
                Save Profile
              </button>
            </div>
          )}

          {/* Password Change Form */}
          {isChangingPassword && (
            <form
              onSubmit={handlePasswordChangeSubmit}
              className="mt-6 border-t border-white/20 pt-6 space-y-4"
            >
              <div>
                <label className="block text-white mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-white mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <div className="mt-1 text-sm">
                  <p
                    className={
                      passwordForm.newPassword.length >= 6
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    • At least 6 characters.
                  </p>
                  <p
                    className={
                      /[A-Z]/.test(passwordForm.newPassword)
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    • Contains an uppercase letter.
                  </p>
                  <p
                    className={
                      /\d/.test(passwordForm.newPassword)
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    • Contains a number.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-white mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordFormChange}
                  required
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              {passwordError && <p className="text-red-500">{passwordError}</p>}
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-full shadow-xl"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-300">
            You are not logged in
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-full shadow-xl"
            >
              Log in
            </button>
            <button
              onClick={handleAccountCreationClick}
              className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-full shadow-xl"
            >
              Create Account
            </button>
          </div>
          <div className="mt-6">
            {showAccountCreation && <AccountCreation />}
            {showLogin && <Login />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
