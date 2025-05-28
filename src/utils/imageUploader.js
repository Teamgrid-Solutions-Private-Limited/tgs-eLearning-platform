/**
 * Utility functions for handling image uploads
 */

// Default list of sample images for demo purposes
const sampleImages = [
  "https://picsum.photos/800/400?random=1",
  "https://picsum.photos/800/400?random=2",
  "https://picsum.photos/800/400?random=3",
  "https://picsum.photos/800/400?random=4",
  "https://picsum.photos/800/400?random=5",
];

/**
 * Handle file selection for image upload
 * @param {Event} event - The file input change event
 * @returns {Promise<string>} - A promise that resolves to the image data URL
 */
export const handleImageSelection = (event) => {
  return new Promise((resolve, reject) => {
    const file = event.target.files[0];

    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    // Check if file is an image
    if (!file.type.match("image.*")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Get a random sample image URL
 * @returns {string} - A sample image URL
 */
export const getRandomSampleImage = () => {
  const randomIndex = Math.floor(Math.random() * sampleImages.length);
  return sampleImages[randomIndex];
};

/**
 * Simulate an image upload to a server
 * In a real app, this would be an actual API call
 * @param {string} imageDataUrl - The image data URL to upload
 * @returns {Promise<string>} - A promise that resolves to the "uploaded" image URL
 */
export const uploadImage = (imageDataUrl) => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // In a real implementation, this would be the URL returned from the server
      resolve(imageDataUrl);
    }, 1000);
  });
};

export default {
  handleImageSelection,
  getRandomSampleImage,
  uploadImage,
};
