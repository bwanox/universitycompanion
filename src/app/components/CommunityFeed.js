"use client";

import React from 'react';

const CommunityFeed = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl text-blue-600 font-semibold mb-6">Community Feed</h2>

      {/* Post 1 */}
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm mb-4">
        <div className="font-semibold text-blue-800">John Doe - Homework Submission</div>
        <p className="text-gray-700 mt-2">Looking for feedback on my homework about AI algorithms.</p>
      </div>

      {/* Post 2 */}
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
        <div className="font-semibold text-blue-800">Jane Smith - Course Suggestion</div>
        <p className="text-gray-700 mt-2">Would love recommendations for machine learning courses.</p>
      </div>
    </div>
  );
};

export default CommunityFeed;
