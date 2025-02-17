"use client";

import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import usePostActions from "../hooks/usePostActions";
import { formatDistanceToNow } from "date-fns";
import LoginPromptModal from "./LoginPromptModal";
import { useUserById } from "../hooks/useUserById";
import NeonLoader from "./NeonLoader";

// A component to render an individual comment with the user fetched by UID
const CommentItem = ({ comment }) => {
  const { user: commentUser, loading } = useUserById(comment.userId);
  
  // If the comment user is still loading, show the Neon Loader.
  if (loading) {
    return (
      <div className="flex justify-center items-center py-2">
        <NeonLoader />
      </div>
    );
  }

  const username = commentUser ? commentUser.username : comment.author;

  return (
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-700">
          {username && username[0]}
        </span>
      </div>
      <div className="bg-gray-100 rounded-xl p-3 shadow-sm">
        <h4 className="text-gray-800 text-sm font-medium">{username}</h4>
        <p className="text-gray-600 text-sm">{comment.content}</p>
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid));
  const { toggleLike, addComment, isProcessing } = usePostActions(post.id);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalPosition, setImageModalPosition] = useState({
    top: 0,
    left: 0,
  });

  // Fetch post author data using the UID from your post document (assumes post.userId exists)
  const { user: postAuthor, loading: postAuthorLoading } = useUserById(post.userId);

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
    // Ensure your addComment function stores comment.userId = user.uid
    await addComment(user, newComment);
    setNewComment("");
  };

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    setImageModalPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setShowImageModal(true);
  };

  // Until the post author's data is loaded, display the Neon Loader.
  if (postAuthorLoading) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 flex justify-center items-center">
        <NeonLoader />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 hover:shadow-2xl transition-shadow duration-300">
        {/* Post Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {postAuthor && postAuthor.photoURL ? (
              <img
                src={postAuthor.photoURL}
                alt="avatar"
                className="w-12 h-12 rounded-full mr-4 border-2 border-blue-500"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                <span className="text-xl font-semibold text-gray-700">
                  {postAuthor && postAuthor.username ? postAuthor.username[0] : "U"}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg text-gray-800 font-bold">
                {postAuthor?.username || "Unknown"}
              </h3>
              {post.createdAt && (
                <p className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
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
          <p className="text-gray-700 text-base mb-4">{post.content}</p>
          {(post.imageUrl || post.imageBase64) && (
            <img
              src={post.imageUrl || post.imageBase64}
              alt="Post content"
              className="w-full max-h-96 object-cover rounded-xl shadow-md hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              onClick={handleImageClick}
            />
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-6 border-t pt-4">
          <button
            onClick={handleLike}
            disabled={isProcessing}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              className={`w-6 h-6 ${isLiked ? "fill-blue-600" : "fill-none"} stroke-current`}
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="mt-6 border-t pt-4">
            <form onSubmit={handleComment} className="flex items-center space-x-3 mb-4">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-800"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
              >
                Post
              </button>
            </form>
            <div className="space-y-4">
              {post.comments?.map((comment, index) => (
                <CommentItem key={index} comment={comment} />
              ))}
            </div>
          </div>
        )}
      </div>
      <LoginPromptModal show={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed bg-black bg-opacity-75 z-50"
          style={{
            top: imageModalPosition.top,
            left: imageModalPosition.left,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-0 right-0 m-4 text-white text-2xl"
            >
              &times;
            </button>
            <img
              src={post.imageUrl || post.imageBase64}
              alt="Post content"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
