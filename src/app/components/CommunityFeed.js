"use client";

import React from 'react';
import usePosts from '../hooks/usePosts';
import PostCard from './PostCard';
import PostCreation from './PostCreation';

const CommunityFeed = () => {
  const posts = usePosts();

  return (
    <div className="relative bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-purple-400/20 shadow-xl lg:shadow-2xl shadow-purple-500/10 overflow-hidden w-full max-w-full">
      {/* Animated background orbs - Hidden on mobile */}
      <div className="hidden lg:block absolute -top-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="hidden lg:block absolute -bottom-20 -left-20 w-64 h-64 bg-violet-400/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="relative w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-8 w-full">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center shadow-lg lg:shadow-xl hover:rotate-12 transition-all duration-500 flex-shrink-0">
              <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl lg:text-4xl font-black bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent truncate">
                Community Feed
              </h2>
              <p className="hidden lg:block text-sm text-purple-200/70 font-bold truncate">Share ideas, ask questions, help others</p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-1.5 lg:py-2.5 rounded-full bg-gradient-to-r from-lime-500/20 to-green-500/20 border border-lime-400/30 hover:scale-105 transition-all duration-500 flex-shrink-0">
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-lime-400 animate-pulse shadow-lg shadow-lime-400/50"></div>
            <span className="text-xs lg:text-sm font-black text-lime-200">Live</span>
          </div>
        </div>
        
        {/* Post Creation */}
        <div className="mb-4 lg:mb-8 w-full">
          <PostCreation />
        </div>
        
        {/* Posts */}
        <div className="space-y-3 lg:space-y-6 w-full">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
