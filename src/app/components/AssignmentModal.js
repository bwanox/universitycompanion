import React, { useState, useEffect } from "react";

const AssignmentModal = ({ show, onClose, onSubmit, initialData = {} }) => {
  // Destructure initial values with defaults
  const {
    course: initialCourse = "",
    assignment: initialAssignment = "",
    dueDate: initialDueDate = "",
    description: initialDescription = "",
  } = initialData;

  const [course, setCourse] = useState(initialCourse);
  const [assignment, setAssignment] = useState(initialAssignment);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [description, setDescription] = useState(initialDescription);
  const [imageFile, setImageFile] = useState(null);

  // When the modal opens, initialize state only once.
  useEffect(() => {
    if (show) {
      setCourse(initialCourse);
      setAssignment(initialAssignment);
      setDueDate(initialDueDate);
      setDescription(initialDescription);
      setImageFile(null);
    }
  }, [show, initialCourse, initialAssignment, initialDueDate, initialDescription]);

  if (!show) return null;

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass all fields to onSubmit.
    onSubmit({ course, assignment, dueDate, description, imageFile });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">
          {initialData && initialData.id ? "Update Assignment" : "Add Assignment"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="course" className="block text-blue-900 mb-1">
              Course Name:
            </label>
            <input
              id="course"
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="assignment" className="block text-blue-900 mb-1">
              Assignment Name:
            </label>
            <input
              id="assignment"
              type="text"
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-blue-900 mb-1">
              Due Date:
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-blue-900 mb-1">
              Description (optional):
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter additional details, image URLs, or rich text..."
              rows="3"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-blue-900 mb-1">
              Image (optional):
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-blue-900 border border-blue-900 hover:bg-blue-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
            >
              {initialData && initialData.id ? "Update" : "Add Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
