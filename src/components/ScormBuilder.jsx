import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

const ScormBuilder = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Introduction to Programming');
  const [subtitle, setSubtitle] = useState('Learn the fundamentals of programming languages');
  const [description, setDescription] = useState('');
  const [contentBlocks, setContentBlocks] = useState([]);
  const [buttonText, setButtonText] = useState('Start');
  const [coverImage, setCoverImage] = useState('');
  const [brightness, setBrightness] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState('heading');
  const [imageUrl, setImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('cover');
  const [activeView, setActiveView] = useState('course');
  const fileInputRef = useRef(null);

  const generateManifest = () => {
    return `<?xml version="1.0" standalone="no" ?>
<manifest identifier="com.scorm.manifesttemplate" version="1.2"
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
    API.LMSCommit("");
    alert("Course marked as completed!");
  }
}`;
  };

  const generateContentHTML = () => {
    if (contentBlocks.length === 0) {
      return `
      <h2>Course Description</h2>
      <p>${description || 'This is a sample SCORM course generated using the SCORM Builder.'}</p>
      
      <h2>Learning Objectives</h2>
      <ul>
        <li>Learn about SCORM standards</li>
        <li>Understand how SCORM packages work</li>
        <li>Create your own SCORM content</li>
      </ul>
      
      <h2>Sample Content</h2>
      <p>Replace this with your actual course content. You can include text, images, videos, interactive exercises, and more.</p>
      `;
    }

    return contentBlocks.map(block => {
      switch (block.type) {
        case 'heading':
          return `<h${block.level || 2}>${block.content}</h${block.level || 2}>`;
        case 'paragraph':
          return `<p>${block.content}</p>`;
        case 'image':
          return `<div class="image-container">
            <img src="${block.url}" alt="${block.alt || 'Course image'}" style="max-width: 100%; height: auto;">
            ${block.caption ? `<p class="image-caption">${block.caption}</p>` : ''}
          </div>`;
        case 'list':
          const listItems = block.items.map(item => `<li>${item}</li>`).join('');
          return `<${block.listType === 'ordered' ? 'ol' : 'ul'}>
            ${listItems}
          </${block.listType === 'ordered' ? 'ol' : 'ul'}>`;
        default:
          return '';
      }
    }).join('\n');
  };

  const generateDefaultHTML = () => {
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
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .course-header {
      position: relative;
      height: 400px;
      overflow: hidden;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 0 50px;
      background-color: #2563eb;
    }
    .course-header-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      filter: brightness(${brightness}%);
    }
    .course-header-content {
      position: relative;
      z-index: 1;
      max-width: 800px;
    }
    .course-title {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    .course-subtitle {
      font-size: 1.2rem;
      margin-bottom: 20px;
      opacity: 0.9;
    }
    .start-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    .start-button:hover {
      background-color: #1d4ed8;
    }
    .course-content {
      max-width: 800px;
      margin: 30px auto;
      padding: 20px;
    }
    .course-objectives {
      margin: 40px 0;
    }
    .course-objectives h2 {
      color: #333;
      margin-bottom: 20px;
    }
    .objectives-list {
      list-style-type: none;
      padding: 0;
    }
    .objectives-list li {
      padding: 10px 0 10px 30px;
      position: relative;
    }
    .objectives-list li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #2563eb;
      font-weight: bold;
    }
    .image-container {
      margin: 15px 0;
      text-align: center;
    }
    .image-caption {
      font-style: italic;
      color: #6b7280;
      font-size: 0.9em;
      margin-top: 8px;
    }
    .complete-button {
      display: block;
      margin: 40px auto;
      padding: 12px 30px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }
    .complete-button:hover {
      background-color: #1d4ed8;
    }
  </style>
</head>
<body>
  <header class="course-header">
    ${coverImage ? `<img src="${coverImage}" alt="${title}" class="course-header-image" />` : ''}
    <div class="course-header-content">
      <h1 class="course-title">${title}</h1>
      <p class="course-subtitle">${subtitle}</p>
      <button class="start-button" onclick="document.querySelector('.course-content').scrollIntoView({behavior: 'smooth'})">
        ${buttonText}
      </button>
    </div>
  </header>
  
  <div class="course-content">
    ${generateContentHTML()}
    
    <div class="course-objectives">
      <h2>Course Objectives</h2>
      <ul class="objectives-list">
        <li>Understand and align your work with a deeper sense of purpose to enhance motivation and fulfillment.</li>
        <li>Build meaningful relationships with colleagues to foster trust, collaboration, and a sense of belonging.</li>
        <li>Develop strategies to measure progress, celebrate achievements, and maintain momentum.</li>
        <li>Create a positive mindset that enhances creativity, resilience, and overall well-being.</li>
    </ul>
  </div>
  
  <button class="complete-button" onclick="setCompleted()">Complete Course</button>
  </div>
</body>
</html>`;
  };

  const handleAddBlock = () => {
    let newBlock;

    switch (selectedBlockType) {
      case 'heading':
        newBlock = { 
          id: Date.now(), 
          type: 'heading', 
          content: '', 
          level: 2 
        };
        break;
      case 'paragraph':
        newBlock = { 
          id: Date.now(), 
          type: 'paragraph', 
          content: '' 
        };
        break;
      case 'image':
        newBlock = { 
          id: Date.now(), 
          type: 'image', 
          url: imageUrl,
          alt: '',
          caption: ''
        };
        break;
      case 'list':
        newBlock = { 
          id: Date.now(), 
          type: 'list', 
          listType: 'unordered', 
          items: [''] 
        };
        break;
      default:
        return;
    }

    setContentBlocks([...contentBlocks, newBlock]);
    setImageUrl('');
  };

  const handleUpdateBlock = (id, updatedData) => {
    setContentBlocks(
      contentBlocks.map(block => 
        block.id === id ? { ...block, ...updatedData } : block
      )
    );
  };

  const handleRemoveBlock = (id) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
  };

  const handleAddListItem = (blockId) => {
    setContentBlocks(
      contentBlocks.map(block => {
        if (block.id === blockId && block.type === 'list') {
          return {
            ...block,
            items: [...block.items, '']
          };
        }
        return block;
      })
    );
  };

  const handleUpdateListItem = (blockId, index, value) => {
    setContentBlocks(
      contentBlocks.map(block => {
        if (block.id === blockId && block.type === 'list') {
          const newItems = [...block.items];
          newItems[index] = value;
          return {
            ...block,
            items: newItems
          };
        }
        return block;
      })
    );
  };

  const handleRemoveListItem = (blockId, index) => {
    setContentBlocks(
      contentBlocks.map(block => {
        if (block.id === blockId && block.type === 'list' && block.items.length > 1) {
          const newItems = [...block.items];
          newItems.splice(index, 1);
          return {
            ...block,
            items: newItems
          };
        }
        return block;
      })
    );
  };

  const handleMoveBlock = (id, direction) => {
    const index = contentBlocks.findIndex(block => block.id === id);
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === contentBlocks.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = [...contentBlocks];
    const block = newBlocks[index];
    newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, block);
    setContentBlocks(newBlocks);
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrightnessChange = (e) => {
    setBrightness(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRemoveCoverImage = () => {
    setCoverImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBuild = async () => {
    if (!title) {
      setError('Please enter a title for your SCORM package');
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
      zip.file('index.html', generateDefaultHTML());

      // Add the SCORM API implementation
      zip.file('scorm_api.js', generateScormAPI());

      // Generate the zip file
      const zipContent = await zip.generateAsync({ type: 'blob' });

      // Save the file
      const fileName = `${title.replace(/\s+/g, '_')}_scorm.zip`;
      FileSaver.saveAs(zipContent, fileName);

      setSuccess(true);
    } catch (err) {
      setError('Failed to build SCORM package: ' + err.message);
      console.error('Error building package:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderBlockEditor = (block) => {
    switch (block.type) {
      case 'heading':
  return (
          <div className="block-editor" key={block.id}>
            <div className="form-row">
              <div className="form-group col-md-9">
                <input
                  type="text"
                  className="form-control"
                  value={block.content}
                  onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                  placeholder="Heading text"
                />
              </div>
              <div className="form-group col-md-3">
                <select
                  className="form-control"
                  value={block.level}
                  onChange={(e) => handleUpdateBlock(block.id, { level: parseInt(e.target.value) })}
                >
                  <option value="1">H1</option>
                  <option value="2">H2</option>
                  <option value="3">H3</option>
                  <option value="4">H4</option>
                </select>
              </div>
            </div>
            {renderBlockControls(block)}
          </div>
        );
      
      case 'paragraph':
        return (
          <div className="block-editor" key={block.id}>
            <textarea
              className="form-control"
              value={block.content}
              onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
              placeholder="Paragraph text"
              rows="4"
            />
            {renderBlockControls(block)}
          </div>
        );
      
      case 'image':
        return (
          <div className="block-editor" key={block.id}>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                className="form-control"
                value={block.url}
                onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
        <div className="form-group">
              <label>Alt Text</label>
          <input 
            type="text" 
            className="form-control" 
                value={block.alt}
                onChange={(e) => handleUpdateBlock(block.id, { alt: e.target.value })}
                placeholder="Image description"
          />
        </div>
        <div className="form-group">
              <label>Caption (optional)</label>
              <input
                type="text"
            className="form-control" 
                value={block.caption}
                onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })}
                placeholder="Image caption"
              />
            </div>
            {block.url && (
              <div className="image-preview mt-2">
                <img 
                  src={block.url} 
                  alt={block.alt || "Preview"} 
                  style={{ maxWidth: '100%', maxHeight: '200px' }} 
          />
        </div>
            )}
            {renderBlockControls(block)}
          </div>
        );
        
      case 'list':
        return (
          <div className="block-editor" key={block.id}>
        <div className="form-group">
              <select
                className="form-control mb-2"
                value={block.listType}
                onChange={(e) => handleUpdateBlock(block.id, { listType: e.target.value })}
              >
                <option value="unordered">Bullet List</option>
                <option value="ordered">Numbered List</option>
              </select>
              
              {block.items.map((item, index) => (
                <div className="input-group mb-2" key={index}>
                  <input
                    type="text"
            className="form-control" 
                    value={item}
                    onChange={(e) => handleUpdateListItem(block.id, index, e.target.value)}
                    placeholder="List item"
                  />
                  <div className="input-group-append">
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={() => handleRemoveListItem(block.id, index)}
                      disabled={block.items.length <= 1}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleAddListItem(block.id)}
              >
                Add Item
              </button>
            </div>
            {renderBlockControls(block)}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderBlockControls = (block) => {
    const index = contentBlocks.findIndex(b => b.id === block.id);
    const isFirst = index === 0;
    const isLast = index === contentBlocks.length - 1;

    return (
      <div className="block-controls mt-2 d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mr-1"
          onClick={() => handleMoveBlock(block.id, 'up')}
          disabled={isFirst}
        >
          ↑
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mr-1"
          onClick={() => handleMoveBlock(block.id, 'down')}
          disabled={isLast}
        >
          ↓
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleRemoveBlock(block.id)}
        >
          Remove
        </button>
      </div>
    );
  };

  return (
    <div className="builder-container">
      <header className="builder-header">
        <div className="builder-tabs">
          <button 
            className={`tab-button ${activeView === 'course' ? 'active' : ''}`} 
            onClick={() => setActiveView('course')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5V19H19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 19V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Course Editor
          </button>
          <button 
            className={`tab-button ${activeView === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveView('preview')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5C7.45455 5 4 9 2 12C4 15 7.45455 19 12 19C16.5455 19 20 15 22 12C20 9 16.5455 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Preview
          </button>
        </div>
        <div className="builder-actions">
          <button className="btn btn-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleBuild}
            disabled={loading}
          >
            {loading ? 'Building...' : 'Export SCORM Package'}
          </button>
        </div>
      </header>

      {activeView === 'course' ? (
        <div className="builder-content">
          <div className="sidebar">
            <div className="section-tabs">
              <button 
                className={`section-tab ${activeTab === 'cover' ? 'active' : ''}`}
                onClick={() => handleTabChange('cover')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 7L21 7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cover
              </button>
              <button 
                className={`section-tab ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => handleTabChange('content')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Content
              </button>
              <button 
                className={`section-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleTabChange('settings')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15C19.1277 15.8031 19.2294 16.6751 19.6761 17.3966C20.1228 18.118 20.8802 18.6194 21.7313 18.7629C21.1462 20.1621 20.2734 21.4221 19.1715 22.4704C18.0695 23.5187 16.7622 24.3346 15.326 24.868C14.8999 24.0368 14.1589 23.4127 13.2729 23.1344C12.3869 22.8562 11.4263 22.9446 10.6112 23.3831C9.79606 23.8216 9.19002 24.5727 8.90701 25.4559C7.50584 25.0223 6.19292 24.3126 5.04072 23.3644C3.88851 22.4161 2.91551 21.2495 2.18797 19.9423C3.02901 19.566 3.68732 18.9126 4.04888 18.1017C4.41044 17.2908 4.44519 16.3765 4.14667 15.5397C3.84815 14.7029 3.23897 14.0064 2.43896 13.5915C2.87036 12.1518 3.58071 10.82 4.52672 9.67978C5.47273 8.53954 6.63067 7.61774 7.928 6.97798C8.42247 7.79304 9.21595 8.38476 10.136 8.62947C11.0561 8.87418 12.0329 8.75498 12.8685 8.29485C13.7041 7.83472 14.33 7.06809 14.6157 6.16956C15.9976 6.61599 17.2896 7.33595 18.4171 8.29129C19.5447 9.24664 20.4859 10.4148 21.184 11.7238C20.376 12.119 19.7481 12.7799 19.4 13.5917" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Settings
              </button>
            </div>

            {activeTab === 'cover' && (
              <div className="sidebar-content">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Course Title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subtitle">Subtitle</label>
                  <input
                    type="text"
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Course Subtitle"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Course Description"
                    rows="4"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="buttonText">Button Text</label>
                  <input
                    type="text"
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Start Button Text"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="coverImage">Cover Image</label>
                  {coverImage ? (
                    <div className="image-preview-container">
                      <img 
                        src={coverImage} 
                        alt="Course Cover" 
                        className="image-preview" 
                      />
                      <div className="image-controls">
                        <button className="btn btn-outline btn-sm" onClick={handleRemoveCoverImage}>
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="image-upload-placeholder"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                      </svg>
                      <span>Click to Upload Cover Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                  />
                </div>
                {coverImage && (
                  <div className="form-group">
                    <label htmlFor="brightness">Image Brightness: {brightness}%</label>
                    <input
                      type="range"
                      id="brightness"
                      min="0"
                      max="100"
                      value={brightness}
                      onChange={handleBrightnessChange}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="sidebar-content">
                <div className="content-block-selector">
                  <label>Add Content Block</label>
                  <div className="block-types">
                    <button 
                      className={`block-type ${selectedBlockType === 'heading' ? 'active' : ''}`}
                      onClick={() => setSelectedBlockType('heading')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9V5H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Heading
                    </button>
                    <button 
                      className={`block-type ${selectedBlockType === 'paragraph' ? 'active' : ''}`}
                      onClick={() => setSelectedBlockType('paragraph')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 6H20M12 12H20M4 18H20M4 6L8 10L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Paragraph
                    </button>
                    <button 
                      className={`block-type ${selectedBlockType === 'image' ? 'active' : ''}`}
                      onClick={() => setSelectedBlockType('image')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <path d="M21 15L16 10L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Image
          </button>
          <button 
                      className={`block-type ${selectedBlockType === 'list' ? 'active' : ''}`}
                      onClick={() => setSelectedBlockType('list')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 6H20M8 12H20M8 18H20M3 6H4M3 12H4M3 18H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      List
                    </button>
                  </div>
                  <button className="btn btn-primary btn-sm mt-2" onClick={handleAddBlock}>
                    Add Block
          </button>
                </div>

                <div className="content-blocks-list">
                  <h3>Content Blocks</h3>
                  {contentBlocks.length === 0 ? (
                    <div className="empty-state">
                      <p>No content blocks added yet. Use the controls above to add content blocks.</p>
                    </div>
                  ) : (
                    <div className="blocks-container">
                      {contentBlocks.map((block, index) => (
                        <div key={block.id} className="content-block-item">
                          <div className="block-header">
                            <span className="block-type-label">{block.type}</span>
                            <div className="block-controls">
                              {renderBlockControls(block)}
                            </div>
                          </div>
                          <div className="block-editor">
                            {renderBlockEditor(block)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="sidebar-content">
                <div className="form-group">
                  <label htmlFor="scormVersion">SCORM Version</label>
                  <select id="scormVersion" defaultValue="1.2">
                    <option value="1.2">SCORM 1.2</option>
                    <option value="2004">SCORM 2004</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <select id="language" defaultValue="en">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="packageName">Package Filename</label>
                  <input
                    type="text"
                    id="packageName"
                    placeholder="my-course"
                    defaultValue={title.toLowerCase().replace(/\s+/g, '-')}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="preview-panel">
            <div className="preview-container">
              <h3 className="preview-title">Live Preview</h3>
              
              {activeTab === 'cover' && (
                <div className="course-preview course-header-preview">
                  <div 
                    className="course-header-bg" 
                    style={{
                      backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                      filter: coverImage ? `brightness(${brightness}%)` : 'none'
                    }}
                  ></div>
                  <div className="course-header-content">
                    <h1>{title || 'Course Title'}</h1>
                    <h2>{subtitle || 'Course Subtitle'}</h2>
                    <button className="course-start-btn">{buttonText || 'Start'}</button>
                  </div>
                </div>
              )}
              
              {activeTab === 'content' && (
                <div className="course-preview course-content-preview">
                  {contentBlocks.length === 0 ? (
                    <div className="course-content-placeholder">
                      <p>Add content blocks to see them previewed here.</p>
                    </div>
                  ) : (
                    <div className="course-content-blocks">
                      {contentBlocks.map(block => {
                        switch (block.type) {
                          case 'heading':
                            return <h2 key={block.id}>{block.content}</h2>;
                          case 'paragraph':
                            return <p key={block.id}>{block.content}</p>;
                          case 'image':
                            return (
                              <div key={block.id} className="content-image">
                                <img src={block.url} alt={block.alt || 'Content Image'} />
                                {block.caption && <p className="image-caption">{block.caption}</p>}
                              </div>
                            );
                          case 'list':
                            return block.listType === 'ordered' ? (
                              <ol key={block.id}>
                                {block.items.map((item, i) => <li key={i}>{item}</li>)}
                              </ol>
                            ) : (
                              <ul key={block.id}>
                                {block.items.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="preview-mode">
          <iframe 
            className="preview-iframe" 
            srcDoc={`
              <!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${title}</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      margin: 0;
                      padding: 0;
                      color: #333;
                    }
                    .course-header {
                      position: relative;
                      height: 400px;
                      overflow: hidden;
                      color: white;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: flex-start;
                      padding: 0 50px;
                      background-color: #5B4CFF;
                    }
                    .course-header-image {
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      filter: brightness(${brightness}%);
                      z-index: 0;
                    }
                    .course-header-content {
                      position: relative;
                      z-index: 1;
                      max-width: 600px;
                    }
                    .course-title {
                      font-size: 36px;
                      margin: 0 0 10px 0;
                    }
                    .course-subtitle {
                      font-size: 20px;
                      margin: 0 0 20px 0;
                      opacity: 0.9;
                    }
                    .course-start-button {
                      background-color: white;
                      color: #5B4CFF;
                      border: none;
                      padding: 10px 20px;
                      font-size: 16px;
                      font-weight: bold;
                      border-radius: 4px;
                      cursor: pointer;
                    }
                    .course-content {
                      max-width: 800px;
                      margin: 0 auto;
                      padding: 40px 20px;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                    }
                    .image-caption {
                      text-align: center;
                      font-style: italic;
                      color: #666;
                    }
                  </style>
                </head>
                <body>
                  <header class="course-header">
                    ${coverImage ? `<img class="course-header-image" src="${coverImage}" alt="Course Cover">` : ''}
                    <div class="course-header-content">
                      <h1 class="course-title">${title}</h1>
                      <h2 class="course-subtitle">${subtitle}</h2>
                      <button class="course-start-button" onclick="startCourse()">${buttonText}</button>
                    </div>
                  </header>
                  
                  <div class="course-content">
                    ${generateContentHTML()}
                  </div>
                  
                  <script>
                    function startCourse() {
                      // In a real SCORM package, this would communicate with the LMS
                      alert('Started course!');
                    }
                  </script>
                </body>
              </html>
            `}
            title="Course Preview"
          ></iframe>
        </div>
      )}

      {error && (
        <div className="alert-error">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="alert-success">
          <p>SCORM package created successfully!</p>
        </div>
      )}
    </div>
  );
  
  function handleCancel() {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/');
    }
  }
};

export default ScormBuilder; 