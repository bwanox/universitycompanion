"use client"
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
                "You are a career advisor analyzing student grades and personality traits to recommend suitable careers. Please provide a well-written and aesthetic answer with clear percentages and descriptions for each recommended career.",
            },
            {
              role: "user",
              content: `Here are my grades and personality traits:
Grades: ${editableGrades
                .map((g) => `${g.course}: ${g.grade}`)
                .join(", ")}
Personality Answers: ${JSON.stringify(answers)}
Based on this information, please provide the best career choices for me along with percentages and a short description for each career.`,
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
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-emerald-950 via-teal-900 to-lime-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-float delay-700"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-lime-500/20 rounded-full blur-3xl animate-float delay-1000"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

    
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Extract Grades */}
      <section className="mb-6 lg:mb-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 rounded-2xl lg:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg lg:rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                <span className="text-xl lg:text-2xl">📄</span>
              </div>
              <h2 className="text-xl lg:text-3xl font-black text-white truncate">Upload Grades Transcript</h2>
            </div>
            <div className="flex flex-col gap-3 lg:gap-4">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="flex-1 p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-xl lg:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 shadow-lg shadow-emerald-500/10 text-sm lg:text-base file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-4 lg:file:px-6 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-emerald-400 file:to-teal-500 file:text-white file:font-bold file:cursor-pointer file:shadow-lg hover:file:from-emerald-500 hover:file:to-teal-600 hover:file:scale-105 file:transition-all file:duration-300 file:text-sm lg:file:text-base"
              />
              <button
                onClick={handleFileUpload}
                className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-xl lg:rounded-2xl shadow-xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 font-bold hover:scale-105 transform hover:shadow-lime-500/50 text-sm lg:text-base"
              >
                🔍 Extract Grades
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Display & Edit Saved Grades */}
      <section className="mb-6 lg:mb-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 rounded-2xl lg:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg lg:rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                <span className="text-xl lg:text-2xl">📊</span>
              </div>
              <h2 className="text-xl lg:text-3xl font-black text-white truncate">Saved Grades</h2>
            </div>
            {editableGrades.length > 0 ? (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-500">
                      <th className="p-2 lg:p-4 text-left text-white font-black text-sm lg:text-base rounded-tl-xl lg:rounded-tl-2xl">Course</th>
                      <th className="p-2 lg:p-4 text-left text-white font-black text-sm lg:text-base">Grade</th>
                      <th className="p-2 lg:p-4 text-left text-white font-black text-sm lg:text-base rounded-tr-xl lg:rounded-tr-2xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableGrades.map((grade, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-2 lg:p-4">
                          <input
                            type="text"
                            value={grade.course}
                            onChange={(e) =>
                              handleInputChange(index, "course", e.target.value)
                            }
                            className="w-full p-2 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-teal-400/30 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 font-semibold placeholder-gray-500 text-sm lg:text-base"
                            placeholder="Enter course name"
                          />
                        </td>
                        <td className="p-2 lg:p-4">
                          <input
                            type="number"
                            step="0.1"
                            value={grade.grade}
                            onChange={(e) =>
                              handleInputChange(index, "grade", e.target.value)
                            }
                            className="w-full p-2 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-emerald-400/30 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 font-bold text-base lg:text-lg placeholder-gray-500"
                            placeholder="0.0"
                          />
                        </td>
                        <td className="p-2 lg:p-4">
                          <button
                            onClick={() => handleDeleteRow(index)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl shadow-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold hover:scale-105 transform text-xs lg:text-base whitespace-nowrap"
                          >
                            <span className="hidden sm:inline">🗑️ Delete</span>
                            <span className="sm:hidden">🗑️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 lg:py-12">
                <div className="text-4xl lg:text-5xl mb-2 lg:mb-3 animate-bounce-slow">📈</div>
                <p className="text-emerald-200 text-base lg:text-lg font-bold">No grades available yet</p>
              </div>
            )}
            <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row flex-wrap gap-3 lg:gap-4">
              <button
                onClick={handleAddRow}
                className="px-5 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl lg:rounded-2xl shadow-xl hover:from-sky-500 hover:to-blue-600 transition-all duration-300 font-bold hover:scale-105 transform text-sm lg:text-base"
              >
                ➕ Add Grade
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-5 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-xl lg:rounded-2xl shadow-xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 font-bold hover:scale-105 transform text-sm lg:text-base"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Personality Questionnaire */}
      <section className="mb-6 lg:mb-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 rounded-2xl lg:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-lg lg:rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                <span className="text-xl lg:text-2xl">🧠</span>
              </div>
              <h2 className="text-xl lg:text-3xl font-black text-white">Personality Questionnaire</h2>
            </div>
            <p className="text-emerald-200 mb-4 lg:mb-6 text-sm lg:text-lg leading-relaxed">
              Answer the following questions to help us understand your personality and preferences for a tailored career recommendation:
            </p>
          <div className="space-y-3 lg:space-y-5">
            {/* 1. Problem-solving skills */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">🧩</span>
                <span className="text-sm lg:text-base">How do you rate your problem-solving skills?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, problemSolving: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-teal-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Excellent" className="bg-white text-gray-900">✨ Excellent</option>
                <option value="Good" className="bg-white text-gray-900">👍 Good</option>
                <option value="Average" className="bg-white text-gray-900">📊 Average</option>
                <option value="Below Average" className="bg-white text-gray-900">📉 Below Average</option>
              </select>
            </div>
            {/* 2. Work preference */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">👥</span>
                <span className="text-sm lg:text-base">How do you prefer to work?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, workPreference: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-emerald-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Independently" className="bg-white text-gray-900">🚶 Independently</option>
                <option value="In a team" className="bg-white text-gray-900">🤝 In a team</option>
                <option value="Mix of both" className="bg-white text-gray-900">🔄 Mix of both</option>
              </select>
            </div>
            {/* 3. Work environment */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">🏢</span>
                <span className="text-sm lg:text-base">What work environment suits you best?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, workEnvironment: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-lime-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Structured and predictable" className="bg-white text-gray-900">📋 Structured and predictable</option>
                <option value="Fast-paced and dynamic" className="bg-white text-gray-900">⚡ Fast-paced and dynamic</option>
                <option value="Flexible and creative" className="bg-white text-gray-900">🎨 Flexible and creative</option>
              </select>
            </div>
            {/* 4. Work-life balance */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">⚖️</span>
                <span className="text-sm lg:text-base">How important is work-life balance to you?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, workLifeBalance: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-emerald-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Very important" className="bg-white text-gray-900">⭐ Very important</option>
                <option value="Somewhat important" className="bg-white text-gray-900">👍 Somewhat important</option>
                <option value="Not important" className="bg-white text-gray-900">➖ Not important</option>
              </select>
            </div>
            {/* 5. Stress management */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">😰</span>
                <span className="text-sm lg:text-base">How do you handle stress?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, stressManagement: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-teal-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(45, 212, 191)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="I thrive under pressure" className="bg-white text-gray-900">💪 I thrive under pressure</option>
                <option value="I manage it well" className="bg-white text-gray-900">✅ I manage it well</option>
                <option value="I struggle sometimes" className="bg-white text-gray-900">😓 I struggle sometimes</option>
              </select>
            </div>
            {/* 6. Learning new technologies */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">💻</span>
                <span className="text-sm lg:text-base">Do you enjoy learning new technologies?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, learningNewTech: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-lime-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Yes" className="bg-white text-gray-900">✅ Yes</option>
                <option value="No" className="bg-white text-gray-900">❌ No</option>
              </select>
            </div>
            {/* 7. Communication skills */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">💬</span>
                <span className="text-sm lg:text-base">How would you describe your communication skills?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, communication: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-emerald-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Excellent" className="bg-white text-gray-900">⭐ Excellent</option>
                <option value="Good" className="bg-white text-gray-900">👍 Good</option>
                <option value="Average" className="bg-white text-gray-900">📊 Average</option>
                <option value="Needs Improvement" className="bg-white text-gray-900">📈 Needs Improvement</option>
              </select>
            </div>
            {/* 8. Preferred Career Choices */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">🎯</span>
                <span className="text-sm lg:text-base">What careers are you most interested in? (List a few)</span>
              </label>
              <textarea
                onChange={(e) =>
                  setAnswers({ ...answers, preferredCareers: e.target.value })
                }
                rows={4}
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-teal-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-medium shadow-lg placeholder-gray-500 resize-none text-sm lg:text-base"
                placeholder="e.g., Software Engineer, Doctor, Architect, etc."
              />
            </div>
            {/* 9. Creativity */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">🎨</span>
                <span className="text-sm lg:text-base">How creative do you consider yourself?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, creativity: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-lime-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Highly creative" className="bg-white text-gray-900">✨ Highly creative</option>
                <option value="Somewhat creative" className="bg-white text-gray-900">🎭 Somewhat creative</option>
                <option value="Not very creative" className="bg-white text-gray-900">📋 Not very creative</option>
              </select>
            </div>
            {/* 10. Adaptability */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">🔄</span>
                <span className="text-sm lg:text-base">How adaptable are you to change?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, adaptability: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-emerald-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Highly adaptable" className="bg-white text-gray-900">🚀 Highly adaptable</option>
                <option value="Moderately adaptable" className="bg-white text-gray-900">⚖️ Moderately adaptable</option>
                <option value="Not very adaptable" className="bg-white text-gray-900">🐢 Not very adaptable</option>
              </select>
            </div>
            {/* 11. Handling criticism */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">💭</span>
                <span className="text-sm lg:text-base">How do you handle constructive criticism?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, criticismHandling: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-teal-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(45, 212, 191)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="I welcome it to improve" className="bg-white text-gray-900">🌟 I welcome it to improve</option>
                <option value="I consider it carefully" className="bg-white text-gray-900">🤔 I consider it carefully</option>
                <option value="I find it challenging" className="bg-white text-gray-900">😬 I find it challenging</option>
              </select>
            </div>
            {/* 12. Planning style */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">📝</span>
                <span className="text-sm lg:text-base">Do you prefer detailed planning or improvisation?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, planningStyle: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-lime-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Detailed planning" className="bg-white text-gray-900">📋 Detailed planning</option>
                <option value="Improvisation" className="bg-white text-gray-900">🎭 Improvisation</option>
                <option value="A mix of both" className="bg-white text-gray-900">🔀 A mix of both</option>
              </select>
            </div>
            {/* 13. Motivation by recognition */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">🏆</span>
                <span className="text-sm lg:text-base">How motivated are you by recognition and rewards?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, motivation: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-emerald-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Highly motivated" className="bg-white text-gray-900">🔥 Highly motivated</option>
                <option value="Somewhat motivated" className="bg-white text-gray-900">👍 Somewhat motivated</option>
                <option value="Not motivated" className="bg-white text-gray-900">➖ Not motivated</option>
              </select>
            </div>
            {/* 14. Importance of social interaction */}
            <div className="p-3 lg:p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-2 lg:mb-3 text-base lg:text-lg flex items-center gap-2">
                <span className="text-lg lg:text-xl">👫</span>
                <span className="text-sm lg:text-base">How important is social interaction in your work?</span>
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, socialInteraction: e.target.value })
                }
                className="p-3 lg:p-4 bg-white/90 backdrop-blur-md text-gray-900 border-2 border-teal-400/30 rounded-lg lg:rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10 text-sm lg:text-base" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(45, 212, 191)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "20px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-white text-gray-900">Select an option...</option>
                <option value="Very important" className="bg-white text-gray-900">⭐ Very important</option>
                <option value="Somewhat important" className="bg-white text-gray-900">👍 Somewhat important</option>
                <option value="Not important" className="bg-white text-gray-900">➖ Not important</option>
              </select>
            </div>
          </div>
          <button
            onClick={analyzeCareer}
            className="mt-4 lg:mt-6 w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-xl lg:rounded-2xl shadow-xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 font-black text-base lg:text-lg hover:scale-105 transform hover:shadow-lime-500/50"
          >
            🎯 Get Career Recommendation
          </button>
          </div>
        </div>
      </section>

      {/* Display AI Career Recommendations */}
      {careerRecommendation && (
        <section className="mt-6 lg:mt-8 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 rounded-2xl lg:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl">
              <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-lg lg:rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                  <span className="text-xl lg:text-2xl">🎯</span>
                </div>
                <h2 className="text-xl lg:text-3xl font-black text-white truncate">
                  Career Recommendations
                </h2>
              </div>
              {parsedRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {parsedRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="relative group/card"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/40 via-emerald-500/40 to-teal-500/40 rounded-xl lg:rounded-2xl blur-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl flex flex-col hover:scale-102 lg:hover:scale-105 transition-all duration-300">
                      <div className="flex justify-between items-start gap-2 mb-3 lg:mb-4">
                        <h3 className="text-lg lg:text-xl font-black bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent flex-1">
                          {rec.career}
                        </h3>
                        <span className="font-black text-white text-base lg:text-lg px-2 lg:px-3 py-1 bg-lime-500/30 backdrop-blur-sm rounded-full border border-lime-400/30 flex-shrink-0">
                          {rec.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 lg:h-3 mb-3 lg:mb-4 overflow-hidden backdrop-blur-sm border border-white/20">
                        <div
                          className="bg-gradient-to-r from-lime-400 to-emerald-500 h-2 lg:h-3 rounded-full transition-all duration-1000 shadow-lg shadow-lime-500/50"
                          style={{ width: `${rec.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-white/90 leading-relaxed text-sm lg:text-base">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                <p className="text-white whitespace-pre-wrap leading-relaxed text-sm lg:text-base">
                  {careerRecommendation}
                </p>
              </div>
            )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default GradesPage;
