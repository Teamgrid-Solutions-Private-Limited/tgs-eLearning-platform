// API Base URL - change this to your actual backend URL when deployed
const API_BASE_URL = 'http://localhost:3001/api';

// Generic fetch function with error handling
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// SCORM Packages API
const scormApi = {
  // Get all SCORM packages
  getAllPackages: async () => {
    // Fallback to localStorage if API is not available
    try {
      return await fetchWithErrorHandling(`${API_BASE_URL}/scorm-packages`);
    } catch (error) {
      console.warn('Using localStorage fallback for SCORM packages:', error);
      // Retrieve from localStorage as fallback
      const storedPackages = localStorage.getItem('scormPackages');
      return storedPackages ? JSON.parse(storedPackages) : [];
    }
  },

  // Get a specific SCORM package by ID
  getPackageById: async (id) => {
    try {
      return await fetchWithErrorHandling(`${API_BASE_URL}/scorm-packages/${id}`);
    } catch (error) {
      console.warn('Using localStorage fallback for SCORM package:', error);
      // Retrieve from localStorage as fallback
      const storedPackages = localStorage.getItem('scormPackages');
      if (storedPackages) {
        const packages = JSON.parse(storedPackages);
        return packages.find(pkg => pkg._id === id) || null;
      }
      return null;
    }
  },

  // Upload a new SCORM package (with FormData for file handling)
  uploadPackage: async (formData) => {
    try {
      return await fetch(`${API_BASE_URL}/scorm-packages/upload`, {
        method: 'POST',
        body: formData, // FormData for file upload
        // No Content-Type header here as it will be set automatically with FormData
      }).then(response => {
        if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
        return response.json();
      });
    } catch (error) {
      console.error('Error uploading SCORM package:', error);
      throw error;
    }
  },

  // Delete a SCORM package
  deletePackage: async (id) => {
    try {
      await fetchWithErrorHandling(`${API_BASE_URL}/scorm-packages/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.warn('Using localStorage fallback for deleting SCORM package:', error);
      // Delete from localStorage as fallback
      const storedPackages = localStorage.getItem('scormPackages');
      if (storedPackages) {
        const packages = JSON.parse(storedPackages);
        const updatedPackages = packages.filter(pkg => pkg._id !== id);
        localStorage.setItem('scormPackages', JSON.stringify(updatedPackages));
        return true;
      }
      return false;
    }
  },

  // Update progress for a SCORM package
  updateProgress: async (id, userId, progressData) => {
    try {
      return await fetchWithErrorHandling(`${API_BASE_URL}/scorm-packages/${id}/progress`, {
        method: 'POST',
        body: JSON.stringify({ userId, ...progressData }),
      });
    } catch (error) {
      console.warn('Using localStorage fallback for updating progress:', error);
      // Update progress in localStorage as fallback
      const key = `scorm_progress_${userId}_${id}`;
      localStorage.setItem(key, JSON.stringify({
        ...progressData,
        lastUpdated: new Date().toISOString()
      }));
      return progressData;
    }
  },

  // Get user progress for a SCORM package
  getProgress: async (id, userId) => {
    try {
      return await fetchWithErrorHandling(`${API_BASE_URL}/scorm-packages/${id}/progress/${userId}`);
    } catch (error) {
      console.warn('Using localStorage fallback for getting progress:', error);
      // Get progress from localStorage as fallback
      const key = `scorm_progress_${userId}_${id}`;
      const storedProgress = localStorage.getItem(key);
      return storedProgress ? JSON.parse(storedProgress) : { progress: 0, testCompleted: false, testScore: 0 };
    }
  }
};

// Courses API (for custom created courses)
const coursesApi = {
  // Get all courses
  getAllCourses: async () => {
    try {
      return await fetchWithErrorHandling(`${API_BASE_URL}/courses`);
    } catch (error) {
      console.warn('Using localStorage fallback for courses:', error);
      // Retrieve from localStorage as fallback
      const storedCourses = localStorage.getItem('courses');
      return storedCourses ? JSON.parse(storedCourses) : [];
    }
  },

  // Get a specific course by ID
  getCourseById: async (id) => {
    try {
      return await fetchWithErrorHandling(`${API_BASE_URL}/courses/${id}`);
    } catch (error) {
      console.warn('Using localStorage fallback for course:', error);
      // Retrieve from localStorage as fallback
      const storedCourses = localStorage.getItem('courses');
      if (storedCourses) {
        const courses = JSON.parse(storedCourses);
        return courses.find(course => course._id === id) || null;
      }
      return null;
    }
  },

  // Create a new course
  createCourse: async (courseData) => {
    try {
      return await fetchWithErrorHandling(`${API_BASE_URL}/courses`, {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
    } catch (error) {
      console.warn('Using localStorage fallback for creating course:', error);
      // Store in localStorage as fallback
      const storedCourses = localStorage.getItem('courses');
      const courses = storedCourses ? JSON.parse(storedCourses) : [];
      const newCourse = {
        ...courseData,
        _id: `course-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      courses.push(newCourse);
      localStorage.setItem('courses', JSON.stringify(courses));
      return newCourse;
    }
  },

  // Delete a course
  deleteCourse: async (id) => {
    try {
      await fetchWithErrorHandling(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.warn('Using localStorage fallback for deleting course:', error);
      // Delete from localStorage as fallback
      const storedCourses = localStorage.getItem('courses');
      if (storedCourses) {
        const courses = JSON.parse(storedCourses);
        const updatedCourses = courses.filter(course => course._id !== id);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        return true;
      }
      return false;
    }
  }
};

// Export all APIs
export { scormApi, coursesApi }; 