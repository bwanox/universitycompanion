"use client";

import { useState } from "react";
import { db } from "../auth/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Tesseract from "tesseract.js"; // OCR library
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export const useGrades = () => {
  const [grades, setGrades] = useState([]);

  // ----------------------------------------------------------------------------
  // Helper: Remove the last occurrence of a substring from a string.
  // ----------------------------------------------------------------------------
  const removeLastOccurrence = (str, substr) => {
    const lastIndex = str.lastIndexOf(substr);
    if (lastIndex === -1) return str;
    return str.substring(0, lastIndex) + str.substring(lastIndex + substr.length);
  };

  // ----------------------------------------------------------------------------
  // Helper: Parse OCR text to extract course names and marks.
  // For each line in the OCR text:
  // 1. Find all numbers (either integer or float) using a regex.
  // 2. Filter to keep only numbers below 20.
  // 3. Choose the last valid number as the grade.
  // 4. Remove that occurrence from the line and treat what remains as the course name.
  // The returned object uses keys `course` and `grade` (to match Firestore usage).
  // ----------------------------------------------------------------------------
  const parseGrades = (text) => {
    const lines = text.split("\n");
    const result = [];
    lines.forEach((line) => {
      // Match numbers with an optional decimal (e.g. "17" or "17.4")
      const matches = [...line.matchAll(/(\d{1,2}(?:\.\d+)?)/g)];
      if (matches.length > 0) {
        // Filter: keep only numbers below 20
        const validMatches = matches.filter((m) => parseFloat(m[1]) < 20);
        if (validMatches.length > 0) {
          // Use the last valid number as the grade
          const lastMatch = validMatches[validMatches.length - 1];
          const gradeValue = parseFloat(lastMatch[1]);
          // Remove that occurrence from the line to isolate the course name
          const courseName = removeLastOccurrence(line, lastMatch[0]).trim();
          if (courseName) {
            result.push({ course: courseName, grade: gradeValue });
          }
        }
      }
    });
    return result;
  };

  // ----------------------------------------------------------------------------
  // Firestore Functions
  // ----------------------------------------------------------------------------

  // Fetch grades for the logged-in user from Firestore
  const getGrades = async (userId) => {
    try {
      const gradesRef = collection(db, "grades");
      const q = query(gradesRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const gradesList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setGrades(gradesList);
      return gradesList;
    } catch (error) {
      console.error("Error fetching grades:", error);
      return [];
    }
  };

  // Add a new grade to Firestore.
  // If a course with a similar (case-insensitive) name already exists for the user,
  // update that grade instead and notify the user.
  const addGrade = async (userId, course, grade) => {
    try {
      const normalizedCourse = course.toLowerCase().trim();
      const gradesRef = collection(db, "grades");
      const q = query(gradesRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      let existingGradeDoc = null;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.course && data.course.toLowerCase().trim() === normalizedCourse) {
          existingGradeDoc = { id: docSnap.id, ...data };
        }
      });

      if (existingGradeDoc) {
        // Course exists—update its grade.
        await updateDoc(doc(db, "grades", existingGradeDoc.id), { grade });
        setGrades((prev) =>
          prev.map((g) =>
            g.id === existingGradeDoc.id ? { ...g, grade } : g
          )
        );
        alert(`Course "${course}" already exists. Grade updated instead.`);
      } else {
        // Course does not exist—add as new.
        const newGrade = { userId, course, grade };
        const docRef = await addDoc(collection(db, "grades"), newGrade);
        newGrade.id = docRef.id;
        setGrades((prev) => [...prev, newGrade]);
      }
    } catch (error) {
      console.error("Error adding grade:", error);
      throw error;
    }
  };

  // Update an existing grade in Firestore
  const updateGrade = async (gradeId, updatedData) => {
    try {
      const gradeRef = doc(db, "grades", gradeId);
      await updateDoc(gradeRef, updatedData);
      setGrades((prev) =>
        prev.map((g) => (g.id === gradeId ? { ...g, ...updatedData } : g))
      );
    } catch (error) {
      console.error("Error updating grade:", error);
      throw error;
    }
  };

  // Delete a grade from Firestore
  const deleteGrade = async (gradeId) => {
    try {
      await deleteDoc(doc(db, "grades", gradeId));
      setGrades((prev) => prev.filter((g) => g.id !== gradeId));
    } catch (error) {
      console.error("Error deleting grade:", error);
      throw error;
    }
  };

  // ----------------------------------------------------------------------------
  // OCR Extraction Function
  // This function performs OCR on the provided file (scanned PDF or image),
  // then parses the OCR text to extract course names with marks below 20.
  // ----------------------------------------------------------------------------
  const extractGradesFromFile = async (file, userId) => {
    try {
      console.log("File received for extraction:", file);

      if (file.type === "application/pdf") {
        console.log("Processing scanned PDF file...");
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        return new Promise((resolve, reject) => {
          reader.onload = async function () {
            try {
              const pdfData = new Uint8Array(reader.result);
              const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
              let extractedText = "";

              // Process each page of the PDF
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 }); // Increase scale for better OCR quality
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext("2d");

                await page.render({ canvasContext: context, viewport }).promise;

                const imageUrl = canvas.toDataURL("image/png");
                const { data } = await Tesseract.recognize(imageUrl, "eng", {});
                extractedText += data.text + "\n";
              }

              console.log("Extracted text via OCR:", extractedText);
              const parsedGrades = parseGrades(extractedText);
              console.log("Parsed grades:", parsedGrades);
              resolve(parsedGrades);
            } catch (error) {
              console.error("Error processing scanned PDF:", error);
              reject(error);
            }
          };

          reader.onerror = (error) => {
            console.error("Error reading PDF file:", error);
            reject(error);
          };
        });
      } else {
        // Process non-PDF files (e.g., image files)
        console.log("Processing image file...");
        const imageUrl = URL.createObjectURL(file);
        const { data } = await Tesseract.recognize(imageUrl, "eng");
        console.log("Extracted text from image:", data.text);
        const parsedGrades = parseGrades(data.text);
        console.log("Parsed grades:", parsedGrades);
        return parsedGrades;
      }
    } catch (error) {
      console.error("Error extracting grades:", error);
      throw error;
    }
  };

  return {
    grades,
    getGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    extractGradesFromFile,
  };
};
