import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { scormApi } from '../services/api';

const ScormUploader = () => {
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
  const [module, setModule] = useState(1);
  const [modules, setModules] = useState([
    {
      id: 1,
      title: 'MODULE 1',
      items: [
        { id: 101, type: 'introduction', title: 'Introduction' },
        { id: 102, type: 'lesson', title: 'Lesson' },
        { id: 103, type: 'quiz', title: 'Quiz' }
      ]
    },
    {
      id: 2,
      title: 'MODULE 3',
      items: [
        { id: 201, type: 'lesson', title: 'Lesson' },
        { id: 202, type: 'quiz', title: 'Quiz' }
      ]
    }
  ]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  
  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    
    // Auto-fill the title if not already set
    if (!title) {
      // Remove file extension from name
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    }
    
    // If it's a ZIP file, try to read its contents
    if (selectedFile.name.endsWith('.zip')) {
      try {
        setProcessingStage('Analyzing ZIP contents...');
        const zip = new JSZip();
        const zipData = await zip.loadAsync(selectedFile);
        
        // List of files in the ZIP
        const fileList = [];
        
        // Process each file in the ZIP
        for (const filename in zipData.files) {
          if (!zipData.files[filename].dir) {
            // For HTML, JS, and CSS files, attempt to read their text content for preview
            if (filename.match(/\.(html|htm|js|css|xml|txt)$/i)) {
              try {
                const content = await zipData.files[filename].async('text');
                const preview = content.length > 500 ? content.substring(0, 500) + '...' : content;
                fileList.push({
                  name: filename,
                  size: zipData.files[filename]._data.uncompressedSize,
                  type: filename.split('.').pop().toLowerCase(),
                  preview
                });
              } catch (err) {
                console.error(`Could not read content of ${filename}:`, err);
                fileList.push({
                  name: filename,
                  size: zipData.files[filename]._data.uncompressedSize,
                  type: filename.split('.').pop().toLowerCase()
                });
              }
            } else {
              fileList.push({
                name: filename,
                size: zipData.files[filename]._data.uncompressedSize,
                type: filename.split('.').pop().toLowerCase()
              });
            }
          }
        }
        
        setZipContents(fileList.slice(0, 15)); // Show up to 15 files in preview
        setProcessingStage('');
      } catch (err) {
        console.error('Error reading ZIP file:', err);
        setProcessingStage('');
        setError('Could not read the ZIP file. It may be corrupted.');
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
      setError('Please select a SCORM package file');
      return;
    }

    if (!title) {
      setError('Please enter a title for the SCORM package');
      return;
    }

    // Check if file is a zip file
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a zip file for SCORM packages');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProcessingStage('Reading ZIP file...');
      
      // Read the ZIP file
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      setProcessingStage('Analyzing SCORM structure...');
      
      // Look for nested zip files that might contain the actual SCORM content
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
              setProcessingStage(`Found SCORM manifest in nested ZIP: ${nestedZipFile}`);
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
              break; // Found a valid SCORM package in a nested ZIP, no need to check others
            }
          } catch (err) {
            console.error(`Error extracting nested zip ${nestedZipFile}:`, err);
            // Continue with next nested zip if extraction fails
          }
        }
        
        if (!extractedNestedContent) {
          console.warn('No valid SCORM manifest found in any nested ZIP files');
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
        console.warn('Warning: This ZIP may not be a valid SCORM package (no imsmanifest.xml found)');
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
      setProcessingStage('Uploading to server...');
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(progressInterval);
          uploadPackageToServer(filesMetadata, manifestPath, manifestDir, nestedZipInfo);
        }
      }, 100);
      
    } catch (err) {
      setError('Failed to upload SCORM package. Please try again.');
      console.error('Error uploading package:', err);
      setLoading(false);
    }
  };
  
  const uploadPackageToServer = async (filesMetadata, manifestPath, manifestDir, nestedZipInfo) => {
    try {
      setProcessingStage('Preparing for upload...');
      
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('manifestPath', manifestPath || '');
      formData.append('manifestDir', manifestDir || '');
      
      // Add metadata about the package
      const packageMetadata = {
        fileCount: filesMetadata.length,
        nestedZipInfo: nestedZipInfo,
        fileStructure: getFileStructure(filesMetadata)
      };
      formData.append('metadata', JSON.stringify(packageMetadata));
      
      try {
        setProcessingStage('Uploading to server...');
        // Try to upload to the server
        const uploadedPackage = await scormApi.uploadPackage(formData);
        console.log('Package uploaded successfully:', uploadedPackage);
        
        // Complete loading state and navigate to course list
        setTimeout(() => {
          setLoading(false);
          setProcessingStage('');
          navigate('/');
        }, 500);
      } catch (apiError) {
        console.warn('API upload failed, falling back to localStorage:', apiError);
        // Fall back to localStorage if API call fails
        savePackageToLocalStorage(filesMetadata, manifestPath, manifestDir, nestedZipInfo);
      }
    } catch (err) {
      setError('Failed to upload package. Please try again.');
      console.error('Error during upload:', err);
      setLoading(false);
      setProcessingStage('');
    }
  };
  
  const savePackageToLocalStorage = (filesMetadata, manifestPath, manifestDir, nestedZipInfo) => {
    try {
      setProcessingStage('Saving to local storage...');
      // Get existing packages
      const existingPackagesJSON = localStorage.getItem('scormPackages');
      let existingPackages = [];
      
      if (existingPackagesJSON) {
        try {
          existingPackages = JSON.parse(existingPackagesJSON);
          if (!Array.isArray(existingPackages)) {
            console.warn('Stored packages is not an array, resetting');
            existingPackages = [];
          }
        } catch (err) {
          console.error('Error parsing stored packages, resetting:', err);
          existingPackages = [];
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
      
      // Ensure we have at least one file with content
      let hasHtmlContent = false;
      for (const file of filesMetadata) {
        if (file.content && (file.type === 'html' || file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
          hasHtmlContent = true;
          break;
        }
      }
      
      // If no HTML content, add a default page
      if (!hasHtmlContent) {
        const defaultHtml = {
          name: mainFile || 'index.html',
          type: 'html',
          size: 1024,
          content: `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #2563eb; }
                h2 { color: #4b5563; margin-top: 30px; }
                p { margin-bottom: 16px; }
                .section { margin-bottom: 40px; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <div class="section">
                <h2>Course Description</h2>
                <p>${description || 'No description provided.'}</p>
              </div>
              <div class="section">
                <h2>Course Content</h2>
                <p>This is a placeholder page for your course content.</p>
              </div>
            </body>
            </html>
          `,
          inManifestDir: true
        };
        
        filesMetadata.push(defaultHtml);
        mainFile = defaultHtml.name;
      }
      
      // Create a unique ID that works consistently
      const simpleId = `course-${Date.now()}`;
      
      // Create new package object
      const newPackage = {
        _id: simpleId,
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
        progress: 0,
        instructor: 'You',
        duration: '1h 30min'
      };
      
      // Add to packages array
      existingPackages.push(newPackage);
      
      // Save back to localStorage
      localStorage.setItem('scormPackages', JSON.stringify(existingPackages));
      
      // Complete loading state
      setTimeout(() => {
        setLoading(false);
        setProcessingStage('');
        navigate('/player/' + simpleId); // Navigate directly to the new course
      }, 500);
      
    } catch (err) {
      setError('Failed to save package data. Please try again.');
      console.error('Error saving package data:', err);
      setLoading(false);
      setProcessingStage('');
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

  const handleCreate = () => {
    // Handle course creation
    console.log('Creating course:', title, modules);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };
  
  const handleAddItem = (moduleId, type) => {
    const updatedModules = modules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          items: [
            ...mod.items,
            { 
              id: Date.now(), 
              type, 
              title: type.charAt(0).toUpperCase() + type.slice(1) 
            }
          ]
        };
      }
      return mod;
    });
    
    setModules(updatedModules);
  };
  
  const handleAddModule = () => {
    const newModule = {
      id: Date.now(),
      title: `MODULE ${modules.length + 1}`,
      items: []
    };
    
    setModules([...modules, newModule]);
  };

  return (
    <div className="course-creator">
      <div className="creator-container">
        <div className="creator-header">
          <h1>Create Course</h1>
          <div className="header-actions">
            <button className="action-button secondary">
              <span>Trace as a Core</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="course-form">
          <div className="form-group">
            <label htmlFor="courseTitle">Course Title</label>
            <input 
              type="text" 
              id="courseTitle"
              placeholder="Sample course"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="modules-container">
            {modules.map((mod) => (
              <div key={mod.id} className="module-block">
                <div className="module-header">
                  <h2>{mod.title}</h2>
                  <div className="module-action">
                    <span>Organize your content.</span>
                  </div>
          </div>
          
                <div className="module-items">
                  {mod.items.map((item) => (
                    <div key={item.id} className="module-item">
                      <div className="item-icon">
                        {item.type === 'introduction' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12.5C12.8284 12.5 13.5 11.8284 13.5 11C13.5 10.1716 12.8284 9.5 12 9.5C11.1716 9.5 10.5 10.1716 10.5 11C10.5 11.8284 11.1716 12.5 12 12.5Z" fill="currentColor"/>
                            <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 16V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 7.5V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {item.type === 'lesson' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6H7C5.89543 6 5 6.89543 5 8V16C5 17.1046 5.89543 18 7 18H17C18.1046 18 19 17.1046 19 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3L19 6L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 6H14.5C13 6 11.5 7.5 11.5 9V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {item.type === 'quiz' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="item-title">{item.title}</div>
                      <button className="item-expand-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    className="add-item-btn"
                    onClick={() => handleAddItem(mod.id, 'lesson')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Add Item</span>
                  </button>
              </div>
              </div>
            ))}
            
            <button 
              className="add-module-btn"
              onClick={handleAddModule}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Add Module</span>
            </button>
            </div>
          
          <div className="form-actions">
            <button 
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              className="btn-create"
              onClick={handleCreate}
            >
              Create
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .course-creator {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .creator-container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }
        
        .creator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        h1 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: #111827;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .action-button.secondary {
          background: none;
          border: 1px solid #d1d5db;
          color: #6b7280;
        }
        
        .course-form {
          max-width: 700px;
        }
        
        .form-group {
          margin-bottom: 24px;
        }
        
        label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #4b5563;
        }
        
        input[type="text"] {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #111827;
        }
        
        input[type="text"]::placeholder {
          color: #9ca3af;
        }
        
        .modules-container {
          margin-bottom: 24px;
        }
        
        .module-block {
          margin-bottom: 16px;
        }
        
        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        h2 {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          color: #111827;
        }
        
        .module-action {
          font-size: 12px;
          color: #6b7280;
        }
        
        .module-items {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .module-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          background-color: white;
        }
        
        .module-item:last-child {
          border-bottom: none;
        }
        
        .item-icon {
          margin-right: 12px;
          color: #6b7280;
        }
        
        .item-title {
          flex: 1;
          font-size: 14px;
          color: #4b5563;
        }
        
        .item-expand-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
        }
        
        .add-item-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background-color: #f9fafb;
          border: none;
          border-top: 1px solid #e5e7eb;
          color: #4b5563;
          font-size: 14px;
          cursor: pointer;
        }
        
        .add-item-btn:hover {
          background-color: #f3f4f6;
        }
        
        .add-module-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background-color: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 6px;
          color: #4b5563;
          font-size: 14px;
          cursor: pointer;
          margin-top: 20px;
        }
        
        .add-module-btn:hover {
          background-color: #f3f4f6;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        
        .btn-cancel {
          padding: 8px 16px;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .btn-create {
          padding: 8px 16px;
          background-color: #e5e7eb;
          border: none;
          border-radius: 6px;
          color: #111827;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ScormUploader; 