"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../auth/firebaseConfig"; // Firebase auth instance
import { onAuthStateChanged, signOut } from "firebase/auth";

// Create AuthContext
const AuthContext = createContext();

// Provide AuthContext to the whole app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the logged-in user

  useEffect(() => {
    // Firebase listener to track auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update state when user logs in/out
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  // Logout function
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth state
export const useAuth = () => useContext(AuthContext);
