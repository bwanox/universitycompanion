import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';

const usePosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      // Sort posts by creation date (newest first)
      setPosts(postsData.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => unsubscribe();
  }, []);

  return posts;
};

export default usePosts;
