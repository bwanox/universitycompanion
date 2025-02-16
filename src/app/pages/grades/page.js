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
      const apiKey = "sk-proj-REPLACE_WITH_YOUR_API_KEY"; // Replace with your actual API key
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-black relative">
      {/* Neon Header */}
      <header className="mb-10 text-center bg-transparent">
        <h1 className="text-5xl font-extrabold text-cyan-400 drop-shadow-2xl">
          Your Grades
        </h1>
      </header>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      )}

      {/* Upload & Extract Grades */}
      <section className="mb-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-2 text-cyan-300">
            Upload Grades Transcript
          </h2>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 p-2 bg-gray-800 text-white border border-gray-700 rounded"
          />
          <button
            onClick={handleFileUpload}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-2xl hover:from-green-500 hover:to-blue-600 transition-colors"
          >
            Extract Grades
          </button>
        </div>
      </section>

      {/* Display & Edit Saved Grades */}
      <section className="mb-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-300">
            Saved Grades
          </h2>
          {editableGrades.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cyan-500 text-white">
                  <th className="p-3 text-left">Course</th>
                  <th className="p-3 text-left">Grade</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editableGrades.map((grade, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-3">
                      <input
                        type="text"
                        value={grade.course}
                        onChange={(e) =>
                          handleInputChange(index, "course", e.target.value)
                        }
                        className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
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
                        className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteRow(index)}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full shadow-md hover:from-red-600 hover:to-pink-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-white">No grades available.</p>
          )}
          <div className="mt-4">
            <button
              onClick={handleAddRow}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-colors mr-4"
            >
              Add Grade
            </button>
            <button
              onClick={handleSaveChanges}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-2xl hover:from-green-500 hover:to-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </section>

      {/* Expanded Personality Questionnaire */}
<section className="mb-6">
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
    <h2 className="text-2xl font-semibold mb-4 text-cyan-300">
      Personality Questionnaire
    </h2>
    <p className="text-white mb-4">
      Answer the following questions to help us understand your personality and preferences for a tailored career recommendation:
    </p>
    <div className="space-y-4">
      {/* 1. Problem-solving skills */}
      <div className="my-2">
        <label className="block text-white">
          How do you rate your problem-solving skills?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, problemSolving: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Average">Average</option>
          <option value="Below Average">Below Average</option>
        </select>
      </div>
      {/* 2. Work preference */}
      <div className="my-2">
        <label className="block text-white">
          How do you prefer to work?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, workPreference: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Independently">Independently</option>
          <option value="In a team">In a team</option>
          <option value="Mix of both">Mix of both</option>
        </select>
      </div>
      {/* 3. Work environment */}
      <div className="my-2">
        <label className="block text-white">
          What work environment suits you best?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, workEnvironment: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Structured and predictable">Structured and predictable</option>
          <option value="Fast-paced and dynamic">Fast-paced and dynamic</option>
          <option value="Flexible and creative">Flexible and creative</option>
        </select>
      </div>
      {/* 4. Work-life balance */}
      <div className="my-2">
        <label className="block text-white">
          How important is work-life balance to you?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, workLifeBalance: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Very important">Very important</option>
          <option value="Somewhat important">Somewhat important</option>
          <option value="Not important">Not important</option>
        </select>
      </div>
      {/* 5. Stress management */}
      <div className="my-2">
        <label className="block text-white">
          How do you handle stress?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, stressManagement: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="I thrive under pressure">I thrive under pressure</option>
          <option value="I manage it well">I manage it well</option>
          <option value="I struggle sometimes">I struggle sometimes</option>
        </select>
      </div>
      {/* 6. Learning new technologies */}
      <div className="my-2">
        <label className="block text-white">
          Do you enjoy learning new technologies?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, learningNewTech: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      {/* 7. Communication skills */}
      <div className="my-2">
        <label className="block text-white">
          How would you describe your communication skills?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, communication: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Average">Average</option>
          <option value="Below Average">Below Average</option>
        </select>
      </div>
      {/* 8. Creativity */}
      <div className="my-2">
        <label className="block text-white">
          How creative do you consider yourself?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, creativity: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Highly creative">Highly creative</option>
          <option value="Somewhat creative">Somewhat creative</option>
          <option value="Not very creative">Not very creative</option>
        </select>
      </div>
      {/* 9. Adaptability */}
      <div className="my-2">
        <label className="block text-white">
          How adaptable are you to change?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, adaptability: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Highly adaptable">Highly adaptable</option>
          <option value="Moderately adaptable">Moderately adaptable</option>
          <option value="Not very adaptable">Not very adaptable</option>
        </select>
      </div>
      {/* 10. Handling criticism */}
      <div className="my-2">
        <label className="block text-white">
          How do you handle constructive criticism?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, criticismHandling: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="I welcome it to improve">I welcome it to improve</option>
          <option value="I consider it carefully">I consider it carefully</option>
          <option value="I find it challenging">I find it challenging</option>
        </select>
      </div>
      {/* 11. Planning style */}
      <div className="my-2">
        <label className="block text-white">
          Do you prefer detailed planning or improvisation?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, planningStyle: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Detailed planning">Detailed planning</option>
          <option value="Improvisation">Improvisation</option>
          <option value="A mix of both">A mix of both</option>
        </select>
      </div>
      {/* 12. Motivation by recognition */}
      <div className="my-2">
        <label className="block text-white">
          How motivated are you by recognition and rewards?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, motivation: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Highly motivated">Highly motivated</option>
          <option value="Somewhat motivated">Somewhat motivated</option>
          <option value="Not motivated">Not motivated</option>
        </select>
      </div>
      {/* 13. Importance of social interaction */}
      <div className="my-2">
        <label className="block text-white">
          How important is social interaction in your work?
        </label>
        <select
          onChange={(e) =>
            setAnswers({ ...answers, socialInteraction: e.target.value })
          }
          className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Very important">Very important</option>
          <option value="Somewhat important">Somewhat important</option>
          <option value="Not important">Not important</option>
        </select>
      </div>
    </div>
    <button
      onClick={analyzeCareer}
      className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-2xl hover:from-green-500 hover:to-blue-600 transition-colors mt-4"
    >
      Get Career Recommendation
    </button>
  </div>
</section>

{/* Career Recommendation Result */}
{careerRecommendation && (
  <section className="mt-6">
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-300">
        Career Suggestions
      </h2>
      {parsedRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parsedRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-cyan-400">
                  {rec.career}
                </h3>
                <span className="font-medium text-white">
                  {rec.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${rec.percentage}%` }}
                ></div>
              </div>
              <p className="text-gray-200">{rec.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white">{careerRecommendation}</p>
      )}
    </div>
  </section>
)}

    </div>
  );
};

export default GradesPage;
