"use client";
import React from 'react';

const LoginPromptModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Please Sign In</h2>
        <p className="mb-4">
          You must be logged in to perform this action. Please log in or create an account.
        </p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
