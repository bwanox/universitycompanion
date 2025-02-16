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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Please log in to view assignments
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 relative bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="mb-10 text-center bg-transparent">
        <h1 className="text-5xl font-extrabold text-cyan-400 drop-shadow-2xl">
          Your Assignments
        </h1>
      </header>

      {/* Calendar Section */}
      <section className="mb-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
          <CustomCalendar
            events={calendarEvents}
            onAddEvent={() => {
              setEditingAssignment(null);
              setIsModalOpen(true);
            }}
            onDayClick={handleDayClick}
          />
        </div>
      </section>

      {/* Assignments Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6 flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-cyan-300 mb-2">
                  {assignment.course}: {assignment.assignment}
                </h2>
                <p className="text-gray-400 mb-2">Due: {assignment.dueDate}</p>
                {assignment.description && (
                  <p className="text-gray-300 mb-4">{assignment.description}</p>
                )}
                {assignment.imageData && (
                  <img
                    src={assignment.imageData}
                    alt="Assignment"
                    className="w-full h-48 object-cover rounded-lg border border-gray-700 shadow-md"
                  />
                )}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => handleEditAssignment(assignment)}
                  className="flex-1 mr-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-md hover:from-yellow-500 hover:to-orange-600 transition-colors focus:outline-none"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="flex-1 ml-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-md hover:from-red-600 hover:to-pink-600 transition-colors focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-300 text-xl">
            No assignments available.
          </p>
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
        className="fixed bottom-8 right-8 bg-gradient-to-r from-green-400 to-blue-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:from-green-500 hover:to-blue-600 animate-pulse focus:outline-none"
      >
        +
      </button>

      {/* Floating Bot Helper Button */}
      <button
        onClick={() => setIsBotOpen(true)}
        title="Open Bot Helper"
        aria-label="Open Bot Helper"
        className="fixed bottom-24 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:from-purple-600 hover:to-pink-600 animate-bounce focus:outline-none"
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
