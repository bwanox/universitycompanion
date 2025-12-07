"use client";

import React from 'react';
import usePosts from '../hooks/usePosts';
import PostCard from './PostCard';
import PostCreation from './PostCreation';

const CommunityFeed = () => {
  const posts = usePosts();

  return (
    <div className="relative bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/20 shadow-2xl shadow-purple-500/10 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-400/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center shadow-xl hover:rotate-12 transition-all duration-500">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                Community Feed
              </h2>
              <p className="text-sm text-purple-200/70 font-bold">Share ideas, ask questions, help others</p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-lime-500/20 to-green-500/20 border border-lime-400/30 hover:scale-105 transition-all duration-500">
            <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse shadow-lg shadow-lime-400/50"></div>
            <span className="text-sm font-black text-lime-200">Live</span>
          </div>
        </div>
        
        {/* Post Creation */}
        <div className="mb-8">
          <PostCreation />
        </div>
        
        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
