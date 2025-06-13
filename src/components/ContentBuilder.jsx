import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import TemplateLibrary from './TemplateLibrary';
import "./style/ContentBuilder.css";

// Content element types
const elementTypes = {
  text: { icon: '📝', name: 'Text Block', component: 'TextBlock' },
  heading: { icon: '📰', name: 'Heading', component: 'Heading' },
  image: { icon: '🖼️', name: 'Image', component: 'Image' },
  video: { icon: '🎬', name: 'Video', component: 'Video' },
  audio: { icon: '🎵', name: 'Audio', component: 'Audio' },
  quiz: { icon: '❓', name: 'Quiz', component: 'Quiz' },
  interactive: { icon: '🎯', name: 'Interactive', component: 'Interactive' },
  accordion: { icon: '📋', name: 'Accordion', component: 'Accordion' },
  tabs: { icon: '📑', name: 'Tabs', component: 'Tabs' },
  timeline: { icon: '⏰', name: 'Timeline', component: 'Timeline' },
  gallery: { icon: '🖼️', name: 'Gallery', component: 'Gallery' },
  embed: { icon: '🔗', name: 'Embed', component: 'Embed' }
};

const ContentBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('design');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    objectives: [],
    modules: [],
    settings: {
      theme: 'modern',
      navigation: 'sidebar',
      responsive: true,
      accessibility: true
    }
  });
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Minimal auto-save state
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save configuration
  const AUTO_SAVE_INTERVAL = 30000;
  const DRAFT_RETENTION_DAYS = 30;

  // Refs for auto-save
  const autoSaveTimeoutRef = useRef(null);
  const lastSaveDataRef = useRef(null);

  // Initialize component with silent draft recovery
  useEffect(() => {
    const initializeBuilder = async () => {
      // Check if there's a draft ID in the URL parameters
      const draftId = searchParams.get('draft');
      
      if (draftId) {
        // Load specific draft from drafts storage
        try {
          const existingDrafts = JSON.parse(localStorage.getItem('contentBuilderDrafts') || '[]');
          const specificDraft = existingDrafts.find(d => d.id === draftId);
          
          if (specificDraft) {
            setCourseData(specificDraft.courseData);
            setCurrentDraftId(specificDraft.id);
            return; // Don't try to load other drafts
          }
        } catch (error) {
          console.error('Error loading specific draft:', error);
        }
      }
      
      // Check for existing current draft and recover silently
      const savedDraft = localStorage.getItem('contentBuilder_currentDraft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          const draftAge = Date.now() - draftData.timestamp;
          
          // Check if draft has any meaningful content
          const hasContent = draftData.courseData.title?.trim() || 
                            draftData.courseData.description?.trim() || 
                            draftData.courseData.modules?.length > 0 ||
                            draftData.courseData.objectives?.length > 0;
          
          // Silently recover if draft is less than 24 hours old and has content
          if (draftAge < 24 * 60 * 60 * 1000 && hasContent) {
            setCourseData(draftData.courseData);
            setCurrentDraftId(draftData.id);
          }
        } catch (error) {
          console.error('Error parsing saved draft:', error);
          localStorage.removeItem('contentBuilder_currentDraft');
        }
      }
    };

    initializeBuilder();
  }, [searchParams]);

  // Auto-save effect - completely silent background saving
  useEffect(() => {
    // Check if there's any meaningful content that should be saved
    const hasContent = courseData.title.trim() || 
                      courseData.description.trim() || 
                      courseData.modules.length > 0 ||
                      courseData.objectives.length > 0;

    if (hasContent) {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new auto-save timeout - save after 3 seconds of inactivity
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 3000);

      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    } else {
      // If no content, clear unsaved changes state
      setHasUnsavedChanges(false);
    }
  }, [courseData]);

  // Auto-save function - saves drafts separately from published courses
  const autoSave = useCallback(() => {
    // Save if there's ANY content, even just a few characters
    const hasContent = courseData.title.trim() || 
                      courseData.description.trim() || 
                      courseData.modules.length > 0 ||
                      courseData.objectives.length > 0;

    if (!hasContent) return;

    try {
      const draftData = {
        id: currentDraftId || Date.now().toString(),
        title: courseData.title || 'Untitled Course',
        description: courseData.description || '',
        courseData,
        timestamp: Date.now(),
        lastModified: new Date().toISOString(),
        moduleCount: courseData.modules.length,
        elementCount: courseData.modules.reduce((total, module) => total + module.elements.length, 0)
      };

      // Save current draft for recovery
      localStorage.setItem('contentBuilder_currentDraft', JSON.stringify(draftData));
      
      // Save to drafts list for the main screen
      const existingDrafts = JSON.parse(localStorage.getItem('contentBuilderDrafts') || '[]');
      const draftIndex = existingDrafts.findIndex(d => d.id === draftData.id);
      
      if (draftIndex >= 0) {
        existingDrafts[draftIndex] = draftData;
      } else {
        existingDrafts.unshift(draftData);
      }

      // Keep only last 10 drafts
      if (existingDrafts.length > 10) {
        existingDrafts.splice(10);
      }

      localStorage.setItem('contentBuilderDrafts', JSON.stringify(existingDrafts));
      
      setCurrentDraftId(draftData.id);
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [courseData, currentDraftId]);

  // Load drafts from localStorage
  const loadDrafts = useCallback(() => {
    try {
      const savedDrafts = JSON.parse(localStorage.getItem('contentBuilder_drafts') || '[]');
      // Filter out old drafts
      const validDrafts = savedDrafts.filter(draft => {
        const age = Date.now() - draft.timestamp;
        return age < DRAFT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
      });
      setDrafts(validDrafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
      setDrafts([]);
    }
  }, []);

  // Recover from draft
  const recoverFromDraft = (draft) => {
    setCourseData(draft.courseData);
    setCurrentDraftId(draft.id);
    setShowRecoveryDialog(false);
    setLastSaved(new Date(draft.timestamp));
    setAutoSaveStatus('recovered');
    
    // Clear recovered status after 3 seconds
    setTimeout(() => {
      setAutoSaveStatus('idle');
    }, 3000);
  };

  // Create new course (clear current)
  const createNewCourse = () => {
    setCourseData({
      title: '',
      description: '',
      objectives: [],
      modules: [],
      settings: {
        theme: 'modern',
        navigation: 'sidebar',
        responsive: true,
        accessibility: true
      }
    });
    setSelectedModule(null);
    setSelectedElement(null);
    setCurrentDraftId(null);
    setLastSaved(null);
    setAutoSaveStatus('idle');
    setHasUnsavedChanges(false);
    
    // Clear current draft
    localStorage.removeItem('contentBuilder_currentDraft');
    setShowRecoveryDialog(false);
  };

  // Load specific draft
  const loadDraft = (draft) => {
    setCourseData(draft.courseData);
    setCurrentDraftId(draft.id);
    setSelectedModule(null);
    setSelectedElement(null);
    setLastSaved(new Date(draft.timestamp));
    setAutoSaveStatus('loaded');
    setShowDraftManager(false);
    
    // Clear loaded status after 3 seconds
    setTimeout(() => {
      setAutoSaveStatus('idle');
    }, 3000);
  };

  // Delete draft
  const deleteDraft = (draftId) => {
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('contentBuilder_drafts') || '[]');
      const filteredDrafts = existingDrafts.filter(d => d.id !== draftId);
      localStorage.setItem('contentBuilder_drafts', JSON.stringify(filteredDrafts));
      setDrafts(filteredDrafts);
      
      // If deleting current draft, clear current draft storage
      if (currentDraftId === draftId) {
        localStorage.removeItem('contentBuilder_currentDraft');
        setCurrentDraftId(null);
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  // Manual save
  const manualSave = () => {
    autoSave();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      // Final save on unmount if there are unsaved changes
      if (hasUnsavedChanges) {
        // Save immediately before unmount
        const hasContent = courseData.title.trim() || 
                          courseData.description.trim() || 
                          courseData.modules.length > 0 ||
                          courseData.objectives.length > 0;
        
        if (hasContent) {
          const draftData = {
            id: currentDraftId || Date.now().toString(),
            title: courseData.title || 'Untitled Course',
            description: courseData.description || '',
            courseData,
            timestamp: Date.now(),
            lastModified: new Date().toISOString(),
            moduleCount: courseData.modules.length,
            elementCount: courseData.modules.reduce((total, module) => total + module.elements.length, 0)
          };

          // Save current draft for recovery
          localStorage.setItem('contentBuilder_currentDraft', JSON.stringify(draftData));
          
          // Save to drafts list only (not to main courses)
          const existingDrafts = JSON.parse(localStorage.getItem('contentBuilderDrafts') || '[]');
          const draftIndex = existingDrafts.findIndex(d => d.id === draftData.id);
          
          if (draftIndex >= 0) {
            existingDrafts[draftIndex] = draftData;
          } else {
            existingDrafts.unshift(draftData);
          }

          // Keep only last 10 drafts
          if (existingDrafts.length > 10) {
            existingDrafts.splice(10);
          }

          localStorage.setItem('contentBuilderDrafts', JSON.stringify(existingDrafts));
        }
      }
    };
  }, [hasUnsavedChanges, courseData, currentDraftId]);

  const addModule = () => {
    const newModule = {
      id: Date.now().toString(),
      title: `Module ${courseData.modules.length + 1}`,
      description: '',
      elements: [],
      settings: {
        navigation: true,
        completion: 'manual'
      }
    };
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
    setSelectedModule(newModule.id);
    
    // Trigger immediate save for important actions
    setTimeout(() => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSave();
    }, 500);
  };

  const addElement = (type, moduleId) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      settings: getDefaultSettings(type),
      position: { x: 0, y: 0 }
    };

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, elements: [...module.elements, newElement] }
          : module
      )
    }));
    
    // Trigger immediate save for important actions
    setTimeout(() => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSave();
    }, 500);
  };

  const getDefaultContent = (type) => {
    const defaults = {
      text: { text: 'Enter your text here...', formatting: {} },
      heading: { text: 'New Heading', level: 2 },
      image: { src: '', alt: '', caption: '' },
      video: { src: '', controls: true, autoplay: false },
      audio: { src: '', controls: true },
      quiz: { 
        question: 'Enter your question',
        type: 'multiple-choice',
        options: ['Option 1', 'Option 2', 'Option 3'],
        correct: 0,
        feedback: { correct: 'Correct!', incorrect: 'Try again.' }
      },
      interactive: { type: 'hotspot', data: {} },
      accordion: { items: [{ title: 'Section 1', content: 'Content here' }] },
      tabs: { items: [{ title: 'Tab 1', content: 'Content here' }] },
      timeline: { events: [{ date: '2024', title: 'Event', description: 'Description' }] },
      gallery: { images: [], layout: 'grid' },
      embed: { code: '', type: 'iframe' }
    };
    return defaults[type] || {};
  };

  const getDefaultSettings = (type) => {
    return {
      visible: true,
      required: false,
      animation: 'none',
      responsive: true
    };
  };

  const handleDragStart = (e, elementType) => {
    setDraggedElement(elementType);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', elementType);
    
    // Add visual feedback to the workspace
    setTimeout(() => {
      const workspace = document.querySelector('.design-workspace');
      if (workspace) {
        workspace.classList.add('dragging');
      }
    }, 10);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
    setIsDragging(false);
    
    // Remove visual feedback
    const workspace = document.querySelector('.design-workspace');
    if (workspace) {
      workspace.classList.remove('dragging');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Add drag-over class to the target
    const target = e.currentTarget;
    if (!target.classList.contains('drag-over')) {
      target.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    // Remove drag-over class when leaving the drop zone
    const target = e.currentTarget;
    if (!target.contains(e.relatedTarget)) {
      target.classList.remove('drag-over');
    }
  };

  const handleDrop = (e, moduleId) => {
    e.preventDefault();
    
    // Remove drag-over class
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedElement) {
      addElement(draggedElement, moduleId);
      setDraggedElement(null);
      setIsDragging(false);
      
      // Remove visual feedback
      const workspace = document.querySelector('.design-workspace');
      if (workspace) {
        workspace.classList.remove('dragging');
      }
      
      // Show success feedback
      showDropSuccess(e.currentTarget);
    }
  };

  const showDropSuccess = (target) => {
    target.style.transform = 'scale(1.05)';
    target.style.boxShadow = '0 4px 20px rgba(56, 161, 105, 0.3)';
    
    setTimeout(() => {
      target.style.transform = '';
      target.style.boxShadow = '';
    }, 300);
  };

  const updateElement = (moduleId, elementId, updates) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              elements: module.elements.map(element =>
                element.id === elementId
                  ? { ...element, ...updates }
                  : element
              )
            }
          : module
      )
    }));
  };

  const deleteElement = (moduleId, elementId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              elements: module.elements.filter(element => element.id !== elementId)
            }
          : module
      )
    }));
  };

  const deleteModule = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
    if (selectedModule === moduleId) {
      setSelectedModule(null);
      setSelectedElement(null);
    }
  };

  const publishCourse = async () => {
    setLoading(true);
    try {
      const zip = new JSZip();
      const uploadedFiles = new Map();
      
      const collectUploadedFiles = () => {
        const files = [];
        courseData.modules.forEach(module => {
          module.elements.forEach(element => {
            if (element.content.src_file && element.content.src) {
              const file = element.content.src_file;
              const fileExtension = file.name.split('.').pop();
              const fileName = `media_${element.id}.${fileExtension}`;
              files.push({ file, fileName, elementId: element.id });
            }
          });
        });
        return files;
      };

      const filesToInclude = collectUploadedFiles();
      
      for (const { file, fileName, elementId } of filesToInclude) {
        const fileContent = await readFileAsArrayBuffer(file);
        zip.file(fileName, fileContent);
        uploadedFiles.set(elementId, fileName);
      }
      
      zip.file('imsmanifest.xml', generateManifest(uploadedFiles));
      zip.file('index.html', generateHTML(uploadedFiles));
      zip.file('styles.css', generateCSS());
      zip.file('course.js', generateJavaScript());
      zip.file('course_api.js', generateCourseAPI());
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const fileName = `${courseData.title.replace(/\s+/g, '_')}_course.zip`;
      FileSaver.saveAs(zipContent, fileName);
      
      saveToLocalStorage();
      
    } catch (error) {
      console.error('Error publishing course:', error);
    } finally {
      setLoading(false);
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const generateManifest = (uploadedFiles = new Map()) => {
    return `<?xml version="1.0" standalone="no"?>
<manifest identifier="course_${Date.now()}" version="1.2">
  <metadata>
    <schema>E-Learning Standard</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="default_org">
    <organization identifier="default_org">
      <title>${courseData.title}</title>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" href="index.html">
      <file href="index.html"/>
      <file href="styles.css"/>
      <file href="course.js"/>
      <file href="course_api.js"/>
    </resource>
  </resources>
</manifest>`;
  };

  const generateHTML = (uploadedFiles) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseData.title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="course-container">
    <header>
      <h1>${courseData.title}</h1>
    </header>
    <main>
      ${courseData.modules.map(module => `
        <section class="module">
          <h2>${module.title}</h2>
          ${module.elements.map(element => renderElement(element, uploadedFiles)).join('')}
        </section>
      `).join('')}
    </main>
  </div>
  <script src="course.js"></script>
</body>
</html>`;
  };

  const renderElement = (element, uploadedFiles = new Map()) => {
    const { type, content } = element;
    
    switch (type) {
      case 'text':
        return `<div class="text-element">${content.text || 'Text content'}</div>`;
      case 'heading':
        return `<h${content.level || 2}>${content.text || 'Heading'}</h${content.level || 2}>`;
      case 'image':
        const imageSrc = uploadedFiles.has(element.id) ? uploadedFiles.get(element.id) : content.src;
        return imageSrc ? `<img src="${imageSrc}" alt="${content.alt || ''}" />` : '<div>No image</div>';
      case 'video':
        const videoSrc = uploadedFiles.has(element.id) ? uploadedFiles.get(element.id) : content.src;
        return videoSrc ? `<video src="${videoSrc}" controls></video>` : '<div>No video</div>';
      case 'audio':
        const audioSrc = uploadedFiles.has(element.id) ? uploadedFiles.get(element.id) : content.src;
        return audioSrc ? `<audio src="${audioSrc}" controls></audio>` : '<div>No audio</div>';
      case 'quiz':
        return `<div class="quiz-element">
          <h3>${content.question || 'Question'}</h3>
          ${(content.options || []).map((option, idx) => `
            <label><input type="radio" name="quiz-${element.id}" value="${idx}"> ${option}</label>
          `).join('')}
        </div>`;
      default:
        return `<div class="element">${type} element</div>`;
    }
  };

  const generateCSS = () => {
    return `
body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
#course-container { max-width: 1200px; margin: 0 auto; }
header { text-align: center; margin-bottom: 2rem; }
.module { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; }
.text-element { margin: 1rem 0; }
img, video, audio { max-width: 100%; height: auto; }
.quiz-element { background: #f5f5f5; padding: 1rem; margin: 1rem 0; }
.quiz-element label { display: block; margin: 0.5rem 0; }
`;
  };

  const generateJavaScript = () => {
    return `
console.log('Course loaded');
// Add interactivity here
`;
  };

  const generateCourseAPI = () => {
    return `
// Course API implementation
console.log('Course API loaded');
`;
  };

  const saveToLocalStorage = () => {
    try {
      const existingPackages = localStorage.getItem('learningModules');
      let packages = existingPackages ? JSON.parse(existingPackages) : [];
      
      // Check if this course already exists as a published course
      const existingIndex = packages.findIndex(pkg => 
        pkg.builderDraftId === currentDraftId || 
        (pkg.title === courseData.title && pkg.isBuiltWithBuilder)
      );
      
      const newPackage = {
        _id: existingIndex >= 0 ? packages[existingIndex]._id : Date.now().toString(),
        title: courseData.title,
        description: courseData.description,
        uploadDate: existingIndex >= 0 ? packages[existingIndex].uploadDate : new Date().toISOString(),
        lastModified: new Date().toISOString(),
        fileCount: courseData.modules.length + 4,
        isBuiltWithBuilder: true,
        builderData: courseData,
        builderDraftId: currentDraftId,
        moduleCount: courseData.modules.length,
        status: 'published'
      };
      
      if (existingIndex >= 0) {
        packages[existingIndex] = newPackage;
      } else {
        packages.unshift(newPackage);
      }
      
      localStorage.setItem('learningModules', JSON.stringify(packages));
      
      // Optionally remove from drafts after publishing
      if (currentDraftId) {
        const existingDrafts = JSON.parse(localStorage.getItem('contentBuilderDrafts') || '[]');
        const filteredDrafts = existingDrafts.filter(d => d.id !== currentDraftId);
        localStorage.setItem('contentBuilderDrafts', JSON.stringify(filteredDrafts));
      }
      
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return (
    <div className="content-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="header-left">
          <h1>Content Builder</h1>
          <p>Create engaging e-learning content with drag-and-drop simplicity</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowTemplateLibrary(true)}
          >
            📚 Templates
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={publishCourse}
            disabled={loading || !courseData.title}
          >
            {loading ? 'Publishing...' : 'Publish Course'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to Courses
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="builder-tabs">
        <button 
          className={`tab-button ${activeTab === 'design' ? 'active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          Design
        </button>
        <button 
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button 
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      {/* Main Content */}
      <div className="builder-content">
        {activeTab === 'design' && (
          <div className="design-workspace">
            {/* Left Panel - Course Structure */}
            <div className="structure-panel">
              <div className="panel-header">
                <h3>Course Structure</h3>
                <button className="add-module-btn" onClick={addModule} title="Add Module">
                  +
                </button>
              </div>
              
              {/* Course Info */}
              <div className="course-info">
                <div className="field-group">
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    className="course-title-input"
                  />
                </div>
                <div className="field-group">
                  <textarea
                    placeholder="Course Description"
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                    className="course-description-input"
                    rows="3"
                  />
                </div>
              </div>

              {/* Module Tree */}
              <div className="module-tree">
                <div className="tree-header">
                  <span>Modules & Lessons</span>
                </div>
                
                {courseData.modules.length === 0 ? (
                  <div className="empty-tree">
                    <div className="empty-icon">📚</div>
                    <p>No modules yet</p>
                    <small>Click + to add your first module</small>
                  </div>
                ) : (
                  <div className="tree-items">
                    {courseData.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="module-item">
                        <div 
                          className={`module-header ${selectedModule === module.id ? 'selected' : ''}`}
                          onClick={() => setSelectedModule(module.id)}
                        >
                          <div className="module-expand">
                            <span>▼</span>
                          </div>
                          <div className="module-icon">
                            📁
                          </div>
                          <div className="module-details">
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => {
                                e.stopPropagation();
                                setCourseData(prev => ({
                                  ...prev,
                                  modules: prev.modules.map(m =>
                                    m.id === module.id ? { ...m, title: e.target.value } : m
                                  )
                                }));
                              }}
                              className="module-title"
                              placeholder="Module Title"
                            />
                            <div className="module-meta">
                              {module.elements.length} lesson{module.elements.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="module-actions">
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteModule(module.id);
                              }}
                              title="Delete Module"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        {/* Module Elements */}
                        <div className="module-elements">
                          {module.elements.map((element, elementIndex) => (
                            <div
                              key={element.id}
                              className={`element-item ${selectedElement === element.id ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModule(module.id);
                                setSelectedElement(element.id);
                              }}
                            >
                              <div className="element-indent"></div>
                              <div className="element-icon">
                                {elementTypes[element.type]?.icon}
                              </div>
                              <div className="element-details">
                                <div className="element-name">
                                  {elementTypes[element.type]?.name} {elementIndex + 1}
                                </div>
                                <div className="element-preview">
                                  {element.type === 'text' && (element.content.text?.substring(0, 30) + '...' || 'Empty text')}
                                  {element.type === 'heading' && (element.content.text || 'Empty heading')}
                                  {element.type === 'quiz' && (element.content.question?.substring(0, 30) + '...' || 'Empty quiz')}
                                  {element.type === 'image' && (element.content.alt || 'Image element')}
                                  {element.type === 'video' && 'Video element'}
                                  {element.type === 'audio' && 'Audio element'}
                                  {!['text', 'heading', 'quiz', 'image', 'video', 'audio'].includes(element.type) && 'Interactive element'}
                                </div>
                              </div>
                              <div className="element-actions">
                                <button
                                  className="delete-btn-small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(module.id, element.id);
                                  }}
                                  title="Delete Element"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center Panel - Properties & Editing */}
            <div className="properties-panel-main">
              <div className="properties-header">
                <div className="properties-title">
                  {selectedElement && selectedModule ? (
                    <>
                      <span className="editing-element">
                        Editing: {elementTypes[courseData.modules.find(m => m.id === selectedModule)?.elements.find(e => e.id === selectedElement)?.type]?.name}
                      </span>
                      <span className="element-info">
                        in {courseData.modules.find(m => m.id === selectedModule)?.title}
                      </span>
                    </>
                  ) : selectedModule ? (
                    <span className="no-element-selected">
                      Select an element to edit its properties
                    </span>
                  ) : (
                    <span className="no-module-selected">
                      Select a module and element to start editing
                    </span>
                  )}
                </div>
                <div className="properties-actions">
                  {selectedModule && (
                    <>
                      <button className="properties-btn" onClick={() => setPreviewMode(!previewMode)}>
                        {previewMode ? 'Edit' : 'Preview'}
                      </button>
                      <button className="properties-btn primary" onClick={publishCourse} disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Course'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="properties-content-main">
                {selectedElement && selectedModule ? (
                  <div className="element-editor">
                    {/* Element Preview */}
                    <div className="element-preview-section">
                      <h4>Preview</h4>
                      <div className="preview-container-inline">
                        <ElementPreview 
                          element={courseData.modules.find(m => m.id === selectedModule)?.elements.find(e => e.id === selectedElement)} 
                        />
                      </div>
                    </div>

                    {/* Element Properties */}
                    <div className="element-properties-section">
                      <h4>Properties</h4>
                      <ElementProperties
                        element={courseData.modules.find(m => m.id === selectedModule)?.elements.find(e => e.id === selectedElement)}
                        onUpdate={(updates) => updateElement(selectedModule, selectedElement, updates)}
                      />
                    </div>
                    
                    {/* Add Element Drop Zone */}
                    <div 
                      className="editor-add-element-zone"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, selectedModule)}
                    >
                      <div className="editor-drop-content">
                        <span className="drop-icon">➕</span>
                        <span>Drop here to add another element to this module</span>
                      </div>
                    </div>
                  </div>
                ) : selectedModule ? (
                  <div className="module-overview">
                    <div className="module-overview-header">
                      <h3>{courseData.modules.find(m => m.id === selectedModule)?.title}</h3>
                      <p>{courseData.modules.find(m => m.id === selectedModule)?.elements.length} elements in this module</p>
                    </div>

                    {courseData.modules.find(m => m.id === selectedModule)?.elements.length === 0 ? (
                      <div 
                        className="empty-module-content"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, selectedModule)}
                      >
                        <div className="empty-icon">📝</div>
                        <h4>This module is empty</h4>
                        <p>Add content elements from the right panel to build your lesson</p>
                        <div className="drop-zone-indicator">
                          <span>💫</span>
                          <span>Drag elements here or use quick add buttons</span>
                        </div>
                        <div className="quick-add-section">
                          <span>Quick add: </span>
                          {Object.entries(elementTypes).slice(0, 4).map(([type, config]) => (
                            <button
                              key={type}
                              className="quick-add-btn"
                              onClick={() => addElement(type, selectedModule)}
                              title={`Add ${config.name}`}
                            >
                              {config.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="module-elements-overview">
                        <div className="elements-header">
                          <h4>Module Elements</h4>
                          <div 
                            className="add-element-drop-zone"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, selectedModule)}
                          >
                            <span>+ Drop new element here</span>
                          </div>
                        </div>
                        <div className="elements-list">
                          {courseData.modules.find(m => m.id === selectedModule)?.elements.map((element, index) => (
                            <div
                              key={element.id}
                              className={`element-overview-card ${selectedElement === element.id ? 'selected' : ''}`}
                              onClick={() => setSelectedElement(element.id)}
                            >
                              <div className="element-card-header">
                                <span className="element-icon-large">
                                  {elementTypes[element.type]?.icon}
                                </span>
                                <div className="element-card-info">
                                  <div className="element-card-title">
                                    {elementTypes[element.type]?.name} {index + 1}
                                  </div>
                                  <div className="element-card-preview">
                                    {element.type === 'text' && (element.content.text?.substring(0, 50) + '...' || 'Empty text')}
                                    {element.type === 'heading' && (element.content.text || 'Empty heading')}
                                    {element.type === 'quiz' && (element.content.question?.substring(0, 50) + '...' || 'Empty quiz')}
                                    {element.type === 'image' && (element.content.alt || 'Image element')}
                                    {element.type === 'video' && 'Video element'}
                                    {element.type === 'audio' && 'Audio element'}
                                    {!['text', 'heading', 'quiz', 'image', 'video', 'audio'].includes(element.type) && 'Interactive element'}
                                  </div>
                                </div>
                              </div>
                              <button
                                className="element-card-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(selectedModule, element.id);
                                }}
                                title="Delete element"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                          
                          {/* Drop zone at the end of elements list */}
                          <div 
                            className="elements-list-drop-zone"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, selectedModule)}
                          >
                            <div className="drop-zone-content">
                              <span className="drop-icon">📦</span>
                              <span>Drop here to add new element</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-selection-state">
                    <div className="no-selection-icon">📚</div>
                    <h3>No Module Selected</h3>
                    <p>Select a module from the left panel to start editing content</p>
                    <button className="create-module-btn" onClick={addModule}>
                      Create Your First Module
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Elements Library Only */}
            <div className="elements-panel">
              <div className="panel-header">
                <h3>Add Elements</h3>
              </div>

              <div className="elements-library">
                <div className="element-category">
                  <div className="category-title">Basic Elements</div>
                  <div className="elements-grid">
                    {Object.entries(elementTypes).slice(0, 6).map(([type, config]) => (
                      <div
                        key={type}
                        className="element-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        onDragEnd={handleDragEnd}
                        onClick={() => selectedModule && addElement(type, selectedModule)}
                        title={`Add ${config.name}`}
                      >
                        <div className="card-icon">
                          {config.icon}
                        </div>
                        <div className="card-name">
                          {config.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="element-category">
                  <div className="category-title">Interactive</div>
                  <div className="elements-grid">
                    {Object.entries(elementTypes).slice(6).map(([type, config]) => (
                      <div
                        key={type}
                        className="element-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        onDragEnd={handleDragEnd}
                        onClick={() => selectedModule && addElement(type, selectedModule)}
                        title={`Add ${config.name}`}
                      >
                        <div className="card-icon">
                          {config.icon}
                        </div>
                        <div className="card-name">
                          {config.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {!selectedModule && (
                  <div className="elements-disabled-overlay">
                    <div className="overlay-content">
                      <span>📝</span>
                      <p>Select a module to add elements</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content remains the same */}
        {activeTab === 'content' && (
          <div className="content-view">
            <h3>Content Management</h3>
            <p>Manage your course content, assets, and resources here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-view">
            <h3>Course Settings</h3>
            <div className="settings-form">
              <div className="form-group">
                <label>Theme</label>
                <select 
                  value={courseData.settings.theme}
                  onChange={(e) => setCourseData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, theme: e.target.value }
                  }))}
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-view">
            <div className="preview-container">
              <iframe 
                srcDoc={generateHTML()}
                className="preview-iframe"
                title="Course Preview"
              />
            </div>
          </div>
        )}
      </div>

      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={() => {}}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </div>
  );
};

// Element Preview Component
const ElementPreview = ({ element }) => {
  const { type, content } = element;

  switch (type) {
    case 'text':
      return <div className="text-preview">{content.text || 'Enter your text here...'}</div>;
    
    case 'heading':
      const HeadingTag = `h${content.level || 2}`;
      return React.createElement(HeadingTag, { className: 'heading-preview' }, content.text || 'New Heading');
    
    case 'quiz':
      return (
        <div className="quiz-preview">
          <div className="quiz-question">
            <strong>Q:</strong> {content.question || 'Enter your question'}
          </div>
          <div className="quiz-options">
            {(content.options || []).map((option, idx) => (
              <div key={idx} className="quiz-option">
                <input type="radio" disabled />
                <span>{option || `Option ${idx + 1}`}</span>
                {content.correct === idx && <span className="correct-mark">✓</span>}
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'image':
      return (
        <div className="image-preview">
          {content.src ? (
            <img src={content.src} alt={content.alt || ''} className="preview-image" />
          ) : (
            <div className="image-placeholder">
              <span>🖼️</span>
              <span>No image selected</span>
            </div>
          )}
          {content.caption && <div className="image-caption">{content.caption}</div>}
        </div>
      );
    
    case 'video':
      return (
        <div className="video-preview">
          {content.src ? (
            <video src={content.src} controls className="preview-video" />
          ) : (
            <div className="video-placeholder">
              <span>🎬</span>
              <span>No video selected</span>
            </div>
          )}
        </div>
      );
    
    case 'audio':
      return (
        <div className="audio-preview">
          {content.src ? (
            <audio src={content.src} controls className="preview-audio" />
          ) : (
            <div className="audio-placeholder">
              <span>🎵</span>
              <span>No audio selected</span>
            </div>
          )}
        </div>
      );
    
    default:
      return (
        <div className="default-preview">
          <div className="preview-placeholder">
            <span>{elementTypes[type]?.icon}</span>
            <span>Configure {elementTypes[type]?.name}</span>
            <small>Click to edit properties</small>
          </div>
        </div>
      );
  }
};

// Element Properties Component (Enhanced)
const ElementProperties = ({ element, onUpdate }) => {
  if (!element) return <p>Select an element to edit its properties</p>;

  const handleContentChange = (field, value) => {
    onUpdate({
      content: { ...element.content, [field]: value }
    });
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      onUpdate({
        content: { 
          ...element.content, 
          [field]: fileURL,
          [`${field}_file`]: file 
        }
      });
    }
  };

  const addQuizOption = () => {
    const currentOptions = element.content.options || [];
    const newOptions = [...currentOptions, ''];
    handleContentChange('options', newOptions);
  };

  const removeQuizOption = (index) => {
    const currentOptions = element.content.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    handleContentChange('options', newOptions);
    
    // Adjust correct answer if it was the removed option
    if (element.content.correct === index) {
      handleContentChange('correct', Math.max(0, index - 1));
    } else if (element.content.correct > index) {
      handleContentChange('correct', element.content.correct - 1);
    }
  };

  const addAccordionItem = () => {
    const currentItems = element.content.items || [];
    const newItems = [...currentItems, { title: 'New Section', content: 'Add content here' }];
    handleContentChange('items', newItems);
  };

  const removeAccordionItem = (index) => {
    const currentItems = element.content.items || [];
    const newItems = currentItems.filter((_, i) => i !== index);
    handleContentChange('items', newItems);
  };

  const updateAccordionItem = (index, field, value) => {
    const currentItems = element.content.items || [];
    const newItems = [...currentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    handleContentChange('items', newItems);
  };

  return (
    <div className="element-properties">
      <div className="properties-header">
        <h4>{elementTypes[element.type]?.name} Properties</h4>
        <div className="element-actions">
          <button 
            className="btn-small secondary"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(element.content))}
            title="Copy element"
          >
            📋
          </button>
        </div>
      </div>
      
      {/* Text Element */}
      {element.type === 'text' && (
        <>
          <div className="form-group">
            <label>Text Content</label>
            <textarea
              value={element.content.text || ''}
              onChange={(e) => handleContentChange('text', e.target.value)}
              rows="6"
              placeholder="Enter your text content here..."
              className="rich-textarea"
            />
          </div>
          <div className="form-group">
            <label>Text Alignment</label>
            <div className="alignment-buttons">
              {['left', 'center', 'right', 'justify'].map(align => (
                <button
                  key={align}
                  className={`alignment-btn ${element.content.alignment === align ? 'active' : ''}`}
                  onClick={() => handleContentChange('alignment', align)}
                  title={`Align ${align}`}
                >
                  {align === 'left' ? '⬅️' : align === 'center' ? '↔️' : align === 'right' ? '➡️' : '📄'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Font Size</label>
            <select
              value={element.content.fontSize || 'medium'}
              onChange={(e) => handleContentChange('fontSize', e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
        </>
      )}
      
      {/* Heading Element */}
      {element.type === 'heading' && (
        <>
          <div className="form-group">
            <label>Heading Text</label>
            <input
              type="text"
              value={element.content.text || ''}
              onChange={(e) => handleContentChange('text', e.target.value)}
              placeholder="Enter heading text"
              className="heading-input"
            />
          </div>
          <div className="form-group">
            <label>Heading Level</label>
            <div className="heading-level-buttons">
              {[1, 2, 3, 4, 5, 6].map(level => (
                <button
                  key={level}
                  className={`level-btn ${element.content.level === level ? 'active' : ''}`}
                  onClick={() => handleContentChange('level', level)}
                >
                  H{level}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Text Alignment</label>
            <div className="alignment-buttons">
              {['left', 'center', 'right'].map(align => (
                <button
                  key={align}
                  className={`alignment-btn ${element.content.alignment === align ? 'active' : ''}`}
                  onClick={() => handleContentChange('alignment', align)}
                  title={`Align ${align}`}
                >
                  {align === 'left' ? '⬅️' : align === 'center' ? '↔️' : '➡️'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Image Element */}
      {element.type === 'image' && (
        <>
          <div className="form-group">
            <label>Image Source</label>
            <div className="file-input-group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('src', e.target.files[0])}
                className="file-input"
                id={`image-${element.id}`}
              />
              <label htmlFor={`image-${element.id}`} className="file-input-label">
                📁 Choose Image
              </label>
              <span className="file-info">
                {element.content.src_file?.name || 'No file selected'}
              </span>
            </div>
            <div className="url-option">
              <span>Or enter URL:</span>
              <input
                type="url"
                value={element.content.src || ''}
                onChange={(e) => handleContentChange('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Alt Text</label>
            <input
              type="text"
              value={element.content.alt || ''}
              onChange={(e) => handleContentChange('alt', e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>
          <div className="form-group">
            <label>Caption (Optional)</label>
            <input
              type="text"
              value={element.content.caption || ''}
              onChange={(e) => handleContentChange('caption', e.target.value)}
              placeholder="Image caption"
            />
          </div>
          <div className="form-group">
            <label>Image Size</label>
            <select
              value={element.content.size || 'medium'}
              onChange={(e) => handleContentChange('size', e.target.value)}
            >
              <option value="small">Small (300px)</option>
              <option value="medium">Medium (600px)</option>
              <option value="large">Large (900px)</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        </>
      )}

      {/* Video Element */}
      {element.type === 'video' && (
        <>
          <div className="form-group">
            <label>Video Source</label>
            <div className="file-input-group">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload('src', e.target.files[0])}
                className="file-input"
                id={`video-${element.id}`}
              />
              <label htmlFor={`video-${element.id}`} className="file-input-label">
                📁 Choose Video
              </label>
              <span className="file-info">
                {element.content.src_file?.name || 'No file selected'}
              </span>
            </div>
            <div className="url-option">
              <span>Or enter URL:</span>
              <input
                type="url"
                value={element.content.src || ''}
                onChange={(e) => handleContentChange('src', e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Video Options</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={element.content.controls !== false}
                  onChange={(e) => handleContentChange('controls', e.target.checked)}
                />
                Show Controls
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={element.content.autoplay || false}
                  onChange={(e) => handleContentChange('autoplay', e.target.checked)}
                />
                Auto Play
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={element.content.loop || false}
                  onChange={(e) => handleContentChange('loop', e.target.checked)}
                />
                Loop
              </label>
            </div>
          </div>
        </>
      )}

      {/* Audio Element */}
      {element.type === 'audio' && (
        <>
          <div className="form-group">
            <label>Audio Source</label>
            <div className="file-input-group">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload('src', e.target.files[0])}
                className="file-input"
                id={`audio-${element.id}`}
              />
              <label htmlFor={`audio-${element.id}`} className="file-input-label">
                📁 Choose Audio
              </label>
              <span className="file-info">
                {element.content.src_file?.name || 'No file selected'}
              </span>
            </div>
            <div className="url-option">
              <span>Or enter URL:</span>
              <input
                type="url"
                value={element.content.src || ''}
                onChange={(e) => handleContentChange('src', e.target.value)}
                placeholder="https://example.com/audio.mp3"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Audio Options</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={element.content.controls !== false}
                  onChange={(e) => handleContentChange('controls', e.target.checked)}
                />
                Show Controls
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={element.content.autoplay || false}
                  onChange={(e) => handleContentChange('autoplay', e.target.checked)}
                />
                Auto Play
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={element.content.loop || false}
                  onChange={(e) => handleContentChange('loop', e.target.checked)}
                />
                Loop
              </label>
            </div>
          </div>
        </>
      )}
      
      {/* Quiz Element */}
      {element.type === 'quiz' && (
        <>
          <div className="form-group">
            <label>Question</label>
            <textarea
              value={element.content.question || ''}
              onChange={(e) => handleContentChange('question', e.target.value)}
              rows="3"
              placeholder="Enter your question here"
              className="question-textarea"
            />
          </div>
          <div className="form-group">
            <div className="options-header">
              <label>Answer Options</label>
              <button 
                className="btn-small primary"
                onClick={addQuizOption}
                disabled={(element.content.options || []).length >= 6}
              >
                ➕ Add Option
              </button>
            </div>
            <div className="quiz-options-editor">
              {(element.content.options || []).map((option, index) => (
                <div key={index} className="option-editor">
                  <div className="option-controls">
                    <input
                      type="radio"
                      name={`correct-answer-${element.id}`}
                      checked={element.content.correct === index}
                      onChange={() => handleContentChange('correct', index)}
                      title="Mark as correct answer"
                    />
                    <span className="option-number">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={option || ''}
                    onChange={(e) => {
                      const newOptions = [...(element.content.options || [])];
                      newOptions[index] = e.target.value;
                      handleContentChange('options', newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="option-input"
                  />
                  <button
                    className="btn-small danger"
                    onClick={() => removeQuizOption(index)}
                    disabled={(element.content.options || []).length <= 2}
                    title="Remove option"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Feedback Messages</label>
            <div className="feedback-inputs">
              <div className="feedback-item">
                <span className="feedback-label">✅ Correct Answer:</span>
                <input
                  type="text"
                  value={element.content.feedback?.correct || ''}
                  onChange={(e) => handleContentChange('feedback', {
                    ...element.content.feedback,
                    correct: e.target.value
                  })}
                  placeholder="Great job!"
                />
              </div>
              <div className="feedback-item">
                <span className="feedback-label">❌ Incorrect Answer:</span>
                <input
                  type="text"
                  value={element.content.feedback?.incorrect || ''}
                  onChange={(e) => handleContentChange('feedback', {
                    ...element.content.feedback,
                    incorrect: e.target.value
                  })}
                  placeholder="Try again!"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Accordion Element */}
      {element.type === 'accordion' && (
        <div className="form-group">
          <div className="options-header">
            <label>Accordion Sections</label>
            <button 
              className="btn-small primary"
              onClick={addAccordionItem}
            >
              ➕ Add Section
            </button>
          </div>
          <div className="accordion-editor">
            {(element.content.items || []).map((item, index) => (
              <div key={index} className="accordion-item-editor">
                <div className="accordion-header">
                  <span className="section-number">Section {index + 1}</span>
                  <button
                    className="btn-small danger"
                    onClick={() => removeAccordionItem(index)}
                    disabled={(element.content.items || []).length <= 1}
                  >
                    🗑️
                  </button>
                </div>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateAccordionItem(index, 'title', e.target.value)}
                  placeholder="Section title"
                  className="section-title-input"
                />
                <textarea
                  value={item.content || ''}
                  onChange={(e) => updateAccordionItem(index, 'content', e.target.value)}
                  placeholder="Section content"
                  rows="3"
                  className="section-content-textarea"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default/Other Elements */}
      {!['text', 'heading', 'image', 'video', 'audio', 'quiz', 'accordion'].includes(element.type) && (
        <div className="form-group">
          <label>Configuration</label>
          <p className="element-info">
            Advanced settings for {elementTypes[element.type]?.name} will be available in future updates.
          </p>
          <textarea
            value={JSON.stringify(element.content, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onUpdate({ content: parsed });
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
            rows="6"
            placeholder="Raw JSON configuration"
            className="json-editor"
          />
        </div>
      )}
    </div>
  );
};

export default ContentBuilder;