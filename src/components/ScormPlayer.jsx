import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

const ScormPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  // Add useEffect to activate test tab when progress becomes 100
  useEffect(() => {
    if (progress >= 100) {
      console.log("Progress is 100%, test tab should be visible");
    }
  }, [progress]);

  useEffect(() => {
    // Get user progress from localStorage if available
    const getStoredProgress = () => {
      try {
        const key = `scorm_progress_${userId}_${id}`;
        const storedProgress = localStorage.getItem(key);
        if (storedProgress) {
          const data = JSON.parse(storedProgress);
          setTestCompleted(data.testCompleted || false);
          setTestScore(data.testScore || 0);
          console.log("Loaded progress:", data.progress, "Test completed:", data.testCompleted);
          return data.progress || 0;
        }
      } catch (err) {
        console.error('Error reading progress:', err);
      }
      return Math.floor(Math.random() * 60); // Random progress for initial demo
    };

    // For demo, simulate loading
    const timer = setTimeout(() => {
      try {
        // Try to get package from localStorage
        const storedPackages = localStorage.getItem('scormPackages');
        let packageData;

        if (storedPackages) {
          const allPackages = JSON.parse(storedPackages);
          packageData = allPackages.find(pkg => pkg._id === id);
        }

        // If not found in localStorage, use initial data
        if (!packageData && initialPackages[id]) {
          packageData = initialPackages[id];
        }

        if (packageData) {
          if (packageData.isMediaBased) {
            console.log('Found media-based package:', packageData._id);
            console.log('Media files:', packageData.mediaFiles ? packageData.mediaFiles.length : 0);
            
            if (packageData.mediaFiles && packageData.mediaFiles.length > 0) {
              // Verify that objectURLs are valid
              const validURLs = packageData.mediaFiles.filter(file => {
                try {
                  // Test if the URL is still valid (won't throw an error)
                  return !!file.objectURL;
                } catch (err) {
                  console.error('Invalid objectURL for file:', file.name, err);
                  return false;
                }
              });
              
              console.log('Valid object URLs:', validURLs.length, 'of', packageData.mediaFiles.length);
              
              if (validURLs.length === 0) {
                // No valid URLs found, show an error
                packageData.mediaFilesError = true;
                console.error('No valid object URLs found in package. Browser may have cleared them.');
              }
            } else {
              console.error('Media-based package has no media files array or it\'s empty');
              packageData.mediaFilesError = true;
            }
          }
          setScormPackage(packageData);
          
          // Check if this is a media-based SCORM package
          if (packageData.isMediaBased) {
            console.log('This is a media-based SCORM package');
            
            // If there are media files, set the first one as selected
            if (packageData.mediaFiles && packageData.mediaFiles.length > 0) {
              setSelectedFile(packageData.mediaFiles[0].name);
              console.log(`Selected first media file: ${packageData.mediaFiles[0].name}`);
              setActiveTab('content'); // Make sure we're on the content tab
            }
          }
          // Check if this package has nested zip files
          else if (packageData.nestedZipInfo && packageData.nestedZipInfo.hasNestedZips) {
            setHasNestedZip(true);
            
            if (packageData.nestedZipInfo.extractedNestedZip) {
              console.log(`Using content from extracted nested ZIP: ${packageData.nestedZipInfo.extractedZipName}`);
            } else {
              console.log('Package has nested ZIPs but none were extracted');
            }
          }
          
          // Check if this is a nested SCORM package
          if (packageData.manifestDir && packageData.manifestDir.length > 0) {
            setNestedContent(true);
            console.log(`Detected nested SCORM content in: ${packageData.manifestDir}`);
          }
          
          // Analyze package structure
          if (packageData.fileStructure) {
            setPackageStructure(packageData.fileStructure);
          }
          
          // If the package has a main file and it's not a media-based package, set it as selected
          if (!packageData.isMediaBased) {
            if (packageData.mainFile && !selectedFile) {
              setSelectedFile(packageData.mainFile);
              console.log(`Setting main file to: ${packageData.mainFile}`);
            } else if (packageData.files && packageData.files.length > 0 && !selectedFile) {
              // Find any HTML file to display
              const htmlFile = packageData.files.find(f => 
                f.type === 'html' || f.name.endsWith('.html') || f.name.endsWith('.htm')
              );
              if (htmlFile) {
                setSelectedFile(htmlFile.name);
                console.log(`No main file defined, using: ${htmlFile.name}`);
              }
            }
          }
          
          setProgress(getStoredProgress());
          setError(null);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load SCORM package. Please try again later.');
        console.error('Error fetching package:', err);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [id, userId, selectedFile]);

  // Save progress to localStorage
  const saveProgress = (newProgress) => {
    try {
      const key = `scorm_progress_${userId}_${id}`;
      localStorage.setItem(key, JSON.stringify({
        lessonStatus: newProgress === 100 ? 'completed' : 'incomplete',
        progress: newProgress,
        testCompleted: testCompleted,
        testScore: testScore,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error saving progress:', err);
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

  // Get content to display for the selected file
  const getSelectedFileContent = () => {
    if (!scormPackage?.files || !selectedFile) return null;
    
    // Find the selected file in the package files
    const file = scormPackage.files.find(f => f.name === selectedFile);
    
    if (!file) return <div className="file-preview">File not available for preview</div>;
    
    if (file.name.endsWith('.zip')) {
      return (
        <div className="file-preview zip-preview">
          <div className="zip-alert">
            <div className="zip-icon">📦</div>
            <h3>ZIP File</h3>
            <p>This is a nested ZIP file that may contain SCORM content.</p>
            {file.fromNestedZip ? (
              <div className="nested-zip-info">
                <p>This file is part of the extracted nested ZIP: {file.nestedZipSource}</p>
              </div>
            ) : (
              <div className="nested-zip-actions">
                <p>Note: The system has already analyzed this ZIP for SCORM content.</p>
              </div>
            )}
          </div>
        </div>
      );
    } else if (file.type === 'html' && file.content) {
      // Create a safe preview of HTML content
      return (
        <div className="file-preview html-preview">
          <div dangerouslySetInnerHTML={{ __html: file.content }} />
          <div className="preview-note">
            This is a preview of the HTML content. View the full content in the Content tab.
          </div>
        </div>
      );
    } else if (file.type === 'css' || file.type === 'js' || file.type === 'txt' || file.type === 'xml') {
      return (
        <div className="file-preview code-preview">
          <pre>{file.content || 'Content not available for preview'}</pre>
        </div>
      );
    } else if (file.type === 'jpg' || file.type === 'jpeg' || file.type === 'png' || file.type === 'gif') {
      return (
        <div className="file-preview image-preview">
          <p>Image preview not available in this demo</p>
        </div>
      );
    } else {
      return (
        <div className="file-preview">
          <p>Preview not available for this file type ({file.type})</p>
        </div>
      );
    }
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
  };

  // Navigation function for media-based packages
  const navigateMedia = (direction) => {
    if (!scormPackage?.mediaFiles || !scormPackage.mediaFiles.length) {
      console.log('No media files to navigate');
      return;
    }
    
    const mediaFiles = scormPackage.mediaFiles;
    const currentIndex = mediaFiles.findIndex(file => file.name === selectedFile);
    
    if (currentIndex === -1) {
      console.log('Current file not found in media files');
      return;
    }
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex < mediaFiles.length - 1 ? currentIndex + 1 : currentIndex;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    }
    
    if (newIndex !== currentIndex) {
      setSelectedFile(mediaFiles[newIndex].name);
      console.log(`Navigated to ${direction}: ${mediaFiles[newIndex].name}`);
    }
    
    // Update progress based on position in the sequence
    const progress = Math.min(Math.round((newIndex + 1) / mediaFiles.length * 100), 100);
    setProgress(progress);
    saveProgress(progress);
  };

  // Helper function to find current media file
  const getCurrentMediaFile = () => {
    if (!scormPackage?.mediaFiles || !selectedFile) return null;
    return scormPackage.mediaFiles.find(f => f.name === selectedFile);
  };

  // Helper function to get current media index
  const getCurrentMediaIndex = () => {
    if (!scormPackage?.mediaFiles || !selectedFile) return -1;
    return scormPackage.mediaFiles.findIndex(f => f.name === selectedFile);
  };

  // For media-based packages, render the media player
  const renderMediaContent = () => {
    // First check if there was an error with the media files
    if (scormPackage.mediaFilesError) {
      return (
        <div className="media-error">
          <h3>Media Content Unavailable</h3>
          <p>The media files for this course are no longer available. This may happen if:</p>
          <ul>
            <li>You've refreshed the page (objectURLs don't persist across page refreshes)</li>
            <li>You've reopened the browser after closing it</li>
            <li>The browser has cleared temporary memory</li>
          </ul>
          <p>Please try to build and download the package again.</p>
        </div>
      );
    }
    
    const currentFile = getCurrentMediaFile();
    const currentIndex = getCurrentMediaIndex();
    
    if (!currentFile) {
      return (
        <div className="no-media-selected">
          <p>No media file selected or media file not found.</p>
          <p>Please select a media file from the available list.</p>
        </div>
      );
    }
    
    console.log('Rendering media file:', currentFile);
    
    // Check if objectURL exists
    if (!currentFile.objectURL) {
      return (
        <div className="media-error">
          <h3>Media File Unavailable</h3>
          <p>The selected media file ({currentFile.name}) is no longer available in memory.</p>
          <p>Please try to build and download the package again.</p>
        </div>
      );
    }
    
    const isImage = currentFile.type.startsWith('image/');
    const isVideo = currentFile.type.startsWith('video/');
    
    if (isImage) {
      return (
        <div className="media-viewer image-viewer">
          <div className="media-container">
            <img 
              src={currentFile.objectURL} 
              alt={currentFile.name}
              className="media-content"
              onLoad={() => {
                console.log('Image loaded successfully:', currentFile.name);
                const mediaFiles = scormPackage.mediaFiles || [];
                if (mediaFiles.length > 0) {
                  const progress = Math.min(Math.round((currentIndex + 1) / mediaFiles.length * 100), 100);
                  setProgress(progress);
                  saveProgress(progress);
                }
              }}
              onError={(e) => {
                console.error('Error loading image:', currentFile.name);
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='%23f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle'>Image Not Available</text></svg>";
              }}
            />
          </div>
          <div className="media-counter">
            <strong>{currentIndex + 1}</strong> of <strong>{scormPackage.mediaFiles.length}</strong> media files
          </div>
          <div className="media-info">
            <h3>Image: {currentFile.name}</h3>
            <div className="media-navigation">
              <button onClick={() => navigateMedia('prev')} className="btn btn-secondary">Previous</button>
              <button onClick={() => navigateMedia('next')} className="btn btn-secondary">Next</button>
              <button className="btn btn-primary" onClick={() => handleCompleteDemo()}>
                Mark All as Viewed
              </button>
            </div>
          </div>
        </div>
      );
    } else if (isVideo) {
      return (
        <div className="media-viewer video-viewer">
          <div className="media-container">
            <video 
              src={currentFile.objectURL}
              controls
              autoPlay
              className="media-content"
              onEnded={() => {
                console.log('Video ended, advancing to next');
                navigateMedia('next');
              }}
              onLoadedData={() => {
                console.log('Video loaded successfully:', currentFile.name);
                const mediaFiles = scormPackage.mediaFiles || [];
                if (mediaFiles.length > 0) {
                  const progress = Math.min(Math.round((currentIndex + 1) / mediaFiles.length * 100), 100);
                  setProgress(progress);
                  saveProgress(progress);
                }
              }}
              onError={(e) => {
                console.error('Error loading video:', currentFile.name);
                e.target.parentNode.innerHTML = "<div class='video-error'>Video content not available or format not supported</div>";
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="media-counter">
            <strong>{currentIndex + 1}</strong> of <strong>{scormPackage.mediaFiles.length}</strong> media files
          </div>
          <div className="media-info">
            <h3>Video: {currentFile.name}</h3>
            <div className="media-navigation">
              <button onClick={() => navigateMedia('prev')} className="btn btn-secondary">Previous</button>
              <button onClick={() => navigateMedia('next')} className="btn btn-secondary">Next</button>
              <button className="btn btn-primary" onClick={() => handleCompleteDemo()}>
                Mark All as Viewed
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="unsupported-media">
          <p>Unsupported media type: {currentFile.type}</p>
          <p>Please try a different file.</p>
          <div className="media-navigation">
            <button onClick={() => navigateMedia('prev')} className="btn btn-secondary">Previous</button>
            <button onClick={() => navigateMedia('next')} className="btn btn-secondary">Next</button>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
        <button onClick={handleBackClick} className="btn btn-secondary">Back to Courses</button>
      </div>
    );
  }

  if (!scormPackage) {
    return (
      <div className="card empty-state">
        <div className="empty-icon">❓</div>
        <h3>Course not found</h3>
        <p>The SCORM package you're looking for could not be found.</p>
        <button onClick={handleBackClick} className="btn btn-primary">Back to Courses</button>
      </div>
    );
  }

  // Sample course content for demo
  const sampleCourseContent = (
    <div className="demo-content">
      <h1>{scormPackage.title}</h1>
      <div className="demo-section">
        <h2>Course Overview</h2>
        <p>{scormPackage.description}</p>
        <p>This is a sample SCORM course for demonstration purposes. In a real SCORM package, this would be interactive content created with an authoring tool.</p>
      </div>
      
      <div className="demo-section">
        <h2>Learning Objectives</h2>
        <ul>
          <li>Understand what SCORM is and how it works</li>
          <li>Learn about the different versions of SCORM</li>
          <li>Explore how SCORM packages are structured</li>
          <li>Discover how to create your own SCORM content</li>
        </ul>
      </div>
      
      <div className="demo-section">
        <h2>Sample Quiz</h2>
        <div className="demo-quiz">
          <p className="question">What does SCORM stand for?</p>
          <div className="options">
            <label><input type="radio" name="q1" /> Shared Content Object Reference Model</label>
            <label><input type="radio" name="q1" /> Standard Course Online Reference Material</label>
            <label><input type="radio" name="q1" /> System for Content and Organized Resource Management</label>
          </div>
        </div>
      </div>
      
      <div className="demo-actions">
        <button className="btn btn-primary demo-complete-btn" onClick={handleCompleteDemo}>
          Mark as Complete
        </button>

        <button className="btn btn-success take-test-btn" onClick={showTestTab} style={{marginTop: '10px'}}>
          Take Assessment
        </button>

        {/* <button className="btn btn-secondary debug-btn" onClick={debugProgress} style={{marginTop: '10px'}}>
          Debug Progress (Force Show Tab)
        </button>

        <div className="progress-info">
          <p>Current progress: {progress}%</p>
          <p>When progress reaches 100%, the Assessment tab will appear.</p>
          <p>Progress type: {typeof progress}</p>
        </div> */}
      </div>
    </div>
  );

  return (
    <div className="scorm-player" ref={containerRef}>
      <div className="page-header">
        <div>
          <h2 className="page-title">{scormPackage.title}</h2>
          <p className="page-subtitle">SCORM Package</p>
        </div>
        <div className="player-controls">
          <button onClick={refreshContent} className="btn btn-secondary" title="Reload content">
            ↻ Reload
          </button>
          <button onClick={toggleFullscreen} className="btn btn-secondary" title="Toggle fullscreen">
            {isFullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
          </button>
          <button onClick={handleBackClick} className="btn btn-primary">
            ← Back to Courses
          </button>
        </div>
      </div>
      
      <div className="course-info card">
        <h3>Course Description</h3>
        <p>{scormPackage.description || 'No description provided'}</p>
        <div className="metadata">
          <span>
            <strong>Uploaded:</strong> {new Date(scormPackage.uploadDate).toLocaleDateString()}
          </span>
          {scormPackage.fileCount && (
            <span>
              <strong>Files:</strong> {scormPackage.fileCount}
            </span>
          )}
          {hasNestedZip && (
            <span>
              <strong>Package Type:</strong> 
              <span className="badge nested-zip">Nested ZIP</span>
            </span>
          )}
          {nestedContent && (
            <span>
              <strong>Structure:</strong> Nested content
            </span>
          )}
          {scormPackage.manifestPath && (
            <span>
              <strong>Manifest:</strong> {scormPackage.manifestPath}
            </span>
          )}
          {testCompleted && (
            <span>
              <strong>Test Score:</strong> 
              <span className={`badge ${testScore >= 70 ? 'badge-success' : 'badge-danger'}`}>
                {testScore}%
              </span>
            </span>
          )}
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress-label">
          <span>Course Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
            title={`${progress}% complete`}
          ></div>
        </div>
      </div>
      
      {scormPackage.files && scormPackage.files.length > 0 ? (
        <div className="scorm-content-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Course Content
            </button>
            <button 
              className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Package Files
            </button>
            {/* Always add the test tab for guaranteed access */}
            <button 
              className={`tab-button ${activeTab === 'test' ? 'active' : ''} assessment-tab`}
              onClick={() => setActiveTab('test')}
              style={{
                backgroundColor: activeTab === 'test' ? '' : '#e6f7ff',
                borderBottom: activeTab === 'test' ? '' : '2px solid #91caff'
              }}
            >
              Assessment {testCompleted && <span className="badge badge-small">{testScore}%</span>}
            </button>
          </div>
          
          <div className="card scorm-content-wrapper">
            {activeTab === 'content' && (
              selectedFile ? (
                <div className="course-content">
        
                    {(nestedContent || hasNestedZip) && (
                      <div className="file-source-badge">
                        {hasNestedZip && scormPackage.nestedZipInfo.extractedNestedZip && 
                         scormPackage.files.find(f => f.name === selectedFile)?.fromNestedZip ? (
                          <span className="badge from-nested-zip">From nested ZIP: {scormPackage.nestedZipInfo.extractedZipName}</span>
                        ) : nestedContent ? (
                          <span className="badge nested-content">Nested content from: {scormPackage.manifestDir}</span>
                        ) : null}
                      </div>
                    )}
  
                  <div className="content-display">
                    {scormPackage.isMediaBased ? (
                      renderMediaContent()
                    ) : selectedFile.endsWith('.zip') ? (
                      <div className="zip-content-display">
                        <div className="zip-icon large">📦</div>
                        <h3>ZIP File Selected</h3>
                        <p>This is a ZIP file which may contain SCORM content. The system has automatically analyzed this file.</p>
                        <p>Switch to the "Package Files" tab to see the extracted contents.</p>
                      </div>
                    ) : selectedFile.endsWith('.html') || selectedFile.endsWith('.htm') ? (
                      <div className="content-iframe-container">
                        <iframe 
                          ref={iframeRef}
                          src={`data:text/html;charset=utf-8,${encodeURIComponent(
                            scormPackage.files?.find(f => f.name === selectedFile)?.content || 
                            '<html><body><p>Content not available</p></body></html>'
                          )}`}
                          className="content-iframe"
                          title={selectedFile}
                        />
                      </div>
                    ) : (
                      // For other displayable content
                      <div className="content-placeholder">
                        <p>This is a demo view of the selected content file.</p>
                        <p>In a full implementation, the SCORM content would be loaded in an iframe.</p>
                        <p>Selected file: <strong>{selectedFile}</strong></p>
                        
                        {(nestedContent || hasNestedZip) && (
                          <div className="nested-content-notice">
                            {nestedContent && (
                              <p><strong>Note:</strong> This is a nested SCORM package with content located in: {scormPackage.manifestDir}</p>
                            )}
                            {hasNestedZip && scormPackage.nestedZipInfo.extractedNestedZip && (
                              <p><strong>Note:</strong> This content was extracted from a nested ZIP file: {scormPackage.nestedZipInfo.extractedZipName}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : sampleCourseContent
            )}
            
            {activeTab === 'files' && (
              <div className="package-files">
                <div className="files-browser">
                  {/* {renderPackageTabs()} */}
                  {renderPackageContent()}
                  {/* <div className="file-preview-pane"> */}
                    {/* <h3>File Preview</h3>
                    {selectedFile ? (
                      getSelectedFileContent()
                    ) : (
                      <div className="no-selection">
                        <p>Select a file to preview</p>
                      </div>
                    )} */}
                  {/* </div> */}
                </div>
              </div>
            )}
            
            {activeTab === 'test' && (
              <div className="assessment-container">
                <MCQTest />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="scorm-content-wrapper card">
          {sampleCourseContent}
        </div>
      )}
    </div>
  );
};

export default ScormPlayer; 