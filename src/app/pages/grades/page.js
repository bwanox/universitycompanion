"use client";

import { useEffect, useState } from "react";
import { useGrades } from "../../hooks/useGrades";
import { useAuth } from "../../auth/AuthContext"; // Ensure authentication
import axios from "axios"; // For AI API

const GradesPage = () => {
  const {
    grades,
    getGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    extractGradesFromFile,
  } = useGrades();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  // Local state to hold grades for editing
  const [editableGrades, setEditableGrades] = useState([]);
  const [answers, setAnswers] = useState({});
  const [careerRecommendation, setCareerRecommendation] = useState("");
  // Loading state to show a spinner overlay during async operations
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getGrades(user.email)
        .catch((error) => console.error("Error fetching grades:", error))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Update local editable state when grades from Firestore change
  useEffect(() => {
    setEditableGrades(grades);
  }, [grades]);

  // Handle file upload and OCR processing
  const handleFileUpload = async () => {
    if (!file) return alert("Please upload a file.");
    setLoading(true);
    try {
      // extractGradesFromFile returns an array of { course, grade }
      const extracted = await extractGradesFromFile(file, user.email);
      // Optionally, replace the current editable grades with extracted ones.
      setEditableGrades(extracted);
      alert("Grades extracted successfully!");
    } catch (error) {
      alert("Failed to extract grades.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for each row
  const handleInputChange = (index, field, value) => {
    const newGrades = [...editableGrades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setEditableGrades(newGrades);
  };

  // Delete a row both locally and (if saved) in the database
  const handleDeleteRow = async (index) => {
    const grade = editableGrades[index];
    if (grade.id) {
      try {
        setLoading(true);
        await deleteGrade(grade.id);
      } catch (error) {
        console.error("Error deleting grade:", error);
      } finally {
        setLoading(false);
      }
    }
    const newGrades = editableGrades.filter((_, i) => i !== index);
    setEditableGrades(newGrades);
  };

  // Add a new blank row
  const handleAddRow = () => {
    setEditableGrades([...editableGrades, { course: "", grade: "" }]);
  };

  // Save all changes: update existing grades and add new ones
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      for (const grade of editableGrades) {
        if (grade.id) {
          // Existing grade: update it
          try {
            await updateGrade(grade.id, {
              course: grade.course,
              grade: grade.grade,
            });
          } catch (error) {
            console.error("Error updating grade:", error);
          }
        } else {
          // New grade: add it to Firestore.
          // Note: addGrade will check if a similar course already exists.
          try {
            await addGrade(user.email, grade.course, grade.grade);
          } catch (error) {
            console.error("Error adding grade:", error);
          }
        }
      }
      // Refresh the list from Firestore
      await getGrades(user.email);
      alert("Grades saved successfully!");
    } finally {
      setLoading(false);
    }
  };

  // Parse the career recommendation text into structured data.
  // We assume each line is in the format:
  // "Career Name: 40% - A short description of the career."
  const parseCareerRecommendations = (text) => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const recommendations = [];
    const regex = /^(.+?):\s*(\d+)%\s*[-:]\s*(.+)$/;
    lines.forEach((line) => {
      const match = line.match(regex);
      if (match) {
        recommendations.push({
          career: match[1].trim(),
          percentage: Number(match[2].trim()),
          description: match[3].trim(),
        });
      }
    });
    return recommendations;
  };

  // Handle AI career analysis
  const analyzeCareer = async () => {
    setLoading(true);
    try {
      const apiKey = "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"; // Replace with your actual API key
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a career advisor analyzing student grades and personality traits to recommend suitable careers.",
            },
            {
              role: "user",
              content: `Here are my grades and personality traits:
              Grades: ${editableGrades
                .map((g) => `${g.course}: ${g.grade}`)
                .join(", ")}
              Personality Answers: ${JSON.stringify(answers)}
              Based on this, what are the best career choices for me? Please respond with percentages and a short description for each career.`,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCareerRecommendation(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error analyzing career:", error);
      setCareerRecommendation("Could not get recommendation.");
    } finally {
      setLoading(false);
    }
  };

  // Parse the recommendation text if possible.
  const parsedRecommendations = parseCareerRecommendations(careerRecommendation);

  return (
    <div className="min-h-screen p-6 bg-white text-blue-900 relative">
      <h1 className="text-3xl font-bold mb-4">Your Grades</h1>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      )}

      {/* Upload & Extract Grades */}
      <div className="bg-blue-100 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">Upload Grades Transcript</h2>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          onClick={handleFileUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Extract Grades
        </button>
      </div>

      {/* Display & Edit Saved Grades */}
      <div className="bg-blue-100 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Saved Grades</h2>
        {editableGrades.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Grade</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editableGrades.map((grade, index) => (
                <tr key={index} className="border-b border-blue-300">
                  <td className="p-3">
                    <input
                      type="text"
                      value={grade.course}
                      onChange={(e) =>
                        handleInputChange(index, "course", e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.1"
                      value={grade.grade}
                      onChange={(e) =>
                        handleInputChange(index, "grade", e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteRow(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No grades available.</p>
        )}
        <div className="mt-4">
          <button
            onClick={handleAddRow}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
          >
            Add Grade
          </button>
          <button
            onClick={handleSaveChanges}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Personality Questionnaire */}
      <div className="bg-blue-100 p-4 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Personality Questionnaire</h2>
        <p>Answer these questions to receive career recommendations:</p>
        {[
          "Do you enjoy problem-solving?",
          "Do you like working in teams?",
          "Are you interested in coding?",
          "Do you prefer hands-on work?",
        ].map((question, index) => (
          <div key={index} className="my-2">
            <label className="block">{question}</label>
            <select
              onChange={(e) =>
                setAnswers({ ...answers, [question]: e.target.value })
              }
              className="p-2 border rounded"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        ))}
        {/* Additional open question for career choices */}
        <div className="my-2">
          <label className="block">Which careers are you considering?</label>
          <input
            type="text"
            onChange={(e) =>
              setAnswers({
                ...answers,
                "Which careers are you considering?": e.target.value,
              })
            }
            className="w-full p-2 border rounded"
            placeholder="E.g., Data Scientist, Software Engineer..."
          />
        </div>
        <button
          onClick={analyzeCareer}
          className="bg-green-500 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-600"
        >
          Get Career Recommendation
        </button>
      </div>

      {/* Career Recommendation Result */}
      {careerRecommendation && (
        <div className="bg-green-100 p-4 rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-semibold mb-4">Career Suggestions</h2>
          {parsedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {parsedRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{rec.career}</h3>
                    <span className="font-medium">{rec.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${rec.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>{careerRecommendation}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GradesPage;
