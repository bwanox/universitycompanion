"use client";
import { useEffect, useState } from "react";
import { useAssignments } from "../../hooks/useAssignments";
import { useAuth } from "../../auth/AuthContext";
import CustomCalendar from "../../components/customcalendar";
import AssignmentModal from "../../components/AssignmentModal";
import AssignmentBotHelper from "../../components/AssignmentsBotHelper";

// Function to compress an image file to a base64 string.
const compressImage = (file, maxSizeInBytes = 1024 * 1024) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const scaleFactor = file.size > maxSizeInBytes ? 0.7 : 1;
        width *= scaleFactor;
        height *= scaleFactor;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const quality = file.size > maxSizeInBytes ? 0.7 : 1;
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const AssignmentsPage = () => {
  const {
    assignments,
    getAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  } = useAssignments();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState("");

  // Transform assignments into calendar events for the calendar view.
  const calendarEvents = assignments.map((assignment) => ({
    id: assignment.id,
    title: `${assignment.course}: ${assignment.assignment}`,
    date: assignment.dueDate,
  }));

  useEffect(() => {
    if (user) {
      getAssignments(user.uid).catch((error) =>
        console.error("Error fetching assignments:", error)
      );
    }
  }, [user]);

  // Handler for submitting (adding/updating) an assignment.
  const handleSubmitAssignment = async ({
    course,
    assignment,
    dueDate,
    description,
    imageFile,
  }) => {
    if (!user) return;
    try {
      let imageData = null;
      if (imageFile) {
        imageData = await compressImage(imageFile);
      }
      const assignmentData = {
        course,
        assignment,
        dueDate,
        description,
        imageData, // base64 string (or null)
      };
      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, assignmentData, user.uid);
      } else {
        await addAssignment(assignmentData, user.uid);
      }
      setIsModalOpen(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await deleteAssignment(id);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDayClick = (dateStr, eventsForDay) => {
    const dayAssignments = assignments.filter((a) => a.dueDate === dateStr);
    setSelectedDay({ date: dateStr, assignments: dayAssignments });
    setPreselectedDate(dateStr);
    setShowDayModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 relative overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <h1 className="text-4xl font-black text-white drop-shadow-2xl relative z-10">
          Please log in to view assignments
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 relative bg-gradient-to-br from-purple-950 via-violet-900 to-fuchsia-950 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-40 right-0 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-float delay-500"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl animate-float delay-1000"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>


      {/* Calendar Section */}
      <section className="mb-8 lg:mb-12 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl">
            <CustomCalendar
              events={calendarEvents}
              onAddEvent={() => {
                setEditingAssignment(null);
                setIsModalOpen(true);
              }}
              onDayClick={handleDayClick}
            />
          </div>
        </div>
      </section>

      {/* Assignments Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {assignments.length > 0 ? (
          assignments.map((assignment, index) => (
            <div
              key={assignment.id}
              className="relative group"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-violet-500/40 to-fuchsia-500/40 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl flex flex-col transition-all duration-500 hover:scale-105 hover:border-purple-400/60 animate-fade-in">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                      <span className="text-xl">📚</span>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/30 backdrop-blur-sm rounded-full text-xs font-bold text-purple-200 border border-purple-400/30">
                      {assignment.dueDate}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent">
                    {assignment.course}
                  </h2>
                  <h3 className="text-lg font-bold text-purple-300 mb-3">
                    {assignment.assignment}
                  </h3>
                  {assignment.description && (
                    <p className="text-purple-100/80 mb-4 text-sm leading-relaxed">{assignment.description}</p>
                  )}
                  {assignment.imageData && (
                    <div className="relative group/img">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-2xl blur-md opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={assignment.imageData}
                        alt="Assignment"
                        className="relative w-full h-48 object-cover rounded-2xl border border-purple-400/30 shadow-lg transform group-hover/img:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleEditAssignment(assignment)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-3 rounded-2xl shadow-lg hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 font-bold hover:shadow-yellow-500/50 hover:scale-105 transform"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold hover:shadow-red-500/50 hover:scale-105 transform"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="inline-block p-12 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl">
              <div className="text-6xl mb-4 animate-bounce-slow">📝</div>
              <p className="text-purple-200 text-2xl font-bold mb-2">No assignments yet</p>
              <p className="text-purple-300/80">Click the + button to add your first assignment!</p>
            </div>
          </div>
        )}
      </section>

      {/* Floating Add Assignment Button */}
      <button
        onClick={() => {
          setEditingAssignment(null);
          setIsModalOpen(true);
        }}
        title="Add Assignment"
        aria-label="Add Assignment"
        className="fixed bottom-8 right-8 bg-gradient-to-br from-lime-400 via-emerald-400 to-teal-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition-all duration-300 focus:outline-none z-50 animate-pulse hover:animate-none hover:shadow-lime-500/50 border-2 border-white/30"
      >
        +
      </button>

      {/* Floating Bot Helper Button */}
      <button
        onClick={() => setIsBotOpen(true)}
        title="Open Bot Helper"
        aria-label="Open Bot Helper"
        className="fixed bottom-28 right-8 bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-all duration-300 focus:outline-none z-50 hover:shadow-purple-500/50 border-2 border-white/30 animate-shimmer"
      >
        🤖
      </button>

      {/* Assignment Modal for Add/Edit */}
      <AssignmentModal
        show={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAssignment(null);
          setPreselectedDate("");
        }}
        onSubmit={handleSubmitAssignment}
        initialData={editingAssignment || { dueDate: preselectedDate }}
      />

      {/* Assignments Bot Helper Modal */}
      {isBotOpen && (
        <AssignmentBotHelper
          assignments={assignments}
          onClose={() => setIsBotOpen(false)}
        />
      )}

      {/* Day Details Modal */}
      {showDayModal && selectedDay && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowDayModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-purple-900/95 to-fuchsia-900/95 backdrop-blur-xl border-2 border-purple-400/50 rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4 transform transition-all animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center animate-bounce-slow">
                  <span className="text-3xl">📅</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                    {new Date(selectedDay.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="text-purple-300/80 text-sm font-semibold mt-1">
                    {selectedDay.assignments.length} assignment{selectedDay.assignments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDayModal(false)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Assignments List */}
            {selectedDay.assignments.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedDay.assignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-102 hover:border-purple-400/50 animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                          <span className="text-2xl">📚</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white">{assignment.course}</h4>
                          <p className="text-purple-300 font-bold">{assignment.assignment}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-purple-500/30 border border-purple-400/40 rounded-full text-xs font-bold text-purple-200">
                        {assignment.dueDate}
                      </span>
                    </div>
                    
                    {assignment.description && (
                      <p className="text-purple-100/90 text-sm leading-relaxed mb-4 pl-15">
                        {assignment.description}
                      </p>
                    )}
                    
                    {assignment.imageData && (
                      <div className="relative group/img mt-4 pl-15">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-xl blur-md opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                        <img
                          src={assignment.imageData}
                          alt="Assignment"
                          className="relative w-full h-48 object-cover rounded-xl border border-purple-400/30 shadow-lg transform group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 pl-15">
                      <button
                        onClick={() => {
                          handleEditAssignment(assignment);
                          setShowDayModal(false);
                        }}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-xl shadow-lg hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 font-bold text-sm hover:shadow-yellow-500/50 hover:scale-105 transform flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteAssignment(assignment.id);
                          if (selectedDay.assignments.length === 1) {
                            setShowDayModal(false);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl shadow-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold text-sm hover:shadow-red-500/50 hover:scale-105 transform flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                  <span className="text-5xl">📭</span>
                </div>
                <p className="text-white/80 text-xl font-bold mb-2">No assignments for this day</p>
                <p className="text-purple-300/70 text-sm">Click the + button to add a new assignment</p>
                <button
                  onClick={() => {
                    setShowDayModal(false);
                    setPreselectedDate(selectedDay.date);
                    setIsModalOpen(true);
                  }}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-lime-400 to-emerald-500 text-white font-bold rounded-2xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-lime-500/50"
                >
                  ➕ Add Assignment
                </button>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                onClick={() => setShowDayModal(false)}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
