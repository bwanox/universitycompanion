import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

export const useUserById = (uid) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [uid]);

  return { user: userData, loading };
};
