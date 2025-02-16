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
      let imageBase64Original = ''; // Original image under 1MB
      let imageInfo = ''; // This will store OCR extracted text from the image.

      if (image) {
        let processedImage = image;

        // Check if image is greater than 1MB
        if (image.size > 1024 * 1024) {
          let options = {
            maxSizeMB: 0.7, // Start with 0.7MB to ensure it gets under 1MB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          processedImage = await imageCompression(image, options);

          // If still greater than 1MB, try a lower size
          if (processedImage.size > 1024 * 1024) {
            options.maxSizeMB = 0.5; // Reduce further
            processedImage = await imageCompression(image, options);
          }
        }

        // Convert the processed image to Base64
        imageBase64 = await convertFileToBase64(processedImage);

        // Save the original image under 1MB
        imageBase64Original = await convertFileToBase64(image);

        // Perform OCR on the processed image
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

      // Save post to Firestore
      await addDoc(collection(db, 'posts'), {
        content,
        imageBase64,         // Compressed image (under 1MB)
        imageBase64Original, // Original image (under 1MB)
        imageInfo,           // OCR extracted text from the image
        author: user.username || user.email,
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
