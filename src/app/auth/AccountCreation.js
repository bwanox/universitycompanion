"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import { auth, db } from "../auth/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

const AccountCreation = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Basic validations
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPhone = (phone) => /^\d{7,}$/.test(phone);

  // Real-time password conditions
  const isPasswordMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = isPasswordMinLength && hasUppercase && hasNumber;

  // Real-time username condition
  const isUsernameValid = username.trim().length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!isValidEmail(email)) {
      setError("Please provide a valid email.");
      return;
    }
    // Validate password with enhanced rules
    if (!isPasswordValid) {
      setError("Password must be at least 6 characters and include an uppercase letter and a number.");
      return;
    }
    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Validate username
    if (!isUsernameValid) {
      setError("Username is required and must be at least 3 characters.");
      return;
    }
    // Validate phone (if provided)
    if (phone && !isValidPhone(phone)) {
      setError("Please provide a valid phone number (only digits, at least 7 digits).");
      return;
    }

    try {
      const usersRef = collection(db, "users");

      // Check if username is already used
      const usernameQuery = query(usersRef, where("username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        setError("Username is already taken.");
        return;
      }

      // Check if email is already registered
      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        setError("Email is already registered.");
        return;
      }

      if (!auth) throw new Error("Firebase Auth is not initialized");

      // Create a new user with email & password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username,
        phone: phone || null, // store null if phone not provided
        createdAt: new Date(),
      });

      // Log the user in directly
      await signInWithEmailAndPassword(auth, email, password);

      // Clear fields and redirect
      setEmail("");
      setUsername("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      alert("Account created successfully!");
      router.push("/");
    } catch (err) {
      console.error("Account creation error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">Create an Account</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
          />
        </div>

        {/* Username Field */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
          />
          <div className="mt-1">
            <p className={`${isUsernameValid ? "text-green-500" : "text-red-500"} text-sm`}>
              Username must be at least 3 characters.
            </p>
          </div>
        </div>

        {/* Phone Field (Optional) */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-700">Phone Number (Optional)</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
          />
          <div className="mt-1 space-y-1 text-sm">
            <p className={isPasswordMinLength ? "text-green-500" : "text-red-500"}>
              • At least 6 characters.
            </p>
            <p className={hasUppercase ? "text-green-500" : "text-red-500"}>
              • Contains an uppercase letter.
            </p>
            <p className={hasNumber ? "text-green-500" : "text-red-500"}>
              • Contains a number.
            </p>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500">Passwords do not match.</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="text-sm text-green-500">Passwords match.</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 "
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default AccountCreation;