"use client"; 
import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import { auth, db } from "../auth/firebaseConfig"; // ✅ Import Firebase instance
import { createUserWithEmailAndPassword } from "firebase/auth"; // ✅ Import auth functions directly
import { doc, setDoc } from "firebase/firestore"; // ✅ Import Firestore functions

const AccountCreation = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("🔥 Creating user:", email);

      if (!auth) throw new Error("Firebase Auth is not initialized");

      // ✅ Create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ User created:", user);

      // ✅ Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
      });

      setEmail("");
      setPassword("");
      setError("");
      alert("Account created successfully!");

      router.push("/"); // Redirect to homepage
    } catch (err) {
      console.error("🔥 Firebase Auth Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">Create an Account</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default AccountCreation;
