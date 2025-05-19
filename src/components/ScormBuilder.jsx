import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

const ScormBuilder = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type.startsWith('video/')
    );
    
    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only images and videos are allowed.');
    }
    
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateManifest = () => {
    return `<?xml version="1.0" standalone="no" ?>
<manifest identifier="com.scorm.mediascorm" version="1.2"
         xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
         xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                             http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                             http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    <lom xmlns="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1">
      <general>
        <title>
          <langstring>${title}</langstring>
        </title>
        <description>
          <langstring>${description}</langstring>
        </description>
      </general>
    </lom>
  </metadata>
  <organizations default="default_org">
    <organization identifier="default_org">
      <title>${title}</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>${title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="scorm_api.js"/>
      ${mediaFiles.map(file => `<file href="${file.name}"/>`).join('\n      ')}
    </resource>
  </resources>
</manifest>`;
  };

  const generateScormAPI = () => {
    return `// SCORM 1.2 API Implementation
var API = null;

function findAPI(win) {
  if (win.API) return win.API;
  if (win.parent && win.parent != win) return findAPI(win.parent);
  return null;
}

function initializeCommunication() {
  var api = findAPI(window);
  if (!api && window.opener && typeof(window.opener) != "undefined") {
    api = findAPI(window.opener);
  }
  if (!api) {
    console.error("SCORM API not found");
    return false;
  }
  API = api;
  return true;
}

// Call LMSInitialize on page load
window.onload = function() {
  if (!initializeCommunication()) {
    console.error("Failed to initialize SCORM API");
    return;
  }
  
  if (API) {
    console.log("Found SCORM API. Initializing...");
    var result = API.LMSInitialize("");
    if (result === "true" || result === true) {
      console.log("LMS Initialized successfully");
      // Set initial status to incomplete
      API.LMSSetValue("cmi.core.lesson_status", "incomplete");
      API.LMSCommit("");
    } else {
      console.error("Failed to initialize LMS");
    }
  }
};

// Call LMSFinish on page unload
window.onunload = function() {
  if (API) {
    console.log("Page unloaded. Finishing LMS session...");
    var result = API.LMSFinish("");
    if (result === "true" || result === true) {
      console.log("LMS session finished successfully");
    } else {
      console.error("Failed to finish LMS session");
    }
  }
};

// Function to set completion status
function setCompleted() {
  if (API) {
    API.LMSSetValue("cmi.core.lesson_status", "completed");
    API.LMSSetValue("cmi.core.lesson_location", currentSlide);
    API.LMSCommit("");
    alert("Course marked as completed!");
  }
}

// Function to save progress
function saveProgress(slideIndex) {
  if (API) {
    API.LMSSetValue("cmi.core.lesson_location", slideIndex);
    API.LMSCommit("");
    console.log("Progress saved: slide " + slideIndex);
  }
}`;
  };

  const generateMediaPlayerHTML = () => {
    let slidesHtml = '';
    
    // Process all media files in the order they were added
    mediaFiles.forEach((file, index) => {
      const fileName = file.name; // Just use the filename, not the path
      
      if (file.type.startsWith('image/')) {
        slidesHtml += `
      <div class="slide" id="slide-${index}">
        <div class="slide-content">
          <img src="${fileName}" alt="Slide ${index + 1}" class="media-content" />
        </div>
      </div>`;
      } else if (file.type.startsWith('video/')) {
        slidesHtml += `
      <div class="slide" id="slide-${index}">
        <div class="slide-content">
          <video src="${fileName}" controls class="media-content"></video>
        </div>
      </div>`;
      }
    });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="scorm_api.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background-color: #2563eb;
      color: white;
      padding: 15px 20px;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    .course-info {
      background-color: white;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .media-player {
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .media-content {
      max-width: 100%;
      max-height: 600px;
      display: block;
      margin: 0 auto;
    }
    .slide {
      display: none;
      padding: 20px;
    }
    .slide.active {
      display: block;
    }
    .slide-content {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    .controls {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px;
      background-color: #f0f0f0;
    }
    .nav-buttons {
      display: flex;
      gap: 10px;
    }
    button {
      padding: 8px 15px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #1d4ed8;
    }
    button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    .progress {
      color: #4b5563;
      display: flex;
      align-items: center;
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
  </header>

  <div class="container">
    <div class="course-info">
      <h2>Course Description</h2>
      <p>${description || 'No description provided.'}</p>
    </div>

    <div class="media-player">
      ${slidesHtml}

      <div class="controls">
        <div class="nav-buttons">
          <button id="prev-btn" onclick="prevSlide()">Previous</button>
          <button id="next-btn" onclick="nextSlide()">Next</button>
        </div>
        <div class="progress">
          <span id="current-slide">1</span> / <span id="total-slides">${mediaFiles.length}</span>
        </div>
        <button id="complete-btn" onclick="setCompleted()">Mark as Complete</button>
      </div>
    </div>
  </div>

  <script>
    let currentSlide = 0;
    const totalSlides = ${mediaFiles.length};
    const slides = document.querySelectorAll('.slide');

    // Initialize first slide
    if (slides.length > 0) {
      slides[0].classList.add('active');
    }

    // Check for saved progress
    if (API) {
      const savedLocation = API.LMSGetValue("cmi.core.lesson_location");
      if (savedLocation && !isNaN(parseInt(savedLocation))) {
        currentSlide = parseInt(savedLocation);
        showSlide(currentSlide);
      }
    }

    function showSlide(index) {
      // Hide all slides
      slides.forEach(slide => slide.classList.remove('active'));
      
      // Show the current slide
      if (slides[index]) {
        slides[index].classList.add('active');
        
        // Update navigation buttons
        document.getElementById('prev-btn').disabled = index === 0;
        document.getElementById('next-btn').disabled = index === totalSlides - 1;
        
        // Update progress text
        document.getElementById('current-slide').textContent = index + 1;
        
        // Save progress
        currentSlide = index;
        saveProgress(index);
        
        // Check if it's a video and autoplay
        const activeSlide = slides[index];
        const video = activeSlide.querySelector('video');
        if (video) {
          // Reset any other playing videos
          slides.forEach(s => {
            if (s !== activeSlide) {
              const v = s.querySelector('video');
              if (v) v.pause();
            }
          });
          
          // Add ended event listener only once
          if (!video.hasEndedListener) {
            video.hasEndedListener = true;
            video.addEventListener('ended', function() {
              if (currentSlide < totalSlides - 1) {
                nextSlide();
              }
            });
          }
        }
      }
    }

    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        showSlide(currentSlide + 1);
      }
    }

    function prevSlide() {
      if (currentSlide > 0) {
        showSlide(currentSlide - 1);
      }
    }
    
    // Initialize the first slide properly
    showSlide(currentSlide);
  </script>
</body>
</html>`;
  };

  const handleBuild = async () => {
    if (!title) {
      setError('Please enter a title for your SCORM package');
      return;
    }

    if (mediaFiles.length === 0) {
      setError('Please add at least one media file (image or video)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Create a new JSZip instance
      const zip = new JSZip();

      // Add the imsmanifest.xml
      zip.file('imsmanifest.xml', generateManifest());

      // Add the index.html
      zip.file('index.html', generateMediaPlayerHTML());

      // Add the SCORM API implementation
      zip.file('scorm_api.js', generateScormAPI());

      // Add each media file directly to the root of the zip
      for (const file of mediaFiles) {
        const fileContent = await readFileAsArrayBuffer(file);
        zip.file(file.name, fileContent);
        console.log(`Added file to ZIP: ${file.name}`);
      }

      // Generate the zip file
      const zipContent = await zip.generateAsync({ type: 'blob' });

      // Save the file
      const fileName = `${title.replace(/\s+/g, '_')}_scorm.zip`;
      FileSaver.saveAs(zipContent, fileName);

      // Save the package info to localStorage
      savePackageToLocalStorage(fileName, zipContent);

      setSuccess(true);
    } catch (err) {
      setError('Failed to build SCORM package: ' + err.message);
      console.error('Error building package:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save package to localStorage for the app to display
  const savePackageToLocalStorage = async (fileName, zipBlob) => {
    try {
      // Generate a unique ID for the package
      const packageId = 'media_' + Date.now();
      
      console.log('Creating simplified package for localStorage storage');
      
      // Create a simpler representation for localStorage that doesn't include full file content
      const mediaFilesInfo = mediaFiles.map(file => {
        // Create a URL for the file that can be used directly
        const objectURL = URL.createObjectURL(file);
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          objectURL: objectURL, // Store URL reference instead of base64 content
          lastModified: file.lastModified
        };
      });
      
      console.log('Created URLs for', mediaFilesInfo.length, 'media files');
      
      // Get existing packages
      const existingPackages = localStorage.getItem('scormPackages');
      let packages = existingPackages ? JSON.parse(existingPackages) : [];
      
      // Create a simplified package object without large file content
      const newPackage = {
        _id: packageId,
        title: title,
        description: description,
        uploadDate: new Date().toISOString(),
        fileCount: mediaFiles.length + 3, // media files + html + manifest + API
        fileSize: zipBlob.size,
        fileName: fileName,
        isMediaBased: true,
        mediaCount: mediaFiles.length,
        mediaFiles: mediaFilesInfo,
        // Add a files array that's consistent with the non-media packages structure
        files: [
          { name: 'index.html', type: 'html' },
          { name: 'imsmanifest.xml', type: 'xml' },
          { name: 'scorm_api.js', type: 'js' }
        ],
        // Add HTML structure info but not full content
        html: {
          name: 'index.html',
          slideCount: mediaFiles.length
        },
        // No need to store full content of these files
        manifest: {
          name: 'imsmanifest.xml'
        },
        api: {
          name: 'scorm_api.js'
        }
      };
      
      packages.push(newPackage);
      console.log('Package prepared for localStorage');
      
      try {
        localStorage.setItem('scormPackages', JSON.stringify(packages));
        console.log('Package saved to localStorage with objectURLs');
      } catch (storageErr) {
        console.error('Error writing to localStorage:', storageErr);
        alert('The media files are too large to store in browser memory. The SCORM package has been downloaded, but won\'t appear in your course list.');
      }
      
    } catch (err) {
      console.error('Error saving package to localStorage:', err);
      // Don't throw error here as the zip file was already created
    }
  };
  
  // Helper function to read file content
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="card">
      <h2 className="card-title">Media-Based SCORM Builder</h2>
      <p className="card-subtitle">Create SCORM packages using images and videos</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">SCORM package built successfully! The download should start automatically.</div>}
      
      <form>
        <div className="form-group">
          <label htmlFor="title" className="form-label">Course Title</label>
          <input 
            type="text" 
            id="title" 
            className="form-control" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea 
            id="description" 
            className="form-control" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Media Files</label>
          <input 
            type="file" 
            id="media-files" 
            className="form-control" 
            onChange={handleFileChange}
            disabled={loading}
            accept="image/*,video/*"
            multiple
          />
          <small className="form-text">Upload images and videos for your course. These will be arranged in a slideshow format.</small>
        </div>
        
        {mediaFiles.length > 0 && (
          <div className="media-files-list">
            <h3 className="form-label">Added Media Files ({mediaFiles.length})</h3>
            <ul className="list-group">
              {mediaFiles.map((file, index) => (
                <li key={index} className="list-group-item">
                  <div className="media-file-item">
                    <span>
                      {file.type.startsWith('image/') ? '🖼️' : '🎬'} {file.name}
                    </span>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-danger" 
                      onClick={() => removeFile(index)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleBuild}
            disabled={loading || mediaFiles.length === 0}
          >
            {loading ? 'Building...' : 'Build SCORM Package'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScormBuilder; 