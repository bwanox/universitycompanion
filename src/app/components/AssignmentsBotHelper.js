import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js"; // Import Tesseract.js

const AssignmentBotHelper = ({ assignments, onClose }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  useEffect(() => {
    if (assignments && assignments.length > 0) {
      const randomAssignment = assignments[Math.floor(Math.random() * assignments.length)];
      setSelectedAssignment(randomAssignment);

      if (randomAssignment.imageData) {
        extractTextFromImage(randomAssignment.imageData);
      }
    }
  }, [assignments]);

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
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: "You are an AI tutor." }, { role: "user", content: prompt }],
          max_tokens: 5000,
        }),
      });

      const data = await response.json();
      console.log("API response:", data);
      if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid API response: No choices found.");
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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">Assignment Bot Helper</h2>
        {selectedAssignment && (
          <div className="border p-4 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-blue-800">
              {selectedAssignment.course}: {selectedAssignment.assignment}
            </h3>
            <p className="text-gray-600">Due: {selectedAssignment.dueDate}</p>
            {selectedAssignment.description && (
              <p className="mt-2 text-gray-700">{selectedAssignment.description}</p>
            )}
            {selectedAssignment.imageData && (
              <img
                src={selectedAssignment.imageData}
                alt="Assignment"
                className="mt-4 w-full h-64 object-cover rounded-lg border"
              />
            )}
            {extractedText && (
              <div className="p-2 mt-2 bg-gray-100 border rounded">
                <p className="text-sm font-bold text-blue-900">Extracted Text:</p>
                <p className="text-gray-700">{extractedText}</p>
              </div>
            )}
          </div>
        )}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Ask for hints (e.g., 'How do I start this?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-end space-x-4 mb-4">
          <button
            onClick={handleFetchHint}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            {loading ? "Fetching..." : "Fetch Hint"}
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
        {hint && (
          <div className="p-4 border rounded-lg bg-gray-100">
            <p className="font-bold text-blue-900">Hint:</p>
            <div
              className="text-gray-800"
              dangerouslySetInnerHTML={{ __html: hint.replace(/\n/g, "<br/>") }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentBotHelper;