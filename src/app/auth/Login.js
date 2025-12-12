"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../auth/firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import NeonLoader from "../components/NeonLoader"; // Import the NeonLoader component

const Login = ({ onClose, onSuccess, onShowSuccess }) => { // Accept onClose, onSuccess, and onShowSuccess props
  const router = useRouter();
  const { user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");

  // Loading state for login verification
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Close modal handler
  const handleClose = () => {
    if (onClose) {
      onClose(); // Use the onClose prop from parent
    } else {
      // Fallback if no onClose prop
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }
  };

  // Detect type of identifier (email, phone, or username)
  const detectIdentifierType = (value) => {
    if (value.includes("@")) {
      return "email";
    } else if (/^\+?\d+$/.test(value)) {
      return "phone";
    } else {
      return "username";
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading
    let emailToLogin = identifier;
    try {
      const type = detectIdentifierType(identifier);
      if (type !== "email") {
        // Query Firestore to find the associated email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where(type, "==", identifier));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          throw new Error(`No user found with that ${type}.`);
        }
        const userDoc = querySnapshot.docs[0].data();
        emailToLogin = userDoc.email;
      }
      // Sign in with the retrieved email and password
      await signInWithEmailAndPassword(auth, emailToLogin, password);
      setIdentifier("");
      setPassword("");
      
      // Show success notification
      if (onShowSuccess) {
        onShowSuccess("Login successful! Welcome back.");
      }
      
      // Call onSuccess if provided, otherwise fallback to redirect
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user && onClose) {
      console.log("User is logged in, closing modal...");
      onClose();
    } else if (user) {
      console.log("User is logged in, redirecting to homepage...");
      window.location.href = "/";
    }
  }, [user, onClose]);

  return (
    <div className="relative">
      {/* Close button - positioned at top right */}
      <button
        onClick={handleClose}
        className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {!isForgotPassword ? (
        <>
          {/* Header with gradient */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <NeonLoader />
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label htmlFor="identifier" className="block text-sm font-bold text-gray-700 mb-2">
                  Email, Username or Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-gray-800 transition-all duration-300"
                    placeholder="Enter your email, username or phone"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-gray-800 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // Eye-off icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.657 0 3.216.41 4.563 1.125M19.07 19.07l-14.14-14.14M9.88 9.88a3 3 0 104.24 4.24" />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c0 3-4 7-10 7S2 15 2 12s4-7 10-7 10 4 10 7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPassword(true);
                setError("");
                setMessage("");
              }}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </>
      ) : (
        <>
          {/* Reset Password Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">Reset Password</h2>
            <p className="text-gray-600">We'll send you a reset link</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-700 text-sm font-semibold">{message}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-800 transition-all duration-300"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPassword(false);
                setMessage("");
              }}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
            >
              ← Back to Login
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
