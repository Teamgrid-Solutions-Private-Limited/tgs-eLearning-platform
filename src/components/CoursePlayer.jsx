import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Same sample content as in CoursesList
const sampleCourses = [
  {
    _id: '1',
    title: 'Introduction to E-Learning Standards',
    description: 'Learn the basics of e-learning standards and how they work in learning environments.',
    uploadDate: new Date('2025-05-10').toISOString(),
    filePath: '/sample/intro-elearning'
  },
  {
    _id: '2',
    title: 'Advanced JavaScript for E-Learning',
    description: 'Master JavaScript techniques for creating interactive course content and measuring learner progress.',
    uploadDate: new Date('2025-05-12').toISOString(),
    filePath: '/sample/advanced-js'
  },
  {
    _id: '3',
    title: 'Responsive Design for E-Learning',
    description: 'Learn how to create courses that look great on any device - from desktop to mobile.',
    uploadDate: new Date('2025-05-14').toISOString(),
    filePath: '/sample/responsive-design'
  },
  {
    _id: '4',
    title: 'Creating Assessments in Courses',
    description: 'Design effective quizzes, tests, and other assessments in your learning modules.',
    uploadDate: new Date('2025-05-15').toISOString(),
    filePath: '/sample/assessments'
  }
];

const CoursePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learningModule, setLearningModule] = useState(null);
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
        const key = `course_progress_${userId}_${id}`;
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
        const storedPackages = localStorage.getItem('learningModules');
        let packageData;

        if (storedPackages) {
          const allPackages = JSON.parse(storedPackages);
          packageData = allPackages.find(pkg => pkg._id === id);
        }

        // If not found in localStorage, use initial data
        if (!packageData && sampleCourses[id]) {
          packageData = sampleCourses[id];
        }

        if (packageData) {
          setLearningModule(packageData);
          
          // Check if this package has nested zip files
          if (packageData.nestedZipInfo && packageData.nestedZipInfo.hasNestedZips) {
            setHasNestedZip(true);
            
            if (packageData.nestedZipInfo.extractedNestedZip) {
              console.log(`Using content from extracted nested ZIP: ${packageData.nestedZipInfo.extractedZipName}`);
            } else {
              console.log('Package has nested ZIPs but none were extracted');
            }
          }
          
          // Check if this is a nested Learning Module
          if (packageData.manifestDir && packageData.manifestDir.length > 0) {
            setNestedContent(true);
            console.log(`Detected nested course content in: ${packageData.manifestDir}`);
          }
          
          // Analyze package structure
          if (packageData.fileStructure) {
            setPackageStructure(packageData.fileStructure);
          }
          
          // If the package has a main file, set it as selected
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
          
          setProgress(getStoredProgress());
          setError(null);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load Learning Module. Please try again later.');
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
      const key = `course_progress_${userId}_${id}`;
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
    
    // If this is a nested Learning Module and we're at the root level,
    // try to navigate to the manifest directory first
    let directoryToRender = structure;
    if (nestedContent && path === '' && learningModule?.manifestDir) {
      // Remove trailing slash if any
      const dirPath = learningModule.manifestDir.endsWith('/') 
        ? learningModule.manifestDir.slice(0, -1) 
        : learningModule.manifestDir;
      
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
    if (!learningModule?.files || !selectedFile) return null;
    
    // Find the selected file in the package files
    const file = learningModule.files.find(f => f.name === selectedFile);
    
    if (!file) return <div className="file-preview">File not available for preview</div>;
    
    if (file.name.endsWith('.zip')) {
      return (
        <div className="file-preview zip-preview">
          <div className="zip-alert">
            <div className="zip-icon">📦</div>
            <h3>ZIP File</h3>
            <p>This is a nested ZIP file that may contain course content.</p>
            {file.fromNestedZip ? (
              <div className="nested-zip-info">
                <p>This file is part of the extracted nested ZIP: {file.nestedZipSource}</p>
              </div>
            ) : (
              <div className="nested-zip-actions">
                <p>Note: The system has already analyzed this ZIP for course content.</p>
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
            {learningModule.nestedZipInfo.extractedNestedZip ? (
              <>
                <div className="zip-alert success">
                  <div className="zip-icon">✅</div>
                  <p><strong>Extracted successfully:</strong> {learningModule.nestedZipInfo.extractedZipName}</p>
                </div>
                <p>The course content from this nested ZIP has been extracted and is being displayed.</p>
                <ul className="nested-zip-files">
                  {learningModule.nestedZipInfo.nestedZipFiles.map((zipFile, index) => (
                    <li key={index} className={zipFile === learningModule.nestedZipInfo.extractedZipName ? 'active' : ''}>
                      <span className="file-icon">📦</span>
                      {zipFile}
                      {zipFile === learningModule.nestedZipInfo.extractedZipName && <span className="active-indicator"> (active)</span>}
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
                  {learningModule.nestedZipInfo.nestedZipFiles.map((zipFile, index) => (
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
                  <p>Showing contents from {learningModule.manifestDir || 'root directory'}</p>
                </div>
              )}
              {renderFileTree(packageStructure)}
            </>
          ) : (
            <div className="file-list">
              {learningModule.files.map((file, index) => (
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
      question: "What does E-Learning Standard stand for?",
      options: [
        "Standard 1.0",
        "Standard 1.2",
        "Standard 2004",
        "Standard 3.0"
      ],
      correctAnswer: 1
    },
    {
      question: "Which version of E-Learning Standard is most widely supported across LMS platforms?",
      options: [
        "Standard 1.0",
        "Standard 1.2",
        "Standard 2004",
        "Standard 3.0"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the main purpose of E-Learning Standards?",
      options: [
        "To create interactive animations",
        "To standardize how e-learning content and LMSs work together",
        "To replace traditional classroom learning",
        "To reduce the file size of learning content"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of the following is NOT typically included in a Learning Module?",
      options: [
        "imsmanifest.xml",
        "HTML content",
        "JavaScript files",
        "Live streaming video"
      ],
      correctAnswer: 3
    },
    {
      question: "How does a Learning Module track user progress?",
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
    setActiveTab('test');
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

  if (!learningModule) {
    return (
      <div className="card empty-state">
        <div className="empty-icon">❓</div>
        <h3>Course not found</h3>
        <p>The Learning Module you're looking for could not be found.</p>
        <button onClick={handleBackClick} className="btn btn-primary">Back to Courses</button>
      </div>
    );
  }

  // Sample course content for demo
  const sampleCourseContent = (
    <div className="demo-content">
      <h1>{learningModule.title}</h1>
      <div className="demo-section">
        <h2>Course Overview</h2>
        <p>{learningModule.description}</p>
        <p>This is a sample e-learning course for demonstration purposes. In a real Learning Module, this would be interactive content created with an authoring tool.</p>
      </div>
      
      <div className="demo-section">
        <h2>Learning Objectives</h2>
        <ul>
          <li>Understand what E-Learning Standards are and how they work</li>
          <li>Learn about the different versions of E-Learning Standards</li>
          <li>Explore how Learning Modules are structured</li>
          <li>Discover how to create your own e-learning content</li>
        </ul>
      </div>
      
      <div className="demo-section">
        <h2>Sample Quiz</h2>
        <div className="demo-quiz">
          <p className="question">What does E-Learning Standard stand for?</p>
          <div className="options">
            <label><input type="radio" name="q1" /> Standard 1.0</label>
            <label><input type="radio" name="q1" /> Standard 1.2</label>
            <label><input type="radio" name="q1" /> Standard 2004</label>
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
    <div className="course-player" ref={containerRef}>
      <div className="page-header">
        <div>
          <h2 className="page-title">{learningModule.title}</h2>
          <p className="page-subtitle">Learning Module</p>
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
        <p>{learningModule.description || 'No description provided'}</p>
        <div className="metadata">
          <span>
            <strong>Uploaded:</strong> {new Date(learningModule.uploadDate).toLocaleDateString()}
          </span>
          {learningModule.fileCount && (
            <span>
              <strong>Files:</strong> {learningModule.fileCount}
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
          {learningModule.manifestPath && (
            <span>
              <strong>Manifest:</strong> {learningModule.manifestPath}
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
      
      {learningModule.files && learningModule.files.length > 0 ? (
        <div className="course-content-tabs">
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
          
          <div className="card course-content-wrapper">
            {activeTab === 'content' && (
              selectedFile ? (
                <div className="course-content">
        
                    {(nestedContent || hasNestedZip) && (
                      <div className="file-source-badge">
                        {hasNestedZip && learningModule.nestedZipInfo.extractedNestedZip && 
                         learningModule.files.find(f => f.name === selectedFile)?.fromNestedZip ? (
                          <span className="badge from-nested-zip">From nested ZIP: {learningModule.nestedZipInfo.extractedZipName}</span>
                        ) : nestedContent ? (
                          <span className="badge nested-content">Nested content from: {learningModule.manifestDir}</span>
                        ) : null}
                      </div>
                    )}
  
                  <div className="content-display">
                    {selectedFile.endsWith('.zip') ? (
                      <div className="zip-content-display">
                        <div className="zip-icon large">📦</div>
                        <h3>ZIP File Selected</h3>
                        <p>This is a ZIP file which may contain course content. The system has automatically analyzed this file.</p>
                        <p>Switch to the "Package Files" tab to see the extracted contents.</p>
                      </div>
                    ) : selectedFile.endsWith('.html') || selectedFile.endsWith('.htm') ? (
                      <div className="content-iframe-container">
                        <iframe 
                          ref={iframeRef}
                          src={`data:text/html;charset=utf-8,${encodeURIComponent(
                            learningModule.files?.find(f => f.name === selectedFile)?.content || 
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
                        <p>In a full implementation, the course content would be loaded in an iframe.</p>
                        <p>Selected file: <strong>{selectedFile}</strong></p>
                        
                        {(nestedContent || hasNestedZip) && (
                          <div className="nested-content-notice">
                            {nestedContent && (
                              <p><strong>Note:</strong> This is a nested Learning Module with content located in: {learningModule.manifestDir}</p>
                            )}
                            {hasNestedZip && learningModule.nestedZipInfo.extractedNestedZip && (
                              <p><strong>Note:</strong> This content was extracted from a nested ZIP file: {learningModule.nestedZipInfo.extractedZipName}</p>
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
        <div className="course-content-wrapper card">
          {sampleCourseContent}
        </div>
      )}
    </div>
  );
};

export default CoursePlayer; 