import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import LessonEditor from './LessonEditor';
import { editorDataToHtml } from '../utils/editorjsToHtml';
import './editor.css';
import EditorJS from './Editor'

const INITIAL_DATA = {
  time: new Date().getTime(),
  blocks: [
    {
      type: "header",
      data: {
        text: "MERN Stack Tutorial - Getting Started",
        level: 2
      }
    },
    {
      type: "paragraph",
      data: {
        text: "In this tutorial, you'll learn how to build a full-stack web application using MongoDB, Express, React, and Node.js. Let's begin with the prerequisites and initial setup."
      }
    },
    {
      type: "checkList",
      data: {
        items: [
          { text: "Install Node.js", checked: true },
          { text: "Install MongoDB", checked: false },
          { text: "Install VS Code", checked: true },
          { text: "Setup project folder", checked: false }
        ]
      }
    },
    {
      type: "header",
      data: {
        text: "Basic Server Setup",
        level: 3
      }
    },
    {
      type: "code",
      data: {
        code: `const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('MERN Tutorial Home');
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`
      }
    },
    {
      type: "table",
      data: {
        withHeadings: true,
        content: [
          ["Component", "Technology", "Purpose"],
          ["M", "MongoDB", "Database"],
          ["E", "Express.js", "Backend Framework"],
          ["R", "React.js", "Frontend Library"],
          ["N", "Node.js", "Runtime Environment"]
        ]
      }
    },
    {
      type: "embed",
      data: {
        service: "youtube",
        source: "https://www.youtube.com/watch?v=7CqJlxBYj-M",
        embed: "https://www.youtube.com/embed/7CqJlxBYj-M",
        width: 580,
        height: 320,
        caption: "Watch: Complete MERN Stack Tutorial"
      }
    }
  ]
};




const ScormBuilder = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [editorData, setEditorData] = useState(INITIAL_DATA);

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

  const generateDefaultHTML = () => {
    const htmlContent = editorData?.blocks?.length > 0
    ? editorDataToHtml(editorData)
    : content 
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
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2563eb;
      text-align: center;
    }
    .course-content {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      background-color: #f9fafb;
    }
    .complete-button {
      display: block;
      margin: 20px auto;
      padding: 10px 20px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    .complete-button:hover {
      background-color: #1d4ed8;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  
  <div class="course-content">
    ${htmlContent || `
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
    `}
  </div>
  
  <button class="complete-button" onclick="setCompleted()">Complete Course</button>
</body>
</html>`;
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

  return (
    <div className="card">
      <h2 className="card-title">SCORM Package Builder</h2>
      <p className="card-subtitle">Create basic SCORM-compliant packages from scratch</p>
      
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
        
        {/* <div className="form-group">
          <label htmlFor="content" className="form-label">HTML Content (optional)</label>
          <textarea 
            id="content" 
            className="form-control" 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows="10"
            placeholder="Enter your custom HTML content here, or leave blank to use the default template."
          />
          <LessonEditor data={editorData} onChange={setEditorData} />
          <small className="form-text">Enter custom HTML content for your course, or leave blank to use the default template.</small>
        </div> */}

        <div className="editor">
      <EditorJS data={editorData} onChange={setEditorData} editorBlock="editorjs-container" />
      {/* <button onClick={() => console.log(data)}>Save Data</button> */}
    </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleBuild}
            disabled={loading}
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