import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext"; // Import useAuth from AuthContext

export const useUser = () => {
  const { user: authUser } = useAuth(); // Get the user from AuthContext
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      // Fetch user data from AuthContext
      const fetchUserData = async () => {
        try {
          setUser(authUser); // Set the user from AuthContext
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
  }, [authUser]);

  return { user, loading };
};