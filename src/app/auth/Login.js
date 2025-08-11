"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../auth/firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import NeonLoader from "../components/NeonLoader"; // Import the NeonLoader component

const Login = ({ onClose, onSuccess }) => { // Accept onClose and onSuccess props
  const router = useRouter();
  const { user } = useAuth();

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");

  // Loading state for login verification
  const [isLoading, setIsLoading] = useState(false);

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
      alert("Login successful!");
      
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
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg relative">
      {/* Close button - positioned at top right */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Close"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {!isForgotPassword ? (
        <>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Login</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <NeonLoader />
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="identifier" className="block text-gray-700">
                  Email, Username or Phone Number
                </label>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
                />
              </div>
              <button
                type="submit"
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login
              </button>
            </form>
          )}
          <div className="mt-4 text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPassword(true);
                setError("");
                setMessage("");
              }}
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Reset Password</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label htmlFor="resetEmail" className="block text-gray-700">
                Enter your Email
              </label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send Reset Link
            </button>
          </form>
          <div className="mt-4 text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPassword(false);
                setMessage("");
              }}
              className="text-blue-600 hover:underline"
            >
              Back to Login
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
