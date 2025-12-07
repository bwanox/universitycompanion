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
  const [imagePreview, setImagePreview] = useState(null);

  // When the modal opens, initialize state only once.
  useEffect(() => {
    if (show) {
      setCourse(initialCourse);
      setAssignment(initialAssignment);
      setDueDate(initialDueDate);
      setDescription(initialDescription);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [show, initialCourse, initialAssignment, initialDueDate, initialDescription]);

  if (!show) return null;

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass all fields to onSubmit.
    onSubmit({ course, assignment, dueDate, description, imageFile });
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-purple-900/95 via-violet-900/95 to-fuchsia-900/95 backdrop-blur-xl border-2 border-purple-400/50 rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4 transform transition-all animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center animate-bounce-slow shadow-xl shadow-purple-500/50">
                <span className="text-4xl">{initialData && initialData.id ? '✏️' : '➕'}</span>
              </div>
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                  {initialData && initialData.id ? "Update Assignment" : "Add Assignment"}
                </h2>
                <p className="text-purple-300/70 text-sm font-semibold mt-1">
                  Fill in the details below
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Course Name */}
            <div className="animate-slide-in" style={{ animationDelay: '100ms' }}>
              <label htmlFor="course" className="block text-white font-bold mb-2 flex items-center gap-2">
                <span className="text-xl">📚</span>
                Course Name
              </label>
              <input
                id="course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 font-semibold"
                placeholder="e.g., Computer Science 101"
                required
              />
            </div>

            {/* Assignment Name */}
            <div className="animate-slide-in" style={{ animationDelay: '200ms' }}>
              <label htmlFor="assignment" className="block text-white font-bold mb-2 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Assignment Name
              </label>
              <input
                id="assignment"
                type="text"
                value={assignment}
                onChange={(e) => setAssignment(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 font-semibold"
                placeholder="e.g., Project Report"
                required
              />
            </div>

            {/* Due Date */}
            <div className="animate-slide-in" style={{ animationDelay: '300ms' }}>
              <label htmlFor="dueDate" className="block text-white font-bold mb-2 flex items-center gap-2">
                <span className="text-xl">📅</span>
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 font-semibold [color-scheme:dark]"
                required
              />
            </div>

            {/* Description */}
            <div className="animate-slide-in" style={{ animationDelay: '400ms' }}>
              <label htmlFor="description" className="block text-white font-bold mb-2 flex items-center gap-2">
                <span className="text-xl">💬</span>
                Description <span className="text-purple-300/60 text-sm font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 font-semibold resize-none"
                placeholder="Enter additional details about the assignment..."
                rows="4"
              />
            </div>

            {/* Image Upload */}
            <div className="animate-slide-in" style={{ animationDelay: '500ms' }}>
              <label className="block text-white font-bold mb-2 flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                Attachment <span className="text-purple-300/60 text-sm font-normal">(optional)</span>
              </label>
              
              {!imagePreview ? (
                <label htmlFor="image" className="block cursor-pointer">
                  <div className="w-full p-8 bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-2xl text-center hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">📎</span>
                    </div>
                    <p className="text-white/80 font-semibold mb-1">Click to upload image</p>
                    <p className="text-white/50 text-sm">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="relative w-full h-48 object-cover rounded-2xl border-2 border-white/30"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-xl"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 animate-slide-in" style={{ animationDelay: '600ms' }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-black rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-purple-500/50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                {initialData && initialData.id ? "Update" : "Add Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
