import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCourse.css';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [modules, setModules] = useState([
    {
      id: 1,
      title: 'Introduction',
      description: 'Course introduction and overview',
      items: [
        { id: 1, type: 'content', title: 'Welcome to the Course', content: '' }
      ]
    }
  ]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [itemContent, setItemContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming with this structured course',
      modules: [
        {
          id: 101,
          title: 'Getting Started',
          description: 'Introduction to programming concepts',
          items: [
            { id: 1001, type: 'content', title: 'Welcome to Programming', content: 'This course will teach you the fundamentals of programming.' },
            { id: 1002, type: 'video', title: 'How to Think Like a Programmer', videoUrl: 'https://www.youtube.com/embed/azcrPFhaY9k' },
            { 
              id: 1003, 
              type: 'quiz', 
              title: 'Programming Basics Quiz', 
              content: 'Test your understanding of programming fundamentals.',
              questions: [
                {
                  id: 10031,
                  text: 'What is a variable in programming?',
                  type: 'multiple-choice',
                  options: [
                    { id: 100311, text: 'A storage location paired with an associated name', isCorrect: true },
                    { id: 100312, text: 'A mathematical operation', isCorrect: false },
                    { id: 100313, text: 'A type of program', isCorrect: false },
                    { id: 100314, text: 'A hardware component', isCorrect: false }
                  ]
                },
                {
                  id: 10032,
                  text: 'Which of the following are programming languages?',
                  type: 'checkbox',
                  options: [
                    { id: 100321, text: 'Python', isCorrect: true },
                    { id: 100322, text: 'Microsoft Word', isCorrect: false },
                    { id: 100323, text: 'JavaScript', isCorrect: true },
                    { id: 100324, text: 'Instagram', isCorrect: false }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 102,
          title: 'Variables and Data Types',
          description: 'Understanding how to store and manipulate data',
          items: [
            { id: 1004, type: 'content', title: 'Introduction to Variables', content: 'Learn how variables store information in programming.' },
            { id: 1005, type: 'video', title: 'Working with Data Types', videoUrl: 'https://www.youtube.com/embed/A37-3lflh8I' },
            { 
              id: 1006, 
              type: 'quiz', 
              title: 'Variables Quiz', 
              content: 'Test your knowledge of variables and data types.',
              questions: [
                {
                  id: 10061,
                  text: 'Which of the following is a valid variable name in most programming languages?',
                  type: 'multiple-choice',
                  options: [
                    { id: 100611, text: 'user_age', isCorrect: true },
                    { id: 100612, text: '2names', isCorrect: false },
                    { id: 100613, text: 'class!', isCorrect: false },
                    { id: 100614, text: 'user name', isCorrect: false }
                  ]
                },
                {
                  id: 10062,
                  text: 'What data type would be best for storing a person\'s age?',
                  type: 'multiple-choice',
                  options: [
                    { id: 100621, text: 'Integer', isCorrect: true },
                    { id: 100622, text: 'String', isCorrect: false },
                    { id: 100623, text: 'Boolean', isCorrect: false },
                    { id: 100624, text: 'Array', isCorrect: false }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Web Development Fundamentals',
      description: 'Learn HTML, CSS and JavaScript basics',
      modules: [
        {
          id: 201,
          title: 'HTML Basics',
          description: 'Learn the foundation of web pages',
          items: [
            { id: 2001, type: 'content', title: 'Introduction to HTML', content: 'HTML is the standard markup language for Web pages.' },
            { id: 2002, type: 'video', title: 'Building Your First Webpage', videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg' },
            { 
              id: 2003, 
              type: 'quiz', 
              title: 'HTML Elements Quiz', 
              content: 'Test your knowledge of HTML elements and structure.',
              questions: [
                {
                  id: 20031,
                  text: 'What does HTML stand for?',
                  type: 'multiple-choice',
                  options: [
                    { id: 200311, text: 'Hyper Text Markup Language', isCorrect: true },
                    { id: 200312, text: 'Home Tool Markup Language', isCorrect: false },
                    { id: 200313, text: 'Hyperlinks and Text Markup Language', isCorrect: false },
                    { id: 200314, text: 'High Tech Modern Language', isCorrect: false }
                  ]
                },
                {
                  id: 20032,
                  text: 'Which tag is used to create a hyperlink in HTML?',
                  type: 'multiple-choice',
                  options: [
                    { id: 200321, text: '<a>', isCorrect: true },
                    { id: 200322, text: '<h1>', isCorrect: false },
                    { id: 200323, text: '<p>', isCorrect: false },
                    { id: 200324, text: '<link>', isCorrect: false }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 202,
          title: 'CSS Styling',
          description: 'Make your websites look great',
          items: [
            { id: 2004, type: 'content', title: 'CSS Selectors and Properties', content: 'Learn how to target and style HTML elements.' },
            { id: 2005, type: 'video', title: 'CSS Box Model Explained', videoUrl: 'https://www.youtube.com/embed/rIO5326FgPE' },
            { 
              id: 2006, 
              type: 'quiz', 
              title: 'CSS Quiz', 
              content: 'Test your understanding of CSS concepts.',
              questions: [
                {
                  id: 20061,
                  text: 'Which CSS property is used to change the text color?',
                  type: 'multiple-choice',
                  options: [
                    { id: 200611, text: 'color', isCorrect: true },
                    { id: 200612, text: 'text-color', isCorrect: false },
                    { id: 200613, text: 'font-color', isCorrect: false },
                    { id: 200614, text: 'background-color', isCorrect: false }
                  ]
                },
                {
                  id: 20062,
                  text: 'Which of the following are valid CSS selectors?',
                  type: 'checkbox',
                  options: [
                    { id: 200621, text: '#header', isCorrect: true },
                    { id: 200622, text: '.container', isCorrect: true },
                    { id: 200623, text: '*column', isCorrect: false },
                    { id: 200624, text: 'p.intro', isCorrect: true }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Data Science Introduction',
      description: 'Learn the basics of data analysis and visualization',
      modules: [
        {
          id: 301,
          title: 'Data Analysis Fundamentals',
          description: 'Understanding data and analysis techniques',
          items: [
            { id: 3001, type: 'content', title: 'What is Data Science', content: 'Introduction to the field of data science and its applications.' },
            { id: 3002, type: 'video', title: 'Data Analysis Process', videoUrl: 'https://www.youtube.com/embed/EF_1Oes5-xk' },
            { 
              id: 3003, 
              type: 'quiz', 
              title: 'Data Science Fundamentals Quiz', 
              content: 'Test your understanding of data science concepts.',
              questions: [
                {
                  id: 30031,
                  text: 'Which of the following is NOT a step in the data analysis process?',
                  type: 'multiple-choice',
                  options: [
                    { id: 300311, text: 'Selling the data to third parties', isCorrect: true },
                    { id: 300312, text: 'Data collection', isCorrect: false },
                    { id: 300313, text: 'Data cleaning', isCorrect: false },
                    { id: 300314, text: 'Data visualization', isCorrect: false }
                  ]
                },
                {
                  id: 30032,
                  text: 'Which tools are commonly used in data science?',
                  type: 'checkbox',
                  options: [
                    { id: 300321, text: 'Python', isCorrect: true },
                    { id: 300322, text: 'R', isCorrect: true },
                    { id: 300323, text: 'Microsoft Word', isCorrect: false },
                    { id: 300324, text: 'Tableau', isCorrect: true }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 302,
          title: 'Data Visualization',
          description: 'Creating effective visual representations of data',
          items: [
            { id: 3004, type: 'content', title: 'Introduction to Data Visualization', content: 'Learn the importance of effective data visualization.' },
            { id: 3005, type: 'video', title: 'Creating Charts and Graphs', videoUrl: 'https://www.youtube.com/embed/hs-cLHlRYmY' },
            { id: 3006, type: 'image', title: 'Chart Types', caption: 'Common types of data visualization charts', imageUrl: 'https://i.imgur.com/7OsZfsx.png' },
            { 
              id: 3007, 
              type: 'quiz', 
              title: 'Visualization Quiz', 
              content: 'Test your knowledge of data visualization techniques.',
              questions: [
                {
                  id: 30071,
                  text: 'Which chart type is best for showing the distribution of a continuous variable?',
                  type: 'multiple-choice',
                  options: [
                    { id: 300711, text: 'Histogram', isCorrect: true },
                    { id: 300712, text: 'Pie chart', isCorrect: false },
                    { id: 300713, text: 'Bar chart', isCorrect: false },
                    { id: 300714, text: 'Scatter plot', isCorrect: false }
                  ]
                },
                {
                  id: 30072,
                  text: 'Which of the following are principles of good data visualization?',
                  type: 'checkbox',
                  options: [
                    { id: 300721, text: 'Clear labeling', isCorrect: true },
                    { id: 300722, text: 'Using as many colors as possible', isCorrect: false },
                    { id: 300723, text: 'Minimizing chart junk', isCorrect: true },
                    { id: 300724, text: 'Always using 3D effects', isCorrect: false }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Handle cover image upload
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for content
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        // Update the current item with the image
        if (modules[currentModuleIndex] && modules[currentModuleIndex].items[currentItemIndex]) {
          handleItemChange(currentModuleIndex, currentItemIndex, 'imageUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle PDF upload
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setPdfName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPdfUrl(reader.result);
        // Update the current item with the PDF
        if (modules[currentModuleIndex] && modules[currentModuleIndex].items[currentItemIndex]) {
          handleItemChange(currentModuleIndex, currentItemIndex, 'pdfUrl', reader.result);
          handleItemChange(currentModuleIndex, currentItemIndex, 'pdfName', file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video upload from computer
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoName(file.name);
      const videoUrl = URL.createObjectURL(file);
      // Update the current item with the video
      if (modules[currentModuleIndex] && modules[currentModuleIndex].items[currentItemIndex]) {
        handleItemChange(currentModuleIndex, currentItemIndex, 'videoUrl', videoUrl);
        handleItemChange(currentModuleIndex, currentItemIndex, 'videoName', file.name);
        handleItemChange(currentModuleIndex, currentItemIndex, 'videoType', 'file');
      }
    }
  };

  // Add a new module to the course
  const handleAddModule = () => {
    const newModule = {
      id: Date.now(),
      title: `Module ${modules.length + 1}`,
      description: '',
      items: []
    };
    setModules([...modules, newModule]);
    // Set focus to the new module
    setCurrentModuleIndex(modules.length);
    setCurrentItemIndex(0);
  };

  // Update module title or description
  const handleModuleChange = (moduleIndex, field, value) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex][field] = value;
    setModules(updatedModules);
  };

  // Add a new item to a module
  const handleAddItem = (moduleIndex, type) => {
    const updatedModules = [...modules];
    const newItem = {
      id: Date.now(),
      type,
      title: type === 'quiz' ? 'Quiz' : 
             type === 'video' ? 'Video Lesson' : 
             type === 'image' ? 'Image Content' :
             type === 'pdf' ? 'PDF Document' : 'New Lesson',
      content: '',
      videoUrl: type === 'video' ? '' : undefined,
      imageUrl: type === 'image' ? '' : undefined,
      pdfUrl: type === 'pdf' ? '' : undefined,
      pdfName: type === 'pdf' ? '' : undefined,
      questions: type === 'quiz' ? [] : undefined
    };
    updatedModules[moduleIndex].items.push(newItem);
    setModules(updatedModules);
    // Set focus to the new item
    setCurrentModuleIndex(moduleIndex);
    setCurrentItemIndex(updatedModules[moduleIndex].items.length - 1);
    
    // Clear related state based on type
    if (type !== 'video') setVideoUrl('');
    if (type !== 'image') {
      setImageUrl('');
      setImagePreview('');
      setImageFile(null);
    }
    if (type !== 'pdf') {
      setPdfUrl('');
      setPdfFile(null);
      setPdfName('');
    }
  };

  // Update item title, content, or videoUrl
  const handleItemChange = (moduleIndex, itemIndex, field, value) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].items[itemIndex][field] = value;
    setModules(updatedModules);
    
    // Update videoUrl state if changing video URL
    if (field === 'videoUrl') {
      setVideoUrl(value);
    }
  };

  // Add a quiz question to an item
  const handleAddQuizQuestion = (moduleIndex, itemIndex) => {
    const updatedModules = [...modules];
    const currentItem = updatedModules[moduleIndex].items[itemIndex];
    
    if (!currentItem.questions) {
      currentItem.questions = [];
    }
    
    currentItem.questions.push({
      id: Date.now(),
      text: '',
      type: 'multiple-choice',
      options: [
        { id: Date.now() + 1, text: '', isCorrect: false },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ]
    });
    
    setModules(updatedModules);
  };

  // Update a quiz question
  const handleQuestionChange = (moduleIndex, itemIndex, questionIndex, field, value) => {
    const updatedModules = [...modules];
    const currentItem = updatedModules[moduleIndex].items[itemIndex];
    
    if (currentItem.questions && currentItem.questions[questionIndex]) {
      currentItem.questions[questionIndex][field] = value;
      setModules(updatedModules);
    }
  };

  // Add an option to a quiz question
  const handleAddQuestionOption = (moduleIndex, itemIndex, questionIndex) => {
    const updatedModules = [...modules];
    const currentItem = updatedModules[moduleIndex].items[itemIndex];
    
    if (currentItem.questions && currentItem.questions[questionIndex]) {
      currentItem.questions[questionIndex].options.push({
        id: Date.now(),
        text: '',
        isCorrect: false
      });
      setModules(updatedModules);
    }
  };

  // Update a question option
  const handleOptionChange = (moduleIndex, itemIndex, questionIndex, optionIndex, field, value) => {
    const updatedModules = [...modules];
    const currentItem = updatedModules[moduleIndex].items[itemIndex];
    
    if (currentItem.questions && 
        currentItem.questions[questionIndex] && 
        currentItem.questions[questionIndex].options && 
        currentItem.questions[questionIndex].options[optionIndex]) {
      
      currentItem.questions[questionIndex].options[optionIndex][field] = value;
      
      // If marking an option as correct in multiple choice, mark others as incorrect
      if (field === 'isCorrect' && value === true && currentItem.questions[questionIndex].type === 'multiple-choice') {
        currentItem.questions[questionIndex].options.forEach((option, idx) => {
          if (idx !== optionIndex) {
            option.isCorrect = false;
          }
        });
      }
      
      setModules(updatedModules);
    }
  };

  // Remove a question
  const handleRemoveQuestion = (moduleIndex, itemIndex, questionIndex) => {
    const updatedModules = [...modules];
    const currentItem = updatedModules[moduleIndex].items[itemIndex];
    
    if (currentItem.questions) {
      currentItem.questions.splice(questionIndex, 1);
      setModules(updatedModules);
    }
  };

  // Remove an option from a question
  const handleRemoveOption = (moduleIndex, itemIndex, questionIndex, optionIndex) => {
    const updatedModules = [...modules];
    const currentItem = updatedModules[moduleIndex].items[itemIndex];
    
    if (currentItem.questions && 
        currentItem.questions[questionIndex] && 
        currentItem.questions[questionIndex].options) {
      
      // Don't allow removing if there are only 2 options
      if (currentItem.questions[questionIndex].options.length <= 2) {
        return;
      }
      
      currentItem.questions[questionIndex].options.splice(optionIndex, 1);
      setModules(updatedModules);
    }
  };

  // Remove an item from a module
  const handleRemoveItem = (moduleIndex, itemIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].items.splice(itemIndex, 1);
    setModules(updatedModules);
  };

  // Remove a module
  const handleRemoveModule = (moduleIndex) => {
    if (modules.length > 1) {
      const updatedModules = [...modules];
      updatedModules.splice(moduleIndex, 1);
      setModules(updatedModules);
      setCurrentModuleIndex(Math.max(0, moduleIndex - 1));
    }
  };

  // Save the course
  const handleSaveCourse = async () => {
    if (!title) {
      alert('Please enter a course title');
      return;
    }
    
    setSaving(true);
    
    try {
      // Create course data object
      const courseData = {
        title,
        subtitle,
        description,
        modules,
        coverImage: coverImagePreview,
        createdAt: new Date().toISOString(),
      };
      
      // Save to localStorage as a temporary solution
      const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedCourses = [...existingCourses, courseData];
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      
      // In a real implementation, you would send to server
      // await fetch('/api/courses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(courseData)
      // });
      
      // Navigate to the course list page after saving
      setTimeout(() => {
        setSaving(false);
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error saving course:', error);
      setSaving(false);
      alert('Failed to save course. Please try again.');
    }
  };

  // Cancel course creation
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/');
    }
  };

  // Select a module and item to edit
  const handleSelectItem = (moduleIndex, itemIndex) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentItemIndex(itemIndex);
    
    // Update the editor content if the item exists
    if (modules[moduleIndex] && modules[moduleIndex].items[itemIndex]) {
      setItemContent(modules[moduleIndex].items[itemIndex].content || '');
    }
  };

  // Reorder modules
  const handleMoveModule = (moduleIndex, direction) => {
    if ((direction === 'up' && moduleIndex === 0) || 
        (direction === 'down' && moduleIndex === modules.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    const updatedModules = [...modules];
    const module = updatedModules[moduleIndex];
    updatedModules.splice(moduleIndex, 1);
    updatedModules.splice(newIndex, 0, module);
    setModules(updatedModules);
    
    // Update current module index
    setCurrentModuleIndex(newIndex);
  };

  // Reorder items within a module
  const handleMoveItem = (moduleIndex, itemIndex, direction) => {
    const items = modules[moduleIndex].items;
    if ((direction === 'up' && itemIndex === 0) || 
        (direction === 'down' && itemIndex === items.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    const updatedModules = [...modules];
    const item = updatedModules[moduleIndex].items[itemIndex];
    updatedModules[moduleIndex].items.splice(itemIndex, 1);
    updatedModules[moduleIndex].items.splice(newIndex, 0, item);
    setModules(updatedModules);
    
    // Update current item index
    setCurrentItemIndex(newIndex);
  };

  // Apply a template course
  const handleApplyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Confirm with user if they've already started creating content
      if (modules.length > 1 || modules[0].items.length > 1 || title || description) {
        if (!window.confirm("Applying a template will replace your current course. Continue?")) {
          return;
        }
      }
      
      setTitle(template.title);
      setDescription(template.description);
      setModules(JSON.parse(JSON.stringify(template.modules))); // Deep clone
      setCurrentModuleIndex(0);
      setCurrentItemIndex(0);
      setShowTemplates(false);
    }
  };

  // Export course as SCORM package
  const handleExportScorm = async () => {
    if (!title) {
      alert('Please enter a course title before exporting');
      return;
    }
    
    try {
      setSaving(true);
      
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Generate imsmanifest.xml
      const manifest = `<?xml version="1.0" standalone="no" ?>
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
      
      // Generate SCORM API JS
      const scormApi = `// SCORM 1.2 API Implementation
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

      // Generate HTML content from modules
      let htmlContent = `<!DOCTYPE html>
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
      color: #333;
    }
    .course-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    .course-header {
      background-color: #f5f5f5;
      padding: 30px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .module {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .module-header {
      background-color: #eee;
      padding: 15px;
      border-bottom: 1px solid #ddd;
    }
    .module-content {
      padding: 20px;
    }
    .item {
      margin-bottom: 20px;
    }
    .item-title {
      font-size: 1.2em;
      margin-bottom: 10px;
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .quiz-container {
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }
    .question {
      margin-bottom: 20px;
    }
    .options {
      margin-left: 20px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
    }
    button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
  <div class="course-container">
    <div class="course-header">
      <h1>${title}</h1>
      ${subtitle ? `<h2>${subtitle}</h2>` : ''}
      ${coverImagePreview ? `<img src="${coverImagePreview}" alt="${title}" style="max-width: 100%; margin-bottom: 20px;">` : ''}
      <p>${description}</p>
    </div>`;

      // Add modules and items
      modules.forEach(module => {
        htmlContent += `
    <div class="module">
      <div class="module-header">
        <h2>${module.title}</h2>
        <p>${module.description}</p>
      </div>
      <div class="module-content">`;
        
        module.items.forEach(item => {
          htmlContent += `
        <div class="item">
          <div class="item-title">${item.title}</div>`;
          
          if (item.type === 'content') {
            htmlContent += `
          <div class="item-content">${item.content}</div>`;
          } else if (item.type === 'video') {
            if (item.videoUrl && item.videoUrl.includes('youtube')) {
              htmlContent += `
          <iframe width="100%" height="400" src="${item.videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else {
              htmlContent += `
          <video width="100%" controls>
            <source src="${item.videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>`;
            }
          } else if (item.type === 'image') {
            htmlContent += `
          <img src="${item.imageUrl}" alt="${item.title}" />`;
          } else if (item.type === 'pdf') {
            htmlContent += `
          <p><a href="${item.pdfUrl}" target="_blank">Open PDF</a></p>`;
          } else if (item.type === 'quiz') {
            htmlContent += `
          <div class="quiz-container">
            <h3>${item.title}</h3>
            <p>${item.content}</p>`;
            
            if (item.questions && item.questions.length > 0) {
              htmlContent += `
            <form id="quiz-${item.id}">`;
              
              item.questions.forEach((question, qIndex) => {
                htmlContent += `
              <div class="question">
                <p><strong>Question ${qIndex + 1}:</strong> ${question.text}</p>
                <div class="options">`;
                
                if (question.type === 'multiple-choice') {
                  question.options.forEach((option, oIndex) => {
                    htmlContent += `
                  <div>
                    <input type="radio" id="q${qIndex}-o${oIndex}" name="q${qIndex}" value="${oIndex}">
                    <label for="q${qIndex}-o${oIndex}">${option.text}</label>
                  </div>`;
                  });
                } else if (question.type === 'checkbox') {
                  question.options.forEach((option, oIndex) => {
                    htmlContent += `
                  <div>
                    <input type="checkbox" id="q${qIndex}-o${oIndex}" name="q${qIndex}-o${oIndex}">
                    <label for="q${qIndex}-o${oIndex}">${option.text}</label>
                  </div>`;
                  });
                }
                
                htmlContent += `
                </div>
              </div>`;
              });
              
              htmlContent += `
              <button type="button" onclick="checkQuiz('quiz-${item.id}')">Submit Quiz</button>
            </form>
            <div id="quiz-${item.id}-results" class="quiz-results"></div>
            <script>
              function checkQuiz(quizId) {
                // In a real implementation, you would check answers here
                // For now, just mark as completed
                setCompleted();
              }
            </script>`;
            }
            
            htmlContent += `
          </div>`;
          }
          
          htmlContent += `
        </div>`;
        });
        
        htmlContent += `
      </div>
    </div>`;
      });
      
      htmlContent += `
    <button onclick="setCompleted()">Mark Course as Completed</button>
  </div>
</body>
</html>`;

      // Add files to the zip
      zip.file('imsmanifest.xml', manifest);
      zip.file('index.html', htmlContent);
      zip.file('scorm_api.js', scormApi);
      
      // Generate the zip file
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      // Save the file
      const fileName = `${title.replace(/\s+/g, '_')}_scorm.zip`;
      FileSaver.saveAs(zipContent, fileName);
      
      setSaving(false);
    } catch (error) {
      console.error('Error creating SCORM package:', error);
      setSaving(false);
      alert('Failed to create SCORM package. Please try again.');
    }
  };

  return (
    <div className="builder-container">
      <header className="builder-header">
        <div className="builder-tabs">
          <button 
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`} 
            onClick={() => setActiveTab('details')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.04 3.02L8.16 10.9C7.86 11.2 7.56 11.79 7.5 12.22L7.07 15.23C6.91 16.32 7.68 17.08 8.77 16.93L11.78 16.5C12.2 16.44 12.79 16.14 13.1 15.84L20.98 7.96C22.34 6.6 22.98 5 20.98 3C19 1.02 17.4 1.66 16.04 3.02Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.91 4.15C15.58 6.54 17.45 8.41 19.85 9.09" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Course Details
          </button>
          <button 
            className={`tab-button ${activeTab === 'content' ? 'active' : ''}`} 
            onClick={() => setActiveTab('content')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7V5C19 3.9 18.1 3 17 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H17C18.1 21 19 20.1 19 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 9L21 12L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 10L7 12L9 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 10L14 12L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Course Content
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} 
            onClick={() => setActiveTab('settings')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.11V14.88C3 17 3 17 5 18.35L10.5 21.53C11.33 22.01 12.68 22.01 13.5 21.53L19 18.35C21 17 21 17 21 14.89V9.11C21 7 21 7 19 5.65L13.5 2.47C12.68 1.99 11.33 1.99 10.5 2.47L5 5.65C3 7 3 7 3 9.11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Settings
          </button>
          <button 
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('preview')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5C7.45455 5 4 9 2 12C4 15 7.45455 19 12 19C16.5455 19 20 15 22 12C20 9 16.5455 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Preview
          </button>
        </div>
        <div className="builder-actions">
          <button 
            className="btn btn-outline"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSaveCourse}
            disabled={saving || !title}
          >
            {saving ? (
              <>
                <span className="spinner-sm"></span>
                Saving...
              </>
            ) : (
              'Create Course'
            )}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleExportScorm}
            disabled={saving || !title}
          >
            Export SCORM
          </button>
        </div>
      </header>

      <div className="builder-content">
        {activeTab === 'details' && (
          <div className="sidebar-content details-tab">
            <div className="form-group">
              <label htmlFor="title">Course Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subtitle">Subtitle/Tagline</label>
              <input
                type="text"
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Enter a brief subtitle"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter course description"
                rows="4"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Cover Image</label>
              {coverImagePreview ? (
                <div className="image-preview-container">
                  <img 
                    src={coverImagePreview} 
                    alt="Course Cover" 
                    className="image-preview" 
                  />
                  <div className="image-controls">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverImagePreview('');
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="image-upload-placeholder"
                  onClick={() => document.getElementById('coverImageInput').click()}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" fill="currentColor"/>
                    <path d="M13 2H11C6 2 4 4 4 9V15C4 20 6 22 11 22H13C18 22 20 20 20 15V9C20 4 18 2 13 2ZM18.5 9.5V14.5C18.5 18 17 19.5 13.5 19.5H10.5C7 19.5 5.5 18 5.5 14.5V9.5C5.5 6 7 4.5 10.5 4.5H13.5C17 4.5 18.5 6 18.5 9.5ZM18.5 9.5V14.5C18.5 18 17 19.5 13.5 19.5H10.5C7 19.5 5.5 18 5.5 14.5V9.5C5.5 6 7 4.5 10.5 4.5H13.5C17 4.5 18.5 6 18.5 9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 14L8.29 12.3C8.74 11.97 9.42 12.01 9.82 12.38L9.91 12.46C10.35 12.87 11.08 12.87 11.52 12.46L14.77 9.5C15.22 9.09 15.95 9.09 16.4 9.5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Click to upload cover image</span>
                </div>
              )}
              <input
                id="coverImageInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverImageUpload}
              />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-editor">
            {showTemplates ? (
              <div className="templates-container">
                <div className="templates-header">
                  <h2>Course Templates</h2>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setShowTemplates(false)}
                  >
                    Back to Editor
                  </button>
                </div>
                <div className="templates-grid">
                  {templates.map(template => (
                    <div key={template.id} className="template-card">
                      <h3>{template.title}</h3>
                      <p>{template.description}</p>
                      <div className="template-stats">
                        <span>{template.modules.length} modules</span>
                        <span>{template.modules.reduce((total, module) => 
                          total + module.items.length, 0)} lessons</span>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleApplyTemplate(template.id)}
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="modules-sidebar">
                  <div className="sidebar-header">
                    <h3 className="sidebar-title">Course Structure</h3>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => setShowTemplates(true)}
                    >
                      Templates
                    </button>
                  </div>
                  <div className="modules-list">
                    {modules.map((module, moduleIndex) => (
                      <div 
                        key={module.id} 
                        className={`module-item ${currentModuleIndex === moduleIndex ? 'active' : ''}`}
                      >
                        <div 
                          className="module-header"
                          onClick={() => setCurrentModuleIndex(moduleIndex)}
                        >
                          <div className="module-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19.9 13.5H4.1C2.6 13.5 2 14.14 2 15.73V19.77C2 21.36 2.6 22 4.1 22H19.9C21.4 22 22 21.36 22 19.77V15.73C22 14.14 21.4 13.5 19.9 13.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M19.9 2H4.1C2.6 2 2 2.64 2 4.23V8.27C2 9.86 2.6 10.5 4.1 10.5H19.9C21.4 10.5 22 9.86 22 8.27V4.23C22 2.64 21.4 2 19.9 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{module.title}</span>
                          </div>
                          <div className="module-actions">
                            <button 
                              className="btn-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveModule(moduleIndex, 'up');
                              }}
                              disabled={moduleIndex === 0}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="btn-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveModule(moduleIndex, 'down');
                              }}
                              disabled={moduleIndex === modules.length - 1}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="btn-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveModule(moduleIndex);
                              }}
                              disabled={modules.length <= 1}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {currentModuleIndex === moduleIndex && (
                          <div className="module-items">
                            {module.items.map((item, itemIndex) => (
                              <div 
                                key={item.id} 
                                className={`item ${currentItemIndex === itemIndex ? 'active' : ''}`}
                                onClick={() => handleSelectItem(moduleIndex, itemIndex)}
                              >
                                <div className="item-icon">
                                  {item.type === 'content' ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M14.5 4.5V6.5C14.5 7.6 15.4 8.5 16.5 8.5H18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M8 13H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  ) : item.type === 'video' ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M16 10.87V7.87C16 6.77 15.1 5.87 14 5.87H5C3.9 5.87 3 6.77 3 7.87V16.87C3 17.97 3.9 18.87 5 18.87H14C15.1 18.87 16 17.97 16 16.87V13.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M19.5 12.37L16 9.87V14.87L19.5 12.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  ) : item.type === 'image' ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <div className="item-title">{item.title}</div>
                                <div className="item-actions">
                                  <button
                                    className="btn-icon sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveItem(moduleIndex, itemIndex, 'up');
                                    }}
                                    disabled={itemIndex === 0}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                  <button
                                    className="btn-icon sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveItem(moduleIndex, itemIndex, 'down');
                                    }}
                                    disabled={itemIndex === module.items.length - 1}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                  <button
                                    className="btn-icon sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItem(moduleIndex, itemIndex);
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div className="item-buttons">
                              <button 
                                className="btn-add"
                                onClick={() => handleAddItem(moduleIndex, 'content')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Add Lesson
                              </button>
                              <button 
                                className="btn-add"
                                onClick={() => handleAddItem(moduleIndex, 'video')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M16 10.87V7.87C16 6.77 15.1 5.87 14 5.87H5C3.9 5.87 3 6.77 3 7.87V16.87C3 17.97 3.9 18.87 5 18.87H14C15.1 18.87 16 17.97 16 16.87V13.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M19.5 12.37L16 9.87V14.87L19.5 12.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Add Video
                              </button>
                              <button 
                                className="btn-add"
                                onClick={() => handleAddItem(moduleIndex, 'image')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                                  <path d="M21 15L16 10L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Add Image
                              </button>
                              <button 
                                className="btn-add"
                                onClick={() => handleAddItem(moduleIndex, 'pdf')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 18C12 16.3431 10.6569 15 9 15C7.34315 15 6 16.3431 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M9 13C9.55228 13 10 12.5523 10 12C10 11.4477 9.55228 11 9 11C8.44772 11 8 11.4477 8 12C8 12.5523 8.44772 13 9 13Z" fill="currentColor"/>
                                </svg>
                                Add PDF
                              </button>
                              <button 
                                className="btn-add"
                                onClick={() => handleAddItem(moduleIndex, 'quiz')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Add Quiz
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      className="btn-add-module"
                      onClick={handleAddModule}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Add Module
                    </button>
                  </div>
                </div>

                <div className="content-panel">
                  {modules.length > 0 && modules[currentModuleIndex] && (
                    <>
                      <div className="content-header">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Module Title</label>
                            <input 
                              type="text" 
                              value={modules[currentModuleIndex].title} 
                              onChange={(e) => handleModuleChange(currentModuleIndex, 'title', e.target.value)}
                              placeholder="Enter module title"
                            />
                          </div>
                          <div className="form-group">
                            <label>Module Description</label>
                            <input 
                              type="text" 
                              value={modules[currentModuleIndex].description} 
                              onChange={(e) => handleModuleChange(currentModuleIndex, 'description', e.target.value)}
                              placeholder="Enter module description"
                            />
                          </div>
                        </div>
                      </div>

                      {modules[currentModuleIndex].items.length > 0 && currentItemIndex < modules[currentModuleIndex].items.length && (
                        <div className="item-editor">
                          <div className="form-group">
                            <label>Item Title</label>
                            <input 
                              type="text" 
                              value={modules[currentModuleIndex].items[currentItemIndex].title} 
                              onChange={(e) => handleItemChange(currentModuleIndex, currentItemIndex, 'title', e.target.value)}
                              placeholder="Enter item title"
                            />
                          </div>
                          
                          {modules[currentModuleIndex].items[currentItemIndex].type === 'video' ? (
                            <div className="form-group">
                              <label>Video</label>
                              <div className="upload-options">
                                <div className="upload-option">
                                  <label className="option-label">Upload Video</label>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                    className="file-input"
                                  />
                                </div>
                                <div className="upload-option">
                                  <label className="option-label">Video URL (YouTube or Vimeo)</label>
                                  <input
                                    type="text"
                                    value={modules[currentModuleIndex].items[currentItemIndex].videoUrl || ''}
                                    onChange={(e) => {
                                      handleItemChange(currentModuleIndex, currentItemIndex, 'videoUrl', e.target.value);
                                      handleItemChange(currentModuleIndex, currentItemIndex, 'videoType', 'embed');
                                    }}
                                    placeholder="e.g., https://www.youtube.com/embed/videoId"
                                  />
                                </div>
                              </div>
                              {modules[currentModuleIndex].items[currentItemIndex].videoUrl && (
                                <div className="video-preview">
                                  <h4>Video Preview</h4>
                                  {modules[currentModuleIndex].items[currentItemIndex].videoType === 'file' ? (
                                    <video 
                                      controls 
                                      width="100%" 
                                      height="315"
                                      src={modules[currentModuleIndex].items[currentItemIndex].videoUrl}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : (
                                    <iframe
                                      src={modules[currentModuleIndex].items[currentItemIndex].videoUrl}
                                      title="Video Preview"
                                      width="100%"
                                      height="315"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : modules[currentModuleIndex].items[currentItemIndex].type === 'image' ? (
                            <div className="form-group">
                              <label>Image</label>
                              <div className="upload-options">
                                <div className="upload-option">
                                  <label className="option-label">Upload Image</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="file-input"
                                  />
                                </div>
                                <div className="upload-option">
                                  <label className="option-label">Image URL</label>
                                  <input
                                    type="text"
                                    value={modules[currentModuleIndex].items[currentItemIndex].imageUrl || ''}
                                    onChange={(e) => handleItemChange(currentModuleIndex, currentItemIndex, 'imageUrl', e.target.value)}
                                    placeholder="e.g., https://example.com/image.jpg"
                                  />
                                </div>
                              </div>
                              {(imagePreview || modules[currentModuleIndex].items[currentItemIndex].imageUrl) && (
                                <div className="image-preview-container">
                                  <h4>Image Preview</h4>
                                  <img 
                                    src={imagePreview || modules[currentModuleIndex].items[currentItemIndex].imageUrl} 
                                    alt="Content" 
                                    className="content-image-preview" 
                                  />
                                </div>
                              )}
                              <div className="form-group">
                                <label>Caption (optional)</label>
                                <input
                                  type="text"
                                  value={modules[currentModuleIndex].items[currentItemIndex].caption || ''}
                                  onChange={(e) => handleItemChange(currentModuleIndex, currentItemIndex, 'caption', e.target.value)}
                                  placeholder="Enter image caption"
                                />
                              </div>
                            </div>
                          ) : modules[currentModuleIndex].items[currentItemIndex].type === 'pdf' ? (
                            <div className="form-group">
                              <label>PDF Document</label>
                              <div className="upload-options">
                                <div className="upload-option">
                                  <label className="option-label">Upload PDF</label>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePdfUpload}
                                    className="file-input"
                                  />
                                </div>
                                <div className="upload-option">
                                  <label className="option-label">PDF URL</label>
                                  <input
                                    type="text"
                                    value={modules[currentModuleIndex].items[currentItemIndex].pdfUrl || ''}
                                    onChange={(e) => handleItemChange(currentModuleIndex, currentItemIndex, 'pdfUrl', e.target.value)}
                                    placeholder="e.g., https://example.com/document.pdf"
                                  />
                                </div>
                              </div>
                              {(pdfFile || modules[currentModuleIndex].items[currentItemIndex].pdfName) && (
                                <div className="pdf-preview">
                                  <h4>Selected PDF</h4>
                                  <div className="pdf-info">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>{pdfName || modules[currentModuleIndex].items[currentItemIndex].pdfName}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="form-group">
                              <label>Content</label>
                              <textarea 
                                className="content-textarea"
                                value={modules[currentModuleIndex].items[currentItemIndex].content} 
                                onChange={(e) => handleItemChange(currentModuleIndex, currentItemIndex, 'content', e.target.value)}
                                placeholder="Enter content"
                                rows="10"
                              ></textarea>
                            </div>
                          )}
                          
                          {modules[currentModuleIndex].items[currentItemIndex].type === 'quiz' && (
                            <div className="quiz-editor">
                              <div className="quiz-header">
                                <h3>Quiz Questions</h3>
                                <p className="quiz-help">Create multiple-choice questions for your quiz.</p>
                                <button 
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleAddQuizQuestion(currentModuleIndex, currentItemIndex)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Add Question
                                </button>
                              </div>
                              
                              {modules[currentModuleIndex].items[currentItemIndex].questions?.length > 0 ? (
                                <div className="questions-list">
                                  {modules[currentModuleIndex].items[currentItemIndex].questions.map((question, questionIndex) => (
                                    <div key={question.id} className="question-card">
                                      <div className="question-header">
                                        <span className="question-number">Question {questionIndex + 1}</span>
                                        <button 
                                          className="btn-icon"
                                          onClick={() => handleRemoveQuestion(currentModuleIndex, currentItemIndex, questionIndex)}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </button>
                                      </div>
                                      
                                      <div className="form-group">
                                        <label>Question Text</label>
                                        <input 
                                          type="text"
                                          value={question.text}
                                          onChange={(e) => handleQuestionChange(currentModuleIndex, currentItemIndex, questionIndex, 'text', e.target.value)}
                                          placeholder="Enter your question"
                                        />
                                      </div>
                                      
                                      <div className="form-group">
                                        <label>Question Type</label>
                                        <select
                                          value={question.type}
                                          onChange={(e) => handleQuestionChange(currentModuleIndex, currentItemIndex, questionIndex, 'type', e.target.value)}
                                        >
                                          <option value="multiple-choice">Multiple Choice (Single Answer)</option>
                                          <option value="checkbox">Multiple Choice (Multiple Answers)</option>
                                        </select>
                                      </div>
                                      
                                      <div className="options-container">
                                        <label>Answer Options</label>
                                        {question.options.map((option, optionIndex) => (
                                          <div key={option.id} className="option-row">
                                            <div className="option-checkbox">
                                              <input
                                                type={question.type === 'multiple-choice' ? 'radio' : 'checkbox'}
                                                name={`question-${question.id}`}
                                                checked={option.isCorrect}
                                                onChange={(e) => handleOptionChange(
                                                  currentModuleIndex,
                                                  currentItemIndex,
                                                  questionIndex,
                                                  optionIndex,
                                                  'isCorrect',
                                                  e.target.checked
                                                )}
                                              />
                                            </div>
                                            <div className="option-input">
                                              <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(
                                                  currentModuleIndex,
                                                  currentItemIndex,
                                                  questionIndex,
                                                  optionIndex,
                                                  'text',
                                                  e.target.value
                                                )}
                                                placeholder={`Option ${optionIndex + 1}`}
                                              />
                                            </div>
                                            <div className="option-actions">
                                              <button
                                                className="btn-icon sm"
                                                onClick={() => handleRemoveOption(
                                                  currentModuleIndex,
                                                  currentItemIndex,
                                                  questionIndex,
                                                  optionIndex
                                                )}
                                                disabled={question.options.length <= 2}
                                              >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                        <button
                                          className="btn-add-option"
                                          onClick={() => handleAddQuestionOption(currentModuleIndex, currentItemIndex, questionIndex)}
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                          Add Option
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="no-questions">
                                  <p>No questions added yet. Click "Add Question" to create your quiz.</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="item-buttons-container">
                            <button 
                              className="btn btn-sm btn-outline" 
                              onClick={() => {
                                // Add next item logic
                                if (modules[currentModuleIndex].items[currentItemIndex].type === 'content') {
                                  handleAddItem(currentModuleIndex, 'video');
                                } else if (modules[currentModuleIndex].items[currentItemIndex].type === 'video') {
                                  handleAddItem(currentModuleIndex, 'quiz');
                                } else {
                                  handleAddItem(currentModuleIndex, 'content');
                                }
                              }}
                            >
                              Add Next Item
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="sidebar-content settings-tab">
            <div className="settings-section">
              <h3 className="section-title">Course Settings</h3>
              <div className="form-group">
                <label htmlFor="visibility">Visibility</label>
                <select id="visibility" defaultValue="public">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="password">Password Protected</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="duration">Estimated Duration</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    defaultValue="2"
                  />
                  <span className="unit">hours</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="level">Difficulty Level</label>
                <select id="level" defaultValue="beginner">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Course Tags</label>
                <div className="tags-input">
                  <input 
                    type="text" 
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Handle tag addition here
                      }
                    }}
                  />
                  <div className="tags-preview">
                    <span className="tag">
                      E-Learning
                      <button className="tag-remove-btn">×</button>
                    </span>
                    <span className="tag">
                      SCORM
                      <button className="tag-remove-btn">×</button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-section">
              <h3 className="section-title">Completion Settings</h3>
              <div className="form-group checkbox-group">
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                  />
                  <span className="checkbox-mark"></span>
                  <span>Require quiz completion</span>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                  />
                  <span className="checkbox-mark"></span>
                  <span>Require minimum quiz score</span>
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="minScore">Minimum Score</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    id="minScore"
                    min="0"
                    max="100" 
                    defaultValue="70"
                  />
                  <span className="unit">%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="course-preview-container">
            <div className="preview-header">
              <h2>{title || 'Course Title'}</h2>
              <p className="preview-subtitle">{subtitle || 'Course Subtitle'}</p>
            </div>
            
            <div className="preview-content">
              {coverImagePreview && (
                <div className="preview-cover-image">
                  <img src={coverImagePreview} alt={title || 'Course cover'} />
                </div>
              )}
              
              <div className="preview-description">
                <h3>About this course</h3>
                <p>{description || 'No description provided'}</p>
              </div>
              
              <div className="preview-curriculum">
                <h3>Curriculum</h3>
                {modules.map((module, index) => (
                  <div key={module.id} className="preview-module">
                    <div className="preview-module-header">
                      <h4>
                        <span className="module-number">Module {index + 1}:</span> {module.title}
                      </h4>
                      <p>{module.description}</p>
                    </div>
                    <div className="preview-module-items">
                      {module.items.map((item, itemIndex) => (
                        <div key={item.id} className="preview-item">
                          <div className="preview-item-icon">
                            {item.type === 'content' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 6H20M12 12H20M4 18H20M4 6L8 10L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : item.type === 'video' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 10.87V7.87C16 6.77 15.1 5.87 14 5.87H5C3.9 5.87 3 6.77 3 7.87V16.87C3 17.97 3.9 18.87 5 18.87H14C15.1 18.87 16 17.97 16 16.87V13.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19.5 12.37L16 9.87V14.87L19.5 12.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : item.type === 'image' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="preview-item-details">
                            <span className="preview-item-title">{item.title}</span>
                            <span className="preview-item-type">{item.type === 'content' ? 'Lesson' : item.type === 'video' ? 'Video' : 'Quiz'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCourse; 