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
  const { assignments, getAssignments, addAssignment, updateAssignment, deleteAssignment } = useAssignments();
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
  const handleSubmitAssignment = async ({ course, assignment, dueDate, description, imageFile }) => {
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
        .map((a) =>
          `Course: ${a.course}\nAssignment: ${a.assignment}\nDue: ${a.dueDate}\nDesc: ${a.description || "N/A"}`
        )
        .join("\n\n");
      alert(`Assignments for ${dateStr}:\n\n${details}`);
    } else {
      alert(`No assignments for ${dateStr}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-blue-900">Please log in to view assignments</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-blue-900 text-center">
          Your Assignments
        </h1>
      </header>

      {/* Calendar Section */}
      <section className="mb-8">
        <CustomCalendar
          events={calendarEvents}
          onAddEvent={() => {
            setEditingAssignment(null);
            setIsModalOpen(true);
          }}
          onDayClick={handleDayClick}
        />
      </section>

      {/* Assignments Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-2xl transition duration-300"
            >
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-800 mb-2">
                  {assignment.course}: {assignment.assignment}
                </h2>
                <p className="text-gray-600 mb-2">Due: {assignment.dueDate}</p>
                {assignment.description && (
                  <p className="text-gray-700 mb-4">{assignment.description}</p>
                )}
                {assignment.imageData && (
                  <img
                    src={assignment.imageData}
                    alt="Assignment"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => handleEditAssignment(assignment)}
                  className="flex-1 mr-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="flex-1 ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">No assignments available.</p>
        )}
      </section>

      {/* Floating Add Assignment Button */}
      <button
        onClick={() => {
          setEditingAssignment(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-blue-700 transition"
      >
        +
      </button>

      {/* Floating Bot Helper Button */}
      <button
        onClick={() => setIsBotOpen(true)}
        className="fixed bottom-8 left-8 bg-purple-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-purple-700 transition"
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
