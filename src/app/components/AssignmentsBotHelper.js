import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

const AssignmentBotHelper = ({ assignments, onClose }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  useEffect(() => {
    if (assignments && assignments.length > 0) {
      setSelectedAssignment(assignments[0]);
    }
  }, [assignments]);

  useEffect(() => {
    if (selectedAssignment && selectedAssignment.imageData) {
      extractTextFromImage(selectedAssignment.imageData);
    } else {
      setExtractedText("");
    }
    // eslint-disable-next-line
  }, [selectedAssignment]);

  const extractTextFromImage = async (imageUrl) => {
    try {
      setLoading(true);
      const { data } = await Tesseract.recognize(imageUrl, "eng");
      setExtractedText(data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      setExtractedText("Failed to extract text.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchHint = async () => {
    if (!selectedAssignment) return;

    setLoading(true);

    const prompt = `
      You are a helpful AI tutor providing hints to students working on assignments. 
      Provide a concise, insightful hint for the following assignment without revealing the full answer.
      
      Assignment Details:
      - Course: ${selectedAssignment.course}
      - Assignment Title: ${selectedAssignment.assignment}
      - Key Topics: ${selectedAssignment.topics || "Not specified"}
      - Extracted Text (if available): ${extractedText || "No text extracted"}

      Hint format:
      -use the language provided in the assignment.
      - Guide the student toward solving the problem without giving away the answer.
      - give each question a brief answer and description depending on the language provided.

      Generate a hint for each question:

    `;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "system", content: "You are an AI tutor." }, { role: "user", content: prompt }],
          max_tokens: 5000,
        }),
      });

      const data = await response.json();
      console.log("API response:", data);
      if (data.error) {
        setHint(`API Error: ${data.error.message || "Unknown error."}`);
        return;
      }
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        setHint("No hint available. The AI did not return any suggestions.");
        return;
      }
      setHint(data.choices[0].message.content || "No hint available.");
      console.log("API response:", data.choices[0].message.content);
    } catch (error) {
      console.error("Error fetching hint:", error);
      setHint("Failed to fetch hint. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900/90 via-violet-900/90 to-fuchsia-900/90 backdrop-blur-xl p-4 animate-fade-in">
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:rotate-90 hover:scale-110 z-10"
          title="Close"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h2 className="text-3xl font-black bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg tracking-tight">Assignment Bot Helper</h2>

        {/* Assignment Selector */}
        {assignments && assignments.length > 0 && (
          <div className="mb-6">
            <label className="block text-purple-200 font-bold mb-2 text-lg" htmlFor="assignment-select">
              Choose Assignment:
            </label>
            <select
              id="assignment-select"
              className="w-full p-3 rounded-2xl bg-white/20 text-purple-900 font-bold border border-purple-400/30 shadow focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              value={selectedAssignment ? selectedAssignment.id : ""}
              onChange={e => {
                const found = assignments.find(a => a.id === e.target.value);
                setSelectedAssignment(found);
              }}
            >
              {assignments.map(a => (
                <option key={a.id} value={a.id} className="text-purple-900">
                  {a.course}: {a.assignment}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Assignment Details */}
        {selectedAssignment && (
          <div className="border border-purple-400/30 bg-white/10 backdrop-blur-xl rounded-2xl mb-6 p-6 shadow-lg animate-fade-in">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center animate-bounce-slow">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
                  {selectedAssignment.course}: {selectedAssignment.assignment}
                </h3>
                <p className="text-purple-300 font-bold">Due: {selectedAssignment.dueDate}</p>
              </div>
            </div>
            {selectedAssignment.description && (
              <p className="mt-2 text-purple-100/90 text-sm leading-relaxed mb-2">{selectedAssignment.description}</p>
            )}
            {selectedAssignment.imageData && (
              <div className="relative group/img mt-4">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-xl blur-md opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={selectedAssignment.imageData}
                  alt="Assignment"
                  className="relative w-full h-48 object-cover rounded-xl border border-purple-400/30 shadow-lg group-hover/img:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            {extractedText && (
              <div className="p-2 mt-2 bg-purple-100/10 border border-purple-400/20 rounded">
                <p className="text-sm font-bold text-purple-200">Extracted Text:</p>
                <p className="text-purple-100/90 text-xs whitespace-pre-line">{extractedText}</p>
              </div>
            )}
          </div>
        )}

        {/* Query Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Ask for hints (e.g., 'How do I start this?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white/20 text-purple-900 font-bold border border-purple-400/30 shadow focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-6">
          <button
            onClick={handleFetchHint}
            className="flex-1 bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 font-bold hover:shadow-lime-500/50 hover:scale-105 transform text-lg"
            disabled={loading || !selectedAssignment}
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> Fetching...</span>
            ) : (
              <span>💡 Fetch Hint</span>
            )}
          </button>
        </div>

        {/* Hint Output */}
        {hint && (
          <div className="p-6 border border-purple-400/30 rounded-2xl bg-white/10 backdrop-blur-xl shadow-lg animate-fade-in">
            <p className="font-black text-lg text-purple-200 mb-2">Hint:</p>
            <div
              className="text-purple-100/90 whitespace-pre-line text-base"
              dangerouslySetInnerHTML={{ __html: hint.replace(/\n/g, "<br/>") }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentBotHelper;