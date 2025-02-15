import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';

const usePostActions = (postId) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleLike = async (user, isLiked) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
    setIsProcessing(false);
  };

  const addComment = async (user, commentContent) => {
    if (!user || !commentContent.trim()) return;
    setIsProcessing(true);
    try {
      const comment = {
        content: commentContent,
        author: user.displayName || user.email,
        userId: user.uid,
        createdAt: new Date(),
      };
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment),
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setIsProcessing(false);
  };

  return { toggleLike, addComment, isProcessing };
};

export default usePostActions;
