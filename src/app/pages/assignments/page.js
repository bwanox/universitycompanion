"use client";
import { useEffect, useState } from "react";
import { useAssignments } from "../../hooks/useAssignments";
import { useAuth } from "../../auth/AuthContext";
import CustomCalendar from "../../components/customcalendar";
import AssignmentModal from "../../components/AssignmentModal";
import { db } from "../../auth/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const AssignmentsPage = () => {
  const {
    assignments,
    getAssignments,
    addAssignment,
    deleteAssignment,
  } = useAssignments();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform assignments into calendar events
  const calendarEvents = assignments.map(assignment => ({
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

  const handleSubmitAssignment = async ({ course, assignment, dueDate }) => {
    if (!user) return;
    try {
      const newAssignment = {
        course,
        assignment,
        dueDate,
      };
      await addAssignment(newAssignment, user.uid);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  };

  const handleDayClick = (dateStr, eventsForDay) => {
    if (eventsForDay.length > 0) {
      const details = eventsForDay
        .map((ev) => `• ${ev.title} (Due: ${ev.date})`)
        .join("\n");
      alert(`Assignments for ${dateStr}:\n${details}`);
    } else {
      alert(`No assignments for ${dateStr}`);
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await deleteAssignment(id);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-white text-blue-900">
        <h1 className="text-3xl font-bold mb-4">
          Please log in to view assignments
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white text-blue-900 relative">
      <h1 className="text-3xl font-bold mb-4">Your Assignments</h1>

      <div className="mb-8">
        <CustomCalendar
          events={calendarEvents}
          onAddEvent={() => setIsModalOpen(true)}
          onDayClick={handleDayClick}
        />
      </div>

      <div className="bg-blue-100 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Assignments</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Assignment
          </button>
        </div>
        {assignments.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Assignment</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-blue-300">
                  <td className="p-3">{assignment.course}</td>
                  <td className="p-3">{assignment.assignment}</td>
                  <td className="p-3">{assignment.dueDate}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No assignments available.</p>
        )}
      </div>

      <AssignmentModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitAssignment}
      />
    </div>
  );
};

export default AssignmentsPage;