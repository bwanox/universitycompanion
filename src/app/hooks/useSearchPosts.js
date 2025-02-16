
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';

const useSearchPosts = (searchTerm) => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen for changes in the posts collection.
  useEffect(() => {
    const postsQuery = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = [];
      snapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setAllPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter posts based on searchTerm.
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(allPosts);
      return;
    }
    const lowerCaseTerm = searchTerm.toLowerCase();
    const results = allPosts.filter((post) => {
      const contentMatch =
        post.content && post.content.toLowerCase().includes(lowerCaseTerm);
      const imageInfoMatch =
        post.imageInfo && post.imageInfo.toLowerCase().includes(lowerCaseTerm);
      return contentMatch || imageInfoMatch;
    });
    setFilteredPosts(results);
  }, [searchTerm, allPosts]);

  return { posts: filteredPosts, loading };
};

export default useSearchPosts;
