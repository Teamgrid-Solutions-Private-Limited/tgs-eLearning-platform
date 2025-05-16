import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';

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
        const zip = new JSZip();
        const zipData = await zip.loadAsync(selectedFile);
        
        // List of files in the ZIP
        const fileList = [];
        
        // Process each file in the ZIP
        for (const filename in zipData.files) {
          if (!zipData.files[filename].dir) {
            fileList.push({
              name: filename,
              size: zipData.files[filename]._data.uncompressedSize
            });
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
      setError('Failed to upload SCORM package. Please try again.');
      console.error('Error uploading package:', err);
      setLoading(false);
    }
  };
  
  const savePackageToLocalStorage = (filesMetadata, manifestPath, manifestDir, nestedZipInfo) => {
    try {
      setProcessingStage('Saving to local storage...');
      // Get existing packages
      const existingPackagesJSON = localStorage.getItem('scormPackages');
      let existingPackages = [];
      
      if (existingPackagesJSON) {
        existingPackages = JSON.parse(existingPackagesJSON);
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
        nestedZipInfo: nestedZipInfo
      };
      
      // Add to packages array
      existingPackages.push(newPackage);
      
      // Save back to localStorage
      localStorage.setItem('scormPackages', JSON.stringify(existingPackages));
      
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
          <h2 className="page-title">Upload SCORM Package</h2>
          <p className="page-subtitle">Upload a SCORM package (.zip) to make it available in your learning platform</p>
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
                  <p className="drop-title">Drag & Drop your SCORM package here</p>
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
              {loading ? 'Processing...' : 'Upload SCORM Package'}
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

export default ScormUploader; 