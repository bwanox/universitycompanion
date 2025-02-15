"use client";

import React from 'react';
import usePosts from '../hooks/usePosts';
import PostCard from './PostCard';
import PostCreation from './PostCreation';

const CommunityFeed = () => {
  const posts = usePosts();

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-800/30 shadow-2xl">
      <h2 className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold mb-6">
        Community Feed
      </h2>
      <PostCreation />
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;
