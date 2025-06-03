import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';

const ContentUploader = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zipContents, setZipContents] = useState([]);
  const [processingStage, setProcessingStage] = useState('');
  const [isContentBuilderPackage, setIsContentBuilderPackage] = useState(false);
  const [detectedModuleCount, setDetectedModuleCount] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  
  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setIsContentBuilderPackage(false);
    setDetectedModuleCount(0);
    
    // Auto-fill the title if not already set
    if (!title) {
      // Remove file extension from name
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    }
    
    // If it's a ZIP file, try to read its contents
    if (selectedFile.name.endsWith('.zip')) {
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(selectedFile);
        
        // List of files in the ZIP
        const fileList = [];
        
        // Process each file in the ZIP
        for (const filename in zipData.files) {
          if (!zipData.files[filename].dir) {
            let content = null;
            // For HTML files, extract the full content for Content Builder detection
            if (filename.endsWith('.html') || filename.endsWith('.htm')) {
              try {
                content = await zipData.files[filename].async('text');
              } catch (err) {
                console.warn('Could not read HTML content for:', filename);
              }
            }
            
            fileList.push({
              name: filename,
              size: zipData.files[filename]._data.uncompressedSize,
              content: content
            });
          }
        }
        
        // Early detection of Content Builder package
        const isBuilderPackage = detectContentBuilderPackage(fileList);
        setIsContentBuilderPackage(isBuilderPackage);
        
        if (isBuilderPackage) {
          // Try to extract module count for display
          const htmlFile = fileList.find(f => f.name === 'index.html' || f.name.endsWith('/index.html'));
          if (htmlFile && htmlFile.content) {
            const extractedData = extractBuilderDataFromHTML(htmlFile.content);
            if (extractedData) {
              setDetectedModuleCount(extractedData.moduleCount);
              // Auto-fill title from extracted data if current title is just the filename
              if (title === selectedFile.name.replace(/\.[^/.]+$/, "") && extractedData.courseData.title) {
                setTitle(extractedData.courseData.title);
              }
            }
          }
        }
        
        setZipContents(fileList.slice(0, 10)); // Show only first 10 files to avoid overwhelming the UI
      } catch (err) {
        console.error('Error reading ZIP file:', err);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a Learning Module file');
      return;
    }

    if (!title) {
      setError('Please enter a title for the Learning Module');
      return;
    }

    // Check if file is a zip file
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a zip file for Learning Modules');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProcessingStage('Analyzing course structure...');
      
      // Read the ZIP file
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      setProcessingStage('Analyzing course structure...');
      
      // Look for nested zip files that might contain the actual course content
      let nestedZipFiles = [];
      let manifestPath = null;
      let manifestDir = '';
      let extractedNestedContent = false;
      
      // First, check for imsmanifest.xml at root level
      for (const filename in zipData.files) {
        if (filename.endsWith('imsmanifest.xml') && !filename.includes('/')) {
          manifestPath = filename;
          manifestDir = '';
          break;
        }
        // Also collect any zip files we find
        if (filename.endsWith('.zip') && !zipData.files[filename].dir) {
          nestedZipFiles.push(filename);
        }
      }
      
      // If no manifest at root, look for manifest in any directory
      if (!manifestPath) {
        for (const filename in zipData.files) {
          if (filename.endsWith('imsmanifest.xml')) {
            manifestPath = filename;
            // Get the directory containing the manifest
            const parts = filename.split('/');
            // Remove the filename from the path to get the directory
            parts.pop();
            manifestDir = parts.join('/');
            if (manifestDir) {
              manifestDir += '/';
            }
            break;
          }
        }
      }
      
      // Collect file metadata
      let filesMetadata = [];
      
      // If we have nested zip files and no manifest was found, try to extract the first nested zip
      if (nestedZipFiles.length > 0 && !manifestPath) {
        setProcessingStage(`Extracting nested ZIP files: ${nestedZipFiles.length} found`);
        
        // Try each nested ZIP file until we find one with a manifest
        for (const nestedZipFile of nestedZipFiles) {
          try {
            setProcessingStage(`Extracting nested ZIP: ${nestedZipFile}`);
            // Get the binary data for the nested zip file
            const nestedZipData = await zipData.files[nestedZipFile].async('blob');
            
            // Create a new JSZip instance for the nested zip
            const nestedZip = new JSZip();
            const extractedZip = await nestedZip.loadAsync(nestedZipData);
            
            // Look for manifest in the nested zip
            let nestedManifestPath = null;
            let nestedManifestDir = '';
            
            for (const filename in extractedZip.files) {
              if (filename.endsWith('imsmanifest.xml')) {
                nestedManifestPath = filename;
                // Get the directory containing the manifest
                const parts = filename.split('/');
                // Remove the filename from the path to get the directory
                parts.pop();
                nestedManifestDir = parts.join('/');
                if (nestedManifestDir) {
                  nestedManifestDir += '/';
                }
                break;
              }
            }
            
            if (nestedManifestPath) {
              setProcessingStage(`Found course manifest in nested ZIP: ${nestedZipFile}`);
              manifestPath = nestedManifestPath;
              manifestDir = nestedManifestDir;
              
              // Process files from nested zip instead
              for (const filename in extractedZip.files) {
                if (!extractedZip.files[filename].dir) {
                  try {
                    let content = null;
                    // For HTML files, extract the full content
                    if (filename.endsWith('.html') || filename.endsWith('.htm')) {
                      content = await extractedZip.files[filename].async('text');
                    } else if (filename.endsWith('.css') || filename.endsWith('.js') || filename.endsWith('.xml') || filename.endsWith('.txt')) {
                      // Also extract text content for these file types
                      content = await extractedZip.files[filename].async('text');
                    }
                    
                    filesMetadata.push({
                      name: filename,
                      size: extractedZip.files[filename]._data ? 
                            extractedZip.files[filename]._data.uncompressedSize : 0,
                      type: filename.split('.').pop().toLowerCase(),
                      content: content,
                      inManifestDir: nestedManifestDir ? filename.startsWith(nestedManifestDir) : true,
                      fromNestedZip: true,
                      nestedZipSource: nestedZipFile
                    });
                  } catch (err) {
                    console.error(`Error processing file ${filename} from nested zip:`, err);
                  }
                }
              }
              extractedNestedContent = true;
              break; // Found a valid Learning Module in a nested ZIP, no need to check others
            }
          } catch (err) {
            console.error(`Error extracting nested zip ${nestedZipFile}:`, err);
            // Continue with next nested zip if extraction fails
          }
        }
        
        if (!extractedNestedContent) {
          console.warn('No valid course manifest found in any nested ZIP files');
        }
      }
      
      // If we didn't extract nested content, process the original zip
      if (!extractedNestedContent) {
        setProcessingStage('Processing main ZIP contents...');
        
        for (const filename in zipData.files) {
          if (!zipData.files[filename].dir) {
            // For HTML files, extract their content for preview
            if (filename.endsWith('.html') || filename.endsWith('.htm')) {
              try {
                const content = await zipData.files[filename].async('text');
                filesMetadata.push({
                  name: filename,
                  size: zipData.files[filename]._data.uncompressedSize,
                  type: 'html',
                  content: content, // Store the full HTML content
                  // Track if this file is in the same directory as the manifest
                  inManifestDir: manifestDir ? filename.startsWith(manifestDir) : true
                });
              } catch (err) {
                console.error(`Error reading ${filename}:`, err);
                filesMetadata.push({
                  name: filename,
                  size: zipData.files[filename]._data.uncompressedSize,
                  type: 'html',
                  content: null,
                  inManifestDir: manifestDir ? filename.startsWith(manifestDir) : true
                });
              }
            } else {
              filesMetadata.push({
                name: filename,
                size: zipData.files[filename]._data.uncompressedSize,
                type: filename.split('.').pop().toLowerCase(),
                inManifestDir: manifestDir ? filename.startsWith(manifestDir) : true
              });
            }
          }
        }
      }
      
      if (!manifestPath) {
        console.warn('Warning: This ZIP may not be a valid Learning Module (no imsmanifest.xml found)');
        // We'll still continue for demo purposes
      } else {
        console.log(`Found manifest at: ${manifestPath}, base directory: ${manifestDir || 'root'}`);
      }
      
      // Store information about any nested zip files
      const nestedZipInfo = nestedZipFiles.length > 0 ? {
        hasNestedZips: true,
        nestedZipFiles: nestedZipFiles,
        extractedNestedZip: extractedNestedContent,
        extractedZipName: extractedNestedContent ? nestedZipFiles[0] : null
      } : null;
      
      // Simulate upload progress
      setProcessingStage('Finalizing upload...');
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(progressInterval);
          savePackageToLocalStorage(filesMetadata, manifestPath, manifestDir, nestedZipInfo);
        }
      }, 100);
      
    } catch (err) {
      setError('Failed to upload Learning Module. Please try again.');
      console.error('Error uploading package:', err);
      setLoading(false);
    }
  };
  
  const savePackageToLocalStorage = (filesMetadata, manifestPath, manifestDir, nestedZipInfo) => {
    try {
      setProcessingStage('Saving to local storage...');
      // Get existing packages
      const existingPackagesJSON = localStorage.getItem('learningModules');
      let existingPackages = [];
      
      if (existingPackagesJSON) {
        existingPackages = JSON.parse(existingPackagesJSON);
      }
      
      // Detect if this is a Content Builder package
      const isContentBuilderPackage = detectContentBuilderPackage(filesMetadata);
      let builderData = null;
      let moduleCount = 0;
      
      if (isContentBuilderPackage) {
        // Try to extract builder data from the HTML content
        const htmlFile = filesMetadata.find(f => f.name === 'index.html' || f.name.endsWith('/index.html'));
        if (htmlFile && htmlFile.content) {
          const extractedData = extractBuilderDataFromHTML(htmlFile.content);
          if (extractedData) {
            builderData = extractedData.courseData;
            moduleCount = extractedData.moduleCount;
          }
        }
      }
      
      // Find the main HTML file, prioritizing files in the manifest directory
      // Common names to look for are index.html, story.html, or launch.html
      let mainFile = null;
      
      // First check in the manifest directory
      const inManifestDir = filesMetadata.filter(f => f.inManifestDir);
      
      // Look for common entry point files in the manifest directory
      for (const entryFile of ['index.html', 'story.html', 'launch.html', 'start.html', 'default.html']) {
        const foundFile = inManifestDir.find(f => 
          f.name === `${manifestDir}${entryFile}` || 
          f.name.endsWith(`/${entryFile}`)
        );
        if (foundFile) {
          mainFile = foundFile.name;
          break;
        }
      }
      
      // If still not found, look for any HTML file in the manifest directory
      if (!mainFile) {
        const anyHtmlFile = inManifestDir.find(f => 
          f.type === 'html' || f.name.endsWith('.html') || f.name.endsWith('.htm')
        );
        if (anyHtmlFile) {
          mainFile = anyHtmlFile.name;
        }
      }
      
      // If still not found, look for any HTML file in the whole package
      if (!mainFile) {
        const anyHtmlFile = filesMetadata.find(f => 
          f.type === 'html' || f.name.endsWith('.html') || f.name.endsWith('.htm')
        );
        if (anyHtmlFile) {
          mainFile = anyHtmlFile.name;
        }
      }
      
      // Create new package object
      const newPackage = {
        _id: Date.now().toString(), // Use timestamp as ID
        title,
        description,
        uploadDate: new Date().toISOString(),
        filePath: `/uploads/${file.name}`,
        fileName: file.name,
        fileCount: filesMetadata.length,
        files: filesMetadata.slice(0, 50), // Only store first 50 files to avoid storage limits
        mainFile: mainFile,
        manifestPath: manifestPath,
        manifestDir: manifestDir,
        fileStructure: getFileStructure(filesMetadata),
        nestedZipInfo: nestedZipInfo,
        // Content Builder specific properties
        ...(isContentBuilderPackage && {
          isBuiltWithBuilder: true,
          builderData: builderData,
          moduleCount: moduleCount
        })
      };
      
      // Add to packages array
      existingPackages.push(newPackage);
      
      // Save back to localStorage
      localStorage.setItem('learningModules', JSON.stringify(existingPackages));
      
      // Complete loading state
      setTimeout(() => {
        setLoading(false);
        setProcessingStage('');
        navigate('/');
      }, 500);
      
    } catch (err) {
      setError('Failed to save package data. Please try again.');
      console.error('Error saving package data:', err);
      setLoading(false);
      setProcessingStage('');
    }
  };
  
  // Detect if this is a Content Builder package
  const detectContentBuilderPackage = (filesMetadata) => {
    // Content Builder packages have a specific structure:
    // - index.html (main file)
    // - styles.css
    // - course.js
    // - course_api.js
    // - imsmanifest.xml
    // - Media files with pattern media_*.ext
    
    const requiredFiles = ['index.html', 'styles.css', 'course.js', 'course_api.js', 'imsmanifest.xml'];
    const foundFiles = requiredFiles.filter(fileName => 
      filesMetadata.some(f => f.name === fileName || f.name.endsWith(`/${fileName}`))
    );
    
    // Check if we have most of the required files (at least 4 out of 5)
    const hasRequiredFiles = foundFiles.length >= 4;
    
    // Check for media files with Content Builder naming pattern
    const hasMediaFiles = filesMetadata.some(f => 
      /^media_\d+\.(jpg|jpeg|png|gif|mp4|webm|mp3|wav|ogg)$/i.test(f.name) ||
      f.name.includes('/media_')
    );
    
    // Check if the HTML content contains Content Builder specific elements
    const htmlFile = filesMetadata.find(f => f.name === 'index.html' || f.name.endsWith('/index.html'));
    let hasBuilderStructure = false;
    
    if (htmlFile && htmlFile.content) {
      // Look for Content Builder specific HTML structure
      hasBuilderStructure = htmlFile.content.includes('course-container') &&
                           htmlFile.content.includes('course-navigation') &&
                           htmlFile.content.includes('module-content') &&
                           htmlFile.content.includes('data-module-id');
    }
    
    console.log('Content Builder detection:', {
      hasRequiredFiles,
      foundFiles: foundFiles.length,
      hasMediaFiles,
      hasBuilderStructure
    });
    
    // Consider it a Content Builder package if it has the required files and either media files or builder structure
    return hasRequiredFiles && (hasMediaFiles || hasBuilderStructure);
  };
  
  // Extract builder data from HTML content
  const extractBuilderDataFromHTML = (htmlContent) => {
    try {
      // Try to extract module information from the HTML
      const moduleMatches = htmlContent.match(/data-module-id="([^"]+)"/g);
      const moduleCount = moduleMatches ? moduleMatches.length : 0;
      
      // Try to extract course title
      const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/);
      const courseTitle = titleMatch ? titleMatch[1] : '';
      
      // Try to extract course header
      const headerMatch = htmlContent.match(/<h1>([^<]+)<\/h1>/);
      const headerTitle = headerMatch ? headerMatch[1] : '';
      
      // Create a simplified course data structure
      const courseData = {
        title: courseTitle || headerTitle || 'Imported Course',
        description: 'Course imported from Learning Module',
        modules: [],
        settings: {
          theme: 'modern',
          navigation: 'sidebar',
          responsive: true,
          accessibility: true
        }
      };
      
      // Try to extract module information
      if (moduleMatches) {
        moduleMatches.forEach((match, index) => {
          const moduleId = match.match(/data-module-id="([^"]+)"/)[1];
          
          // Try to find module title in the HTML
          const modulePattern = new RegExp(`<section[^>]*data-module-id="${moduleId}"[^>]*>([\\s\\S]*?)<\\/section>`);
          const moduleMatch = htmlContent.match(modulePattern);
          
          let moduleTitle = `Module ${index + 1}`;
          if (moduleMatch) {
            const titleMatch = moduleMatch[1].match(/<h2>([^<]+)<\/h2>/);
            if (titleMatch) {
              moduleTitle = titleMatch[1];
            }
          }
          
          courseData.modules.push({
            id: moduleId,
            title: moduleTitle,
            description: '',
            elements: [],
            settings: {
              navigation: true,
              completion: 'manual'
            }
          });
        });
      }
      
      return {
        courseData,
        moduleCount
      };
    } catch (error) {
      console.error('Error extracting builder data from HTML:', error);
      return null;
    }
  };

  // Create a file structure representation for better navigation
  const getFileStructure = (files) => {
    const structure = {};
    
    files.forEach(file => {
      const parts = file.name.split('/');
      let current = structure;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // This is a file
          current[part] = null;
        } else {
          // This is a directory
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });
    
    return structure;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Upload Learning Module</h2>
          <p className="page-subtitle">Upload a Learning Module (.zip) to make it available in your learning platform</p>
        </div>
      </div>
      
      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div 
            className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="file-drop-icon">
              {file ? '📄' : '📁'}
            </div>
            <div className="file-drop-content">
              {file ? (
                <div className="selected-file">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <p className="drop-title">Drag & Drop your Learning Module here</p>
                  <p className="drop-subtitle">or</p>
                </>
              )}
              <input 
                type="file" 
                id="file" 
                className="file-input" 
                accept=".zip"
                onChange={handleFileChange}
                disabled={loading}
              />
              <label htmlFor="file" className="btn btn-secondary file-input-label">
                {file ? 'Change File' : 'Browse Files'}
              </label>
            </div>
          </div>
          
          {isContentBuilderPackage && (
            <div className="content-builder-detection">
              <div className="detection-badge">
                <span className="badge-icon">🎯</span>
                <div className="badge-content">
                  <h4>Content Builder Package Detected!</h4>
                  <p>This appears to be a Learning Module created with our Content Builder.</p>
                  {detectedModuleCount > 0 && (
                    <p><strong>Modules detected:</strong> {detectedModuleCount}</p>
                  )}
                  <p className="detection-note">
                    ✅ The module will be properly recognized and displayed with Content Builder features.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {zipContents.length > 0 && (
            <div className="zip-preview">
              <h3>ZIP Content Preview</h3>
              <div className="file-list">
                {zipContents.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">
                      {file.name.endsWith('.zip') ? '📦' : '📄'}
                    </span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
                {zipContents.length < 10 ? (
                  <p className="file-count">Showing all {zipContents.length} files</p>
                ) : (
                  <p className="file-count">Showing 10 of {zipContents.length} files</p>
                )}
              </div>
            </div>
          )}
          
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
              placeholder="Enter a title for your course"
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
              placeholder="Enter a description (optional)"
            />
          </div>
          
          {loading && (
            <div className="upload-progress">
              <div className="progress-label">
                <span>{processingStage || 'Uploading...'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upload Learning Module'}
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
    </div>
  );
};

export default ContentUploader; 