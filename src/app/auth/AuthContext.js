"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../auth/firebaseConfig"; // Firebase auth and Firestore instance
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Create AuthContext
const AuthContext = createContext();

// Provide AuthContext to the whole app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the logged-in user

  useEffect(() => {
    // Firebase listener to track auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch additional user information from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ uid: currentUser.uid, ...currentUser, ...userData }); // Update state with additional user data and uid
        } else {
          setUser({ uid: currentUser.uid, ...currentUser }); // If no additional data, just set the current user with uid
        }
      } else {
        setUser(null); // No user is logged in
      }
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