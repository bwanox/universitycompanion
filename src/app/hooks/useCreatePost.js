
import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../auth/firebaseConfig';
import imageCompression from 'browser-image-compression';
import Tesseract from 'tesseract.js';

// Helper: Convert File/Blob to Base64 string.
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const useCreatePost = () => {
  const [isUploading, setIsUploading] = useState(false);

  const createPost = async ({ user, content, image }) => {
    // Ensure there's at least text or an image.
    if (!content.trim() && !image) return;

    setIsUploading(true);
    try {
      let imageBase64 = '';
      let imageInfo = ''; // This will store OCR extracted text from the image.

      if (image) {
        let processedImage = image;

        // If image is larger than 1MB, compress it.
        if (image.size > 1024 * 1024) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          processedImage = await imageCompression(image, options);
        }

        // Convert the (processed) image file to Base64.
        imageBase64 = await convertFileToBase64(processedImage);

        // Perform OCR on the processed image using Tesseract.js.
        try {
          const { data: { text } } = await Tesseract.recognize(processedImage, 'eng', {
            logger: (m) => console.log(m),
          });
          imageInfo = text;
        } catch (ocrError) {
          console.error('Error during OCR processing:', ocrError);
          imageInfo = '';
        }
      }

      // Save the post to Firestore, including the image Base64 data and OCR text.
      await addDoc(collection(db, 'posts'), {
        content,
        imageBase64,  // Base64-encoded image.
        imageInfo,    // OCR extracted text from the image.
        author: user.displayName || user.email,
        authorPhotoURL: user.photoURL || '',
        userId: user.uid,
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
