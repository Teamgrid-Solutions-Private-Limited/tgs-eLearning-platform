import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ScormPlayer.css';
import { scormApi, coursesApi } from '../services/api';

// Same sample content as in ScormPackagesList
const initialPackages = {
  '1': {
    title: 'Introduction to SCORM Standards',
    description: 'Learn the basics of SCORM standards and how they work in e-learning environments.',
    uploadDate: new Date('2025-05-10').toISOString(),
    filePath: '/sample/intro-scorm'
  },
  '2': {
    title: 'Advanced JavaScript for E-Learning',
    description: 'Master JavaScript techniques for creating interactive SCORM content and measuring learner progress.',
    uploadDate: new Date('2025-05-12').toISOString(),
    filePath: '/sample/advanced-js'
  },
  '3': {
    title: 'Responsive Design for E-Learning',
    description: 'Learn how to create SCORM courses that look great on any device - from desktop to mobile.',
    uploadDate: new Date('2025-05-14').toISOString(),
    filePath: '/sample/responsive-design'
  },
  '4': {
    title: 'Creating Assessments in SCORM',
    description: 'Design effective quizzes, tests, and other assessments in your SCORM packages.',
    uploadDate: new Date('2025-05-15').toISOString(),
    filePath: '/sample/assessments'
  }
};

// Update the sample data to be available as a demo course
const demoCourse = {
  _id: 'demo-course',
  title: 'Demo Course',
  description: 'This is a sample course that demonstrates the SCORM player functionality.',
  uploadDate: new Date().toISOString(),
  instructor: 'Demo Instructor',
  duration: '1h 30min',
  progress: 0,
  files: [
    {
      name: 'index.html',
      type: 'html',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Demo Course</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; }
            h2 { color: #4b5563; margin-top: 30px; }
            p { margin-bottom: 16px; }
            .section { margin-bottom: 40px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 20px; }
            .btn:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <h1>Welcome to the Demo Course</h1>
          
          <div class="section">
            <h2>Course Overview</h2>
            <p>This is a sample course to demonstrate how the SCORM player works. In a real course, this content would be created using a SCORM authoring tool.</p>
            <p>The SCORM player allows you to navigate through course content, track progress, and take assessments.</p>
          </div>
          
          <div class="section">
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand how the SCORM player works</li>
              <li>Learn about the different features of the platform</li>
              <li>Explore how content is displayed</li>
              <li>See how progress tracking works</li>
            </ul>
          </div>
          
          <div class="section">
            <h2>Course Content</h2>
            <p>In a real SCORM package, you would have multiple pages of content, interactive elements, videos, and assessments.</p>
            <p>The SCORM player allows you to navigate between these elements and tracks your progress as you complete the course.</p>
          </div>
          
          <a href="#" class="btn" onclick="window.parent.postMessage({type: 'complete-demo'}, '*')">Mark as Complete</a>
        </body>
        </html>
      `
    }
  ]
};

const ScormPlayer = () => {
  const { id: rawId } = useParams();
  const navigate = useNavigate();
  // Clean and normalize the ID parameter
  const id = rawId ? rawId.replace(/[^\w-]/g, '') : 'demo-course';
  
  console.log("Course ID from URL parameter:", rawId);
  console.log("Normalized course ID:", id);
  
  const [scormPackage, setScormPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedFile, setSelectedFile] = useState(null);
  const [nestedContent, setNestedContent] = useState(false);
  const [packageStructure, setPackageStructure] = useState(null);
  const [packageTab, setPackageTab] = useState('files');
  const [hasNestedZip, setHasNestedZip] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const userId = 'testUser123'; // In a real app, this would come from authentication

  // Add loading timeout effect
  useEffect(() => {
    // Set a timeout to exit loading state if it takes too long
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached - showing demo content");
        setLoading(false);
        setScormPackage(demoCourse);
      }
    }, 2000); // 2 seconds timeout
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Add useEffect to activate test tab when progress becomes 100
  useEffect(() => {
    if (progress >= 100) {
      console.log("Progress is 100%, test tab should be visible");
    }
  }, [progress]);

  useEffect(() => {
    const fetchPackageAndProgress = async () => {
      setLoading(true);
      try {
        console.log("Attempting to load course with ID:", id);
        
        // Always initialize with the demo course as a fallback
        let packageData = JSON.parse(JSON.stringify(demoCourse)); // Make a copy of the demo course
        let progressData = null;
        
        try {
          // Try to get the package from the SCORM API
          packageData = await scormApi.getPackageById(id);
          console.log("API response for package:", packageData ? "Found" : "Not found");
          
          if (packageData) {
            // If we found it as a SCORM package, get the progress
            progressData = await scormApi.getProgress(id, userId);
            
            // Make sure file content is loaded
            if (packageData.files && packageData.files.length > 0) {
              // Check if HTML content is missing
              const htmlFiles = packageData.files.filter(f => 
                f.type === 'html' || f.name.endsWith('.html') || f.name.endsWith('.htm')
              );
              
              if (htmlFiles.length > 0 && !htmlFiles[0].content) {
                console.warn('HTML content not loaded, attempting to load from localStorage');
                
                // Try to load from localStorage as a fallback
                const storedPackages = localStorage.getItem('scormPackages');
                if (storedPackages) {
                  const packages = JSON.parse(storedPackages);
                  const storedPackage = packages.find(p => p._id === id);
                  
                  if (storedPackage && storedPackage.files) {
                    packageData.files = storedPackage.files;
                  }
                }
              }
            }
          } else {
            // If not a SCORM package, try the Courses API
            packageData = await coursesApi.getCourseById(id);
            console.log("API response for course:", packageData ? "Found" : "Not found");
          }
        } catch (apiError) {
          console.warn('API call failed, trying localStorage fallback:', apiError);
          
          // Try to get package from localStorage as fallback
          const storedPackages = localStorage.getItem('scormPackages');
          if (storedPackages) {
            console.log("Checking localStorage for packages");
            const allPackages = JSON.parse(storedPackages);
            
            // Try different ways to match the ID
            console.log("Looking for course with ID:", id);
            packageData = Array.isArray(allPackages) 
              ? allPackages.find(pkg => 
                  pkg._id === id || 
                  pkg._id?.toString() === id?.toString() ||
                  (id.startsWith('course-') && pkg._id === id.replace('course-', ''))
                )
              : allPackages[id];
              
            console.log("LocalStorage lookup result:", packageData ? "Found" : "Not found");  
          }
          
          // If not found, try initialPackages
          if (!packageData && initialPackages[id]) {
            console.log("Using initial package data");
            packageData = initialPackages[id];
          }
          
          // If still not found, check for courses with more flexible ID matching
          if (!packageData) {
            const storedCourses = localStorage.getItem('courses');
            if (storedCourses) {
              console.log("Checking localStorage for courses");
              const courses = JSON.parse(storedCourses);
              
              // Try different ways to match course IDs
              const course = courses.find(c => 
                c._id === id || 
                c._id?.toString() === id?.toString() ||
                (id.startsWith('course-') && c._id === id.substr(7)) || // Remove 'course-' prefix
                (c._id?.startsWith('course-') && c._id.substr(7) === id) // Course has prefix, ID doesn't
              );
              
              console.log("Course lookup result:", course ? "Found" : "Not found");
              
              if (course) {
                packageData = {
                  _id: course._id,
                  title: course.title,
                  description: course.description,
                  isCustomCourse: true,
                  coverImage: course.coverImage
                };
              }
            }
          }
          
          // Last resort - check if this is a new ID format with timestamp
          if (!packageData && id.includes('-')) {
            console.log("Attempting to find course by parsing complex ID");
            // This might be a course with a complex ID like "course-1234567890123-abc123"
            const storedPackages = localStorage.getItem('scormPackages');
            if (storedPackages) {
              const allPackages = JSON.parse(storedPackages);
              
              if (Array.isArray(allPackages)) {
                // Try to match just by prefix "course-"
                packageData = allPackages.find(pkg => 
                  (pkg._id && id.startsWith('course-') && pkg._id.startsWith('course-'))
                );
                
                if (!packageData) {
                  // If still not found, just use the first course for demo purposes
                  console.log("Using first available course as fallback");
                  packageData = allPackages[0];
                }
              }
            }
          }
          
          // Get progress from localStorage
          if (packageData) {
            const key = `scorm_progress_${userId}_${id}`;
            const storedProgress = localStorage.getItem(key);
            if (storedProgress) {
              progressData = JSON.parse(storedProgress);
            }
          }
        }
        
        if (packageData) {
          setScormPackage(packageData);
          
          // Process package data
          if (packageData.nestedZipInfo && packageData.nestedZipInfo.hasNestedZips) {
            setHasNestedZip(true);
          }
          
          if (packageData.manifestDir && packageData.manifestDir.length > 0) {
            setNestedContent(true);
          }
          
          if (packageData.fileStructure) {
            setPackageStructure(packageData.fileStructure);
          }
          
          // Set selected file
          if (packageData.mainFile) {
            setSelectedFile(packageData.mainFile);
          } else if (packageData.files && packageData.files.length > 0) {
            const htmlFile = packageData.files.find(f => 
              f.type === 'html' || f.name.endsWith('.html') || f.name.endsWith('.htm')
            );
            if (htmlFile) {
              setSelectedFile(htmlFile.name);
            } else {
              // If no HTML file found, set it to the first file
              setSelectedFile(packageData.files[0].name);
            }
          } else {
            // If no files at all, set to demo course's index.html
            setSelectedFile('index.html');
          }
          
          // Set progress
          if (progressData) {
            setProgress(progressData.progress || 0);
            setTestCompleted(progressData.testCompleted || false);
            setTestScore(progressData.testScore || 0);
          } else {
            // Random progress for demo
            setProgress(Math.floor(Math.random() * 60));
          }
          
          console.log('Package data loaded:', packageData);
          if (packageData && packageData.files) {
            console.log('Number of files:', packageData.files.length);
            const htmlFiles = packageData.files.filter(f => 
              f.type === 'html' || f.name.endsWith('.html') || f.name.endsWith('.htm')
            );
            
            console.log('HTML files found:', htmlFiles.length);
            htmlFiles.forEach((file, index) => {
              console.log(`HTML file ${index + 1}:`, file.name);
              console.log(`HTML content available:`, !!file.content);
              
              if (file.content) {
                console.log(`HTML content length:`, file.content.length);
                console.log(`HTML content preview:`, file.content.substring(0, 100) + '...');
              }
            });
            
            if (selectedFile) {
              console.log('Selected file:', selectedFile);
              const selectedFileObj = packageData.files.find(f => f.name === selectedFile);
              console.log('Selected file found:', !!selectedFileObj);
              if (selectedFileObj) {
                console.log('Selected file content available:', !!selectedFileObj.content);
              }
            }
          }
          
          setError(null);
        } else {
          console.log("No course found, using demo course instead");
          packageData = demoCourse;
          
          // Set the demo course in localStorage for future reference
          try {
            const storedPackages = localStorage.getItem('scormPackages');
            let packages = storedPackages ? JSON.parse(storedPackages) : [];
            if (!Array.isArray(packages)) packages = [];
            
            // Check if demo course already exists
            if (!packages.some(p => p._id === 'demo-course')) {
              packages.push(demoCourse);
              localStorage.setItem('scormPackages', JSON.stringify(packages));
              console.log("Demo course added to localStorage");
            }
          } catch (err) {
            console.error("Error saving demo course to localStorage:", err);
          }
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        console.log('Using demo course as fallback');
        // Use the already initialized packageData (demo course)
      } finally {
        // Ensure we always have a valid package to display
        if (!packageData || !packageData._id) {
          console.warn('No valid package found, using demo course');
          packageData = JSON.parse(JSON.stringify(demoCourse));
        }
        
        console.log('Final package to display:', packageData);
        setScormPackage(packageData);
        
        // Process package data only if it's valid
        if (packageData) {
          if (packageData.nestedZipInfo && packageData.nestedZipInfo.hasNestedZips) {
            setHasNestedZip(true);
          }
          
          if (packageData.manifestDir && packageData.manifestDir.length > 0) {
            setNestedContent(true);
          }
          
          if (packageData.fileStructure) {
            setPackageStructure(packageData.fileStructure);
          }
          
          // Set selected file
          if (packageData.mainFile) {
            setSelectedFile(packageData.mainFile);
          } else if (packageData.files && packageData.files.length > 0) {
            const htmlFile = packageData.files.find(f => 
              f.type === 'html' || f.name.endsWith('.html') || f.name.endsWith('.htm')
            );
            if (htmlFile) {
              setSelectedFile(htmlFile.name);
            } else {
              // If no HTML file found, set it to the first file
              setSelectedFile(packageData.files[0].name);
            }
          } else {
            // If no files at all, set to demo course's index.html
            setSelectedFile('index.html');
          }
          
          // Set progress
          if (progressData) {
            setProgress(progressData.progress || 0);
            setTestCompleted(progressData.testCompleted || false);
            setTestScore(progressData.testScore || 0);
          } else {
            // Random progress for demo
            setProgress(Math.floor(Math.random() * 60));
          }
        }
        
        setLoading(false);
        setError(null); // Always clear error since we're showing content
      }
    };

    fetchPackageAndProgress();
  }, [id, userId]);

  // Save progress to API
  const saveProgress = async (newProgress) => {
    try {
      const progressData = {
        lessonStatus: newProgress === 100 ? 'completed' : 'incomplete',
        progress: newProgress,
        testCompleted: testCompleted,
        testScore: testScore,
        lastUpdated: new Date().toISOString()
      };
      
      await scormApi.updateProgress(id, userId, progressData);
    } catch (error) {
      console.error('Error saving progress:', error);
      // Fallback to localStorage
      const key = `scorm_progress_${userId}_${id}`;
      localStorage.setItem(key, JSON.stringify({
        lessonStatus: newProgress === 100 ? 'completed' : 'incomplete',
        progress: newProgress,
        testCompleted: testCompleted,
        testScore: testScore,
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement || 
        document.mozFullScreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const refreshContent = () => {
    // For demo, just update progress
    const newProgress = Math.min(progress + 10, 100);
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const handleCompleteDemo = () => {
    console.log("Completing demo course");
    const newProgress = 100;
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const handleTestSubmit = () => {
    // Calculate test score based on answers
    const questions = mcqQuestions;
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    setTestScore(score);
    setTestCompleted(true);
    
    // Save progress with test results
    saveProgress(progress);
  };
  
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleFileSelect = (fileName) => {
    setSelectedFile(fileName);
    // If user selects a file, switch to content tab to show it
    setActiveTab('content');
  };
  
  // Get nested directory structure from a path
  const getNestedDirectoryObject = (structure, path) => {
    if (!path || path === '') return structure;
    
    const parts = path.split('/').filter(p => p !== '');
    let current = structure;
    
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        return null; // Path not found
      }
    }
    
    return current;
  };
  
  // Render file structure recursively
  const renderFileTree = (structure, path = '') => {
    if (!structure) return null;
    
    // If this is a nested SCORM package and we're at the root level,
    // try to navigate to the manifest directory first
    let directoryToRender = structure;
    if (nestedContent && path === '' && scormPackage?.manifestDir) {
      // Remove trailing slash if any
      const dirPath = scormPackage.manifestDir.endsWith('/') 
        ? scormPackage.manifestDir.slice(0, -1) 
        : scormPackage.manifestDir;
      
      if (dirPath) {
        const nestedDir = getNestedDirectoryObject(structure, dirPath);
        if (nestedDir) {
          directoryToRender = nestedDir;
          path = dirPath;
        }
      }
    }
    
    return (
      <ul className="file-tree">
        {Object.keys(directoryToRender).map(key => {
          const fullPath = path ? `${path}/${key}` : key;
          
          if (directoryToRender[key] === null) {
            // This is a file
            return (
              <li key={fullPath} className="file-item">
                <button 
                  className={`file-button ${selectedFile === fullPath ? 'active' : ''}`}
                  onClick={() => handleFileSelect(fullPath)}
                >
                  <span className="file-icon">
                    {key.endsWith('.html') || key.endsWith('.htm') 
                      ? '🌐' 
                      : key.endsWith('.css') 
                        ? '🎨' 
                        : key.endsWith('.js') 
                          ? '📜' 
                          : key.endsWith('.jpg') || key.endsWith('.png') || key.endsWith('.gif') 
                            ? '🖼️' 
                            : key.endsWith('.xml')
                              ? '📝'
                              : key.endsWith('.zip')
                                ? '📦'
                                : '📄'}
                  </span>
                  {key}
                </button>
              </li>
            );
          } else {
            // This is a directory
            return (
              <li key={fullPath} className="directory-item">
                <div className="directory-name">
                  <span className="folder-icon">📁</span>
                  {key}
                </div>
                {renderFileTree(directoryToRender[key], fullPath)}
              </li>
            );
          }
        })}
      </ul>
    );
  };

  // Add this function for iframe-based content display
  const createIframeContent = (html) => {
    const srcDoc = html;
    
    // Create a blob URL for the HTML content
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return (
      <iframe
        ref={iframeRef}
        className="scorm-iframe"
        src={url}
        title="SCORM Content"
        sandbox="allow-same-origin allow-scripts allow-forms"
        onLoad={() => {
          // Clean up the URL object when the iframe loads
          URL.revokeObjectURL(url);
        }}
      />
    );
  };

  // Update the getSelectedFileContent function to handle the demo course
  const getSelectedFileContent = () => {
    if (!scormPackage?.files || !selectedFile) {
      // Return demo content when no file is selected
      return createIframeContent(demoCourse.files[0].content);
    }
    
    // Find the selected file in the package files
    const file = scormPackage.files?.find(f => f.name === selectedFile);
    
    if (!file) {
      // Return demo content when file can't be found
      return createIframeContent(demoCourse.files[0].content);
    }
    
    // For HTML files, return actual content if available
    if (file.content && (file.type === 'html' || file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      // Use iframe for HTML content to prevent styling conflicts
      return createIframeContent(file.content);
    }
    
    // For image files, display them
    if (file.name.match(/\.(jpeg|jpg|gif|png)$/i)) {
      return (
        <div className="image-content-container">
          <img src={`data:image/${file.type};base64,${file.content}`} alt={file.name} />
        </div>
      );
    }
    
    // For text files
    if (file.content && file.name.match(/\.(txt|css|js|xml|json)$/i)) {
      return (
        <div className="text-content-container">
          <pre>{file.content}</pre>
        </div>
      );
    }
    
    // Otherwise return the demo content
    return createIframeContent(demoCourse.files[0].content);
  };

  // Render the tab navigation for the package explorer
  const renderPackageTabs = () => {
    return (

        hasNestedZip && (
          <button
            className={`package-tab ${packageTab === 'zip' ? 'active' : ''}`}
            onClick={() => setPackageTab('zip')}
          >
            Nested ZIP
          </button>
        )

    );
  };

  // Render the package files or nested zip info based on active tab
  const renderPackageContent = () => {
    if (packageTab === 'zip' && hasNestedZip) {
      return (
        <div className="nested-zip-details">
          <h3>Nested ZIP Information</h3>
          <div className="nested-zip-content">
            {scormPackage.nestedZipInfo.extractedNestedZip ? (
              <>
                <div className="zip-alert success">
                  <div className="zip-icon">✅</div>
                  <p><strong>Extracted successfully:</strong> {scormPackage.nestedZipInfo.extractedZipName}</p>
                </div>
                <p>The SCORM content from this nested ZIP has been extracted and is being displayed.</p>
                <ul className="nested-zip-files">
                  {scormPackage.nestedZipInfo.nestedZipFiles.map((zipFile, index) => (
                    <li key={index} className={zipFile === scormPackage.nestedZipInfo.extractedZipName ? 'active' : ''}>
                      <span className="file-icon">📦</span>
                      {zipFile}
                      {zipFile === scormPackage.nestedZipInfo.extractedZipName && <span className="active-indicator"> (active)</span>}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <div className="zip-alert warning">
                  <div className="zip-icon">⚠️</div>
                  <p><strong>Nested ZIPs detected but not extracted</strong></p>
                </div>
                <p>The following nested ZIP files were found but could not be automatically extracted:</p>
                <ul className="nested-zip-files">
                  {scormPackage.nestedZipInfo.nestedZipFiles.map((zipFile, index) => (
                    <li key={index}>
                      <span className="file-icon">📦</span>
                      {zipFile}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="file-explorer">
          <h3>Package Files</h3>
          {packageStructure ? (
            <>
              {nestedContent && (
                <div className="nested-content-info">
                  <p>Showing contents from {scormPackage.manifestDir || 'root directory'}</p>
                </div>
              )}
              {renderFileTree(packageStructure)}
            </>
          ) : (
            <div className="file-list">
              {scormPackage.files.map((file, index) => (
                <div 
                  key={index} 
                  className={`file-item ${selectedFile === file.name ? 'selected' : ''}`}
                  onClick={() => handleFileSelect(file.name)}
                >
                  <span className="file-icon">
                    {file.name.endsWith('.zip') ? '📦' : '📄'}
                  </span>
                  <span className="file-name">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  // MCQ test questions
  const mcqQuestions = [
    {
      question: "What does SCORM stand for?",
      options: [
        "Shared Content Object Reference Model",
        "Standard Course Online Reference Material",
        "System for Content and Organized Resource Management",
        "Structured Content Organization and Reuse Method"
      ],
      correctAnswer: 0
    },
    {
      question: "Which version of SCORM is most widely supported across LMS platforms?",
      options: [
        "SCORM 1.0",
        "SCORM 1.2",
        "SCORM 2004",
        "SCORM 3.0"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the main purpose of SCORM?",
      options: [
        "To create interactive animations",
        "To standardize how e-learning content and LMSs work together",
        "To replace traditional classroom learning",
        "To reduce the file size of learning content"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of the following is NOT typically included in a SCORM package?",
      options: [
        "imsmanifest.xml",
        "HTML content",
        "JavaScript files",
        "Live streaming video"
      ],
      correctAnswer: 3
    },
    {
      question: "How does a SCORM package track user progress?",
      options: [
        "By taking screenshots of the user's screen",
        "Through API calls between the content and the LMS",
        "By recording the user with their webcam",
        "It cannot track user progress"
      ],
      correctAnswer: 1
    }
  ];

  // Component to render the MCQ test
  const MCQTest = () => {
    return (
      <div className="mcq-test">
        <h2>Course Assessment</h2>
        {testCompleted ? (
          <div className="test-result">
            <div className="test-score-display">
              <div className="score-circle">
                <span className="score-number">{testScore}%</span>
              </div>
            </div>
            <h3>Test Completed</h3>
            <p>You scored {testScore}% on this assessment.</p>
            <p>{testScore >= 70 ? 'Congratulations! You passed the test.' : 'You did not pass the test. Please review the course material and try again.'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => setTestCompleted(false)}>
              Retake Test
            </button>
          </div>
        ) : (
          <div className="test-questions">
            <p className="test-instructions">Please answer all questions to complete the assessment.</p>
            {mcqQuestions.map((q, qIndex) => (
              <div key={qIndex} className="question-item">
                <h4 className="question-text">{qIndex + 1}. {q.question}</h4>
                <div className="answer-options">
                  {q.options.map((option, aIndex) => (
                    <label key={aIndex} className="answer-option">
                      <input 
                        type="radio" 
                        name={`question-${qIndex}`} 
                        checked={userAnswers[qIndex] === aIndex}
                        onChange={() => handleAnswerSelect(qIndex, aIndex)}
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="test-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleTestSubmit}
                disabled={Object.keys(userAnswers).length < mcqQuestions.length}
              >
                Submit Answers
              </button>
            </div>
            {/* {Object.keys(userAnswers).length < mcqQuestions.length && (
              <p className="answer-required-message">Please answer all questions before submitting.</p>
            )} */}
          </div>
        )}
      </div>
    );
  };

  // Add a debugging function to check progress type and value
  const debugProgress = () => {
    console.log("Progress value:", progress);
    console.log("Progress type:", typeof progress);
    console.log("Progress === 100:", progress === 100);
    console.log("Progress == 100:", progress == 100);
    console.log("parseInt(progress) === 100:", parseInt(progress) === 100);
    console.log("parseInt(progress) >= 100:", parseInt(progress) >= 100);
    
    // Force test tab to show
    setProgress(100);
    console.log("Progress set to 100");
  };

  // Function to directly show the test tab
  const showTestTab = () => {
    setProgress(100);
    setActiveTab('test');
    saveProgress(100);
    console.log("Test tab activated");
    return true; // Return true to indicate test tab should be shown
  };

  // Function to check if test tab should be shown
  const shouldShowTestTab = () => {
    return progress >= 100; // Show test tab when progress is 100%
  };

  // Add this in the useEffect section to listen for iframe messages
  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'complete-demo') {
        console.log("Received complete-demo message from iframe");
        handleCompleteDemo();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Always force show content regardless of loading state
  // If we're still loading, we'll just show a placeholder until the real content loads
  const actualScormPackage = scormPackage || demoCourse;
  const actualSelectedFile = selectedFile || 'index.html';
  
  return (
    <div className="player-container" ref={containerRef}>
      {/* Overlay loader that doesn't block content */}
      {loading && (
        <div className="overlay-loader">
          <div className="spinner"></div>
        </div>
      )}
    
      <header className="player-header">
        <div className="player-header-content">
          <button 
            className="back-button" 
            onClick={handleBackClick}
            aria-label="Back to dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="course-info">
            <h1>{actualScormPackage.title || 'Course'}</h1>
            <div className="course-meta">
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${progress >= 100 ? 'success' : ''}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progress}% complete</span>
              </div>
              
              {testCompleted && (
                <div className="test-score">
                  <span className="badge badge-success">Test Score: {testScore}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="player-content">
        <aside className={`player-sidebar ${nestedContent ? 'with-nav' : ''}`}>
          <div className="player-tabs">
            <button 
              className={`player-tab ${activeTab === 'content' ? 'active' : ''}`} 
              onClick={() => setActiveTab('content')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Content
            </button>
          </div>
        </aside>
        
        <main className="course-display">
          <div className="course-content">
            {actualScormPackage.files ? 
              getSelectedFileContent() : 
              createIframeContent(demoCourse.files[0].content)}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScormPlayer; 