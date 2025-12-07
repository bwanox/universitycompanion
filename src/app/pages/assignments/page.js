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
    if (eventsForDay.length > 0) {
      const dayAssignments = assignments.filter((a) => a.dueDate === dateStr);
      const details = dayAssignments
        .map(
          (a) =>
            `Course: ${a.course}\nAssignment: ${a.assignment}\nDue: ${a.dueDate}\nDesc: ${
              a.description || "N/A"
            }`
        )
        .join("\n\n");
      alert(`Assignments for ${dateStr}:\n\n${details}`);
    } else {
      alert(`No assignments for ${dateStr}`);
    }
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
    <div className="min-h-screen p-8 relative bg-gradient-to-br from-purple-950 via-violet-900 to-fuchsia-950 overflow-hidden">
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
      <section className="mb-12 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="text-3xl font-black text-white">Assignment Calendar</h2>
            </div>
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
        }}
        onSubmit={handleSubmitAssignment}
        initialData={editingAssignment || {}}
      />

      {/* Assignments Bot Helper Modal */}
      {isBotOpen && (
        <AssignmentBotHelper
          assignments={assignments}
          onClose={() => setIsBotOpen(false)}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
