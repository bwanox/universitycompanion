import { useState, useEffect } from "react";
import { auth, db } from "../auth/firebaseConfig"; // Adjust the path if needed
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      if (userAuth) {
        // Fetch user data from Firestore
        const fetchUserData = async () => {
          try {
            const userRef = doc(db, "users", userAuth.uid); // Assuming users are stored in a collection "users"
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              setUser(userDoc.data());
            } else {
              setUser(null);
            }
            setLoading(false);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setLoading(false);
          }
        };
        fetchUserData();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
};
