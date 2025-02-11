import { useState } from "react";
import { db } from "../auth/firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";

export const useAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  // Fetch all assignments for a user
  const getAssignments = async (userId) => {
    try {
      if (!userId) throw new Error("User ID is required to fetch assignments.");

      const assignmentsRef = collection(db, "assignments");
      const q = query(assignmentsRef, where("userId", "==", userId)); // ✅ Fetch only user's assignments
      const snapshot = await getDocs(q);
      const assignmentsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      setAssignments(assignmentsList);
      return assignmentsList;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  };

  // Add a new assignment
  const addAssignment = async (assignment, userId) => {
    try {
      if (!userId) throw new Error("User ID is required to save an assignment.");

      const newAssignment = { ...assignment, userId }; // ✅ Attach userId
      const docRef = await addDoc(collection(db, "assignments"), newAssignment);
      
      setAssignments((prev) => [...prev, { id: docRef.id, ...newAssignment }]);
      return { id: docRef.id, ...newAssignment };
    } catch (error) {
      console.error("Error adding assignment:", error);
      throw error;
    }
  };

  // Update an existing assignment
  const updateAssignment = async (id, updatedData) => {
    try {
      const assignmentRef = doc(db, "assignments", id);
      await updateDoc(assignmentRef, updatedData);
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === id ? { ...assignment, ...updatedData } : assignment
        )
      );
    } catch (error) {
      console.error("Error updating assignment:", error);
      throw error;
    }
  };

  // Delete an assignment
  const deleteAssignment = async (id) => {
    try {
      const assignmentRef = doc(db, "assignments", id);
      await deleteDoc(assignmentRef);
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
    } catch (error) {
      console.error("Error deleting assignment:", error);
      throw error;
    }
  };

  return {
    assignments,
    getAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  };
};
