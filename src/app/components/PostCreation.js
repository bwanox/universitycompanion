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
      <div className="bg-white shadow-lg lg:shadow rounded-xl lg:rounded-xl p-3 lg:p-4 mb-4 lg:mb-6 w-full max-w-full">
        {/* Header with user avatar and prompt */}
        <div className="flex items-center mb-3 lg:mb-4 w-full">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full mr-2 lg:mr-3 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-300 flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
              <span className="text-base lg:text-lg font-semibold text-gray-700">
                {user?.displayName?.[0] || 'U'}
              </span>
            </div>
          )}
          <h3 className="text-sm lg:text-lg font-medium text-gray-800 truncate min-w-0 flex-1">
            What&apos;s on your mind, {user?.displayName?.split(' ')[0] || 'User'}?
          </h3>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update..."
            className="w-full p-2.5 lg:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-gray-800 text-sm lg:text-base"
            rows="3"
          />
          {image && (
            <div className="mt-2 lg:mt-3 w-full">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="max-h-40 lg:max-h-60 object-cover rounded-lg w-full"
              />
            </div>
          )}
          <div className="flex items-center justify-between mt-3 lg:mt-4 gap-2 w-full">
            <label className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800 flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
              <svg className="w-5 h-5 lg:w-6 lg:h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs lg:text-sm hidden sm:inline">Add Photo</span>
            </label>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 lg:px-6 py-1.5 lg:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition disabled:opacity-50 text-sm lg:text-base flex-shrink-0"
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
