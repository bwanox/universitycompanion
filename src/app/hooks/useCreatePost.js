// hooks/useCreatePost.js
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../auth/firebaseConfig';

const useCreatePost = () => {
  const [isUploading, setIsUploading] = useState(false);

  const createPost = async ({ user, content, image }) => {
    // Require at least some text or an image
    if (!content.trim() && !image) return;

    setIsUploading(true);
    try {
      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'posts'), {
        content,
        imageUrl,
        author: user.displayName || user.email,
        authorPhotoURL: user.photoURL || '', // Tie the post to the user's profile picture
        userId: user.uid, // Unique identifier for the user who created the post
        likes: [],
        comments: [],
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setIsUploading(false);
  };

  return { createPost, isUploading };
};

export default useCreatePost;
