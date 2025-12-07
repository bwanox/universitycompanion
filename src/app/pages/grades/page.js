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
    <div className="min-h-screen p-8 bg-gradient-to-br from-emerald-950 via-teal-900 to-lime-950 relative overflow-hidden">
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
      <section className="mb-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">📄</span>
              </div>
              <h2 className="text-3xl font-black text-white">Upload Grades Transcript</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="flex-1 p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 shadow-lg shadow-emerald-500/10 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-emerald-400 file:to-teal-500 file:text-white file:font-bold file:cursor-pointer file:shadow-lg hover:file:from-emerald-500 hover:file:to-teal-600 hover:file:scale-105 file:transition-all file:duration-300"
              />
              <button
                onClick={handleFileUpload}
                className="px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-2xl shadow-xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 font-bold hover:scale-105 transform hover:shadow-lime-500/50"
              >
                🔍 Extract Grades
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Display & Edit Saved Grades */}
      <section className="mb-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-3xl font-black text-white">Saved Grades</h2>
            </div>
            {editableGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-500">
                      <th className="p-4 text-left text-white font-black rounded-tl-2xl">Course</th>
                      <th className="p-4 text-left text-white font-black">Grade</th>
                      <th className="p-4 text-left text-white font-black rounded-tr-2xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableGrades.map((grade, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <input
                            type="text"
                            value={grade.course}
                            onChange={(e) =>
                              handleInputChange(index, "course", e.target.value)
                            }
                            className="w-full p-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md text-white border-2 border-teal-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 font-semibold placeholder-white/40"
                            placeholder="Enter course name"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            step="0.1"
                            value={grade.grade}
                            onChange={(e) =>
                              handleInputChange(index, "grade", e.target.value)
                            }
                            className="w-full p-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 font-bold text-lg placeholder-white/40"
                            placeholder="0.0"
                          />
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteRow(index)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl shadow-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold hover:scale-105 transform"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3 animate-bounce-slow">📈</div>
                <p className="text-emerald-200 text-lg font-bold">No grades available yet</p>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={handleAddRow}
                className="px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-2xl shadow-xl hover:from-sky-500 hover:to-blue-600 transition-all duration-300 font-bold hover:scale-105 transform"
              >
                ➕ Add Grade
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-6 py-3 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-2xl shadow-xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 font-bold hover:scale-105 transform"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Personality Questionnaire */}
      <section className="mb-8 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="text-3xl font-black text-white">Personality Questionnaire</h2>
            </div>
            <p className="text-emerald-200 mb-6 text-lg leading-relaxed">
              Answer the following questions to help us understand your personality and preferences for a tailored career recommendation:
            </p>
          <div className="space-y-5">
            {/* 1. Problem-solving skills */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">🧩</span>
                How do you rate your problem-solving skills?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, problemSolving: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-teal-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Excellent" className="bg-gray-900 text-black">✨ Excellent</option>
                <option value="Good" className="bg-gray-900 text-black">👍 Good</option>
                <option value="Average" className="bg-gray-900 text-black">📊 Average</option>
                <option value="Below Average" className="bg-gray-900 text-black">📉 Below Average</option>
              </select>
            </div>
            {/* 2. Work preference */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">👥</span>
                How do you prefer to work?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, workPreference: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Independently" className="bg-gray-900 text-black">🚶 Independently</option>
                <option value="In a team" className="bg-gray-900 text-black">🤝 In a team</option>
                <option value="Mix of both" className="bg-gray-900 text-black">🔄 Mix of both</option>
              </select>
            </div>
            {/* 3. Work environment */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">🏢</span>
                What work environment suits you best?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, workEnvironment: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-lime-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Structured and predictable" className="bg-gray-900 text-black">📋 Structured and predictable</option>
                <option value="Fast-paced and dynamic" className="bg-gray-900 text-black">⚡ Fast-paced and dynamic</option>
                <option value="Flexible and creative" className="bg-gray-900 text-black">🎨 Flexible and creative</option>
              </select>
            </div>
            {/* 4. Work-life balance */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                How important is work-life balance to you?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, workLifeBalance: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Very important" className="bg-gray-900 text-black">⭐ Very important</option>
                <option value="Somewhat important" className="bg-gray-900 text-black">👍 Somewhat important</option>
                <option value="Not important" className="bg-gray-900 text-black">➖ Not important</option>
              </select>
            </div>
            {/* 5. Stress management */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">😰</span>
                How do you handle stress?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, stressManagement: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-teal-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(45, 212, 191)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="I thrive under pressure" className="bg-gray-900 text-black">💪 I thrive under pressure</option>
                <option value="I manage it well" className="bg-gray-900 text-black">✅ I manage it well</option>
                <option value="I struggle sometimes" className="bg-gray-900 text-black">😓 I struggle sometimes</option>
              </select>
            </div>
            {/* 6. Learning new technologies */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">💻</span>
                Do you enjoy learning new technologies?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, learningNewTech: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-lime-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Yes" className="bg-gray-900 text-black">✅ Yes</option>
                <option value="No" className="bg-gray-900 text-black">❌ No</option>
              </select>
            </div>
            {/* 7. Communication skills */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">💬</span>
                How would you describe your communication skills?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, communication: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Excellent" className="bg-gray-900 text-black">⭐ Excellent</option>
                <option value="Good" className="bg-gray-900 text-black">👍 Good</option>
                <option value="Average" className="bg-gray-900 text-black">📊 Average</option>
                <option value="Needs Improvement" className="bg-gray-900 text-black">📈 Needs Improvement</option>
              </select>
            </div>
            {/* 8. Preferred Career Choices */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">🎯</span>
                What careers are you most interested in? (List a few)
              </label>
              <textarea
                onChange={(e) =>
                  setAnswers({ ...answers, preferredCareers: e.target.value })
                }
                rows={4}
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-teal-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-medium shadow-lg placeholder-white/40 resize-none"
                placeholder="e.g., Software Engineer, Doctor, Architect, etc."
              />
            </div>
            {/* 9. Creativity */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">🎨</span>
                How creative do you consider yourself?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, creativity: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-lime-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Highly creative" className="bg-gray-900 text-black">✨ Highly creative</option>
                <option value="Somewhat creative" className="bg-gray-900 text-black">🎭 Somewhat creative</option>
                <option value="Not very creative" className="bg-gray-900 text-black">📋 Not very creative</option>
              </select>
            </div>
            {/* 10. Adaptability */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">🔄</span>
                How adaptable are you to change?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, adaptability: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Highly adaptable" className="bg-gray-900 text-black">🚀 Highly adaptable</option>
                <option value="Moderately adaptable" className="bg-gray-900 text-black">⚖️ Moderately adaptable</option>
                <option value="Not very adaptable" className="bg-gray-900 text-black">🐢 Not very adaptable</option>
              </select>
            </div>
            {/* 11. Handling criticism */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">💭</span>
                How do you handle constructive criticism?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, criticismHandling: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-teal-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(45, 212, 191)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="I welcome it to improve" className="bg-gray-900 text-black">🌟 I welcome it to improve</option>
                <option value="I consider it carefully" className="bg-gray-900 text-black">🤔 I consider it carefully</option>
                <option value="I find it challenging" className="bg-gray-900 text-black">😬 I find it challenging</option>
              </select>
            </div>
            {/* 12. Planning style */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-lime-400/20 hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-500/20 transition-all duration-300">
              <label className="block text-lime-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">📝</span>
                Do you prefer detailed planning or improvisation?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, planningStyle: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-lime-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 hover:border-lime-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(163, 230, 53)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Detailed planning" className="bg-gray-900 text-black">📋 Detailed planning</option>
                <option value="Improvisation" className="bg-gray-900 text-black">🎭 Improvisation</option>
                <option value="A mix of both" className="bg-gray-900 text-black">🔀 A mix of both</option>
              </select>
            </div>
            {/* 13. Motivation by recognition */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <label className="block text-emerald-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">🏆</span>
                How motivated are you by recognition and rewards?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, motivation: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-emerald-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(52, 211, 153)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Highly motivated" className="bg-gray-900 text-black">🔥 Highly motivated</option>
                <option value="Somewhat motivated" className="bg-gray-900 text-black">👍 Somewhat motivated</option>
                <option value="Not motivated" className="bg-gray-900 text-black">➖ Not motivated</option>
              </select>
            </div>
            {/* 14. Importance of social interaction */}
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl border-2 border-teal-400/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
              <label className="block text-teal-100 font-bold mb-3 text-lg flex items-center gap-2">
                <span className="text-xl">👫</span>
                How important is social interaction in your work?
              </label>
              <select
                onChange={(e) =>
                  setAnswers({ ...answers, socialInteraction: e.target.value })
                }
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border-2 border-teal-400/30 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-teal-400/50 transition-all duration-300 font-semibold cursor-pointer shadow-lg appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(45, 212, 191)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", backgroundSize: "24px", backgroundPosition: "right 12px center"}}
              >
                <option value="" className="bg-gray-900 text-black">Select an option...</option>
                <option value="Very important" className="bg-gray-900 text-black">⭐ Very important</option>
                <option value="Somewhat important" className="bg-gray-900 text-black">👍 Somewhat important</option>
                <option value="Not important" className="bg-gray-900 text-black">➖ Not important</option>
              </select>
            </div>
          </div>
          <button
            onClick={analyzeCareer}
            className="mt-6 px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-2xl shadow-xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 font-black text-lg hover:scale-105 transform hover:shadow-lime-500/50"
          >
            🎯 Get Career Recommendation
          </button>
          </div>
        </div>
      </section>

      {/* Display AI Career Recommendations */}
      {careerRecommendation && (
        <section className="mt-8 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-3xl font-black text-white">
                  Career Recommendations
                </h2>
              </div>
              {parsedRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parsedRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="relative group/card"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/40 via-emerald-500/40 to-teal-500/40 rounded-2xl blur-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl flex flex-col hover:scale-105 transition-all duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-black bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
                          {rec.career}
                        </h3>
                        <span className="font-black text-white text-lg px-3 py-1 bg-lime-500/30 backdrop-blur-sm rounded-full border border-lime-400/30">
                          {rec.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden backdrop-blur-sm border border-white/20">
                        <div
                          className="bg-gradient-to-r from-lime-400 to-emerald-500 h-3 rounded-full transition-all duration-1000 shadow-lg shadow-lime-500/50"
                          style={{ width: `${rec.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-white/90 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
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
