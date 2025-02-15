"use client";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

const useRoutine = (user) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "routines"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort tasks by creation time (or any other logic)
      setTasks(tasksData.sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => unsubscribe();
  }, [user]);

  // Updated addTask to accept both startTime and endTime
  const addTask = async (task, startTime, endTime) => {
    try {
      await addDoc(collection(db, "routines"), {
        userId: user.uid,
        task,
        isCompleted: false,
        startTime, // save start time
        endTime,   // save end time
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleComplete = async (taskId, currentStatus) => {
    try {
      const taskDocRef = doc(db, "routines", taskId);
      await updateDoc(taskDocRef, { isCompleted: !currentStatus });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "routines", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return { tasks, addTask, toggleComplete, deleteTask };
};

export default useRoutine;
