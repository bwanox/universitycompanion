"use client";

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import usePostActions from '../hooks/usePostActions';
import { formatDistanceToNow } from 'date-fns';
import LoginPromptModal from './LoginPromptModal';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid));
  const { toggleLike, addComment, isProcessing } = usePostActions(post.id);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleLike = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    await toggleLike(user, isLiked);
    setIsLiked(!isLiked);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      setShowLoginPrompt(true);
      return;
    }
    await addComment(user, newComment);
    setNewComment('');
  };

  return (
    <>
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        {/* Post Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {post.authorPhotoURL ? (
              <img
                src={post.authorPhotoURL}
                alt="avatar"
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                <span className="text-lg font-semibold text-gray-700">
                  {post.author[0]}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-gray-800 font-medium">{post.author}</h3>
              {post.createdAt && (
                <p className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          <div className="text-gray-500 cursor-pointer hover:text-gray-700">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-4">
          <p className="text-gray-700">{post.content}</p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post content"
              className="mt-4 w-full max-h-96 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-4 border-t pt-2">
          <button
            onClick={handleLike}
            disabled={isProcessing}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : 'fill-none'}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{post.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            <form onSubmit={handleComment} className="flex items-center space-x-2 mb-4">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
              >
                Post
              </button>
            </form>
            <div className="space-y-3">
              {post.comments?.map((comment, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {comment.author[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-gray-800 text-sm font-medium">{comment.author}</h4>
                    <p className="text-gray-600 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <LoginPromptModal show={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
};

export default PostCard;
