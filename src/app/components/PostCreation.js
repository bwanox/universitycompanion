"use client";

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import useCreatePost from '../hooks/useCreatePost';
import LoginPromptModal from './LoginPromptModal';

const PostCreation = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const { createPost, isUploading } = useCreatePost();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    // Require at least content or image before posting
    if (!content.trim() && !image) return;
    await createPost({ user, content, image });
    setContent('');
    setImage(null);
  };

  return (
    <>
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        {/* Header with user avatar and prompt */}
        <div className="flex items-center mb-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full mr-3" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <span className="text-lg font-semibold text-gray-700">
                {user?.displayName?.[0] || 'U'}
              </span>
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-800">
            What&apos;s on your mind, {user?.displayName?.split(' ')[0] || 'User'}?
          </h3>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows="3"
          />
          {image && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="max-h-60 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
              <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Add Photo</span>
            </label>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition disabled:opacity-50"
            >
              {isUploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
      <LoginPromptModal show={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
};

export default PostCreation;
