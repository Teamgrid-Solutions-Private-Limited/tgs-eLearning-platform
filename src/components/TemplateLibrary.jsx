import { useState } from 'react';
import './style/ContentBuilder.css';

const TemplateLibrary = ({ onSelectTemplate, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('courses');

  const courseTemplates = [
    {
      id: 'onboarding',
      name: 'Employee Onboarding',
      description: 'Complete onboarding course with welcome, company overview, policies, and assessment',
      preview: '/api/placeholder/300/200',
      modules: [
        {
          title: 'Welcome & Introduction',
          elements: [
            { type: 'heading', content: { text: 'Welcome to Our Company!', level: 1 } },
            { type: 'text', content: { text: 'We\'re excited to have you join our team. This course will help you get started.' } },
            { type: 'video', content: { src: '', controls: true } }
          ]
        },
        {
          title: 'Company Overview',
          elements: [
            { type: 'heading', content: { text: 'About Our Company', level: 2 } },
            { type: 'text', content: { text: 'Learn about our mission, vision, and values.' } },
            { type: 'timeline', content: { events: [
              { date: '1990', title: 'Company Founded', description: 'Started with a vision' },
              { date: '2000', title: 'First Major Milestone', description: 'Expanded operations' },
              { date: '2020', title: 'Digital Transformation', description: 'Embraced new technologies' }
            ]}}
          ]
        },
        {
          title: 'Policies & Procedures',
          elements: [
            { type: 'heading', content: { text: 'Important Policies', level: 2 } },
            { type: 'accordion', content: { items: [
              { title: 'Code of Conduct', content: 'Our standards for professional behavior' },
              { title: 'Safety Guidelines', content: 'Keeping everyone safe at work' },
              { title: 'IT Security', content: 'Protecting company and customer data' }
            ]}}
          ]
        },
        {
          title: 'Knowledge Check',
          elements: [
            { type: 'quiz', content: { 
              question: 'What year was our company founded?',
              options: ['1985', '1990', '1995', '2000'],
              correct: 1
            }},
            { type: 'quiz', content: { 
              question: 'Which of these is one of our core values?',
              options: ['Innovation', 'Profit', 'Competition', 'Speed'],
              correct: 0
            }}
          ]
        }
      ]
    },
    {
      id: 'product-training',
      name: 'Product Training',
      description: 'Comprehensive product knowledge course with features, benefits, and hands-on practice',
      preview: '/api/placeholder/300/200',
      modules: [
        {
          title: 'Product Introduction',
          elements: [
            { type: 'heading', content: { text: 'Product Overview', level: 1 } },
            { type: 'text', content: { text: 'Learn about our flagship product and its key features.' } },
            { type: 'image', content: { src: '', alt: 'Product image', caption: 'Our main product' } }
          ]
        },
        {
          title: 'Key Features',
          elements: [
            { type: 'heading', content: { text: 'Core Features', level: 2 } },
            { type: 'tabs', content: { items: [
              { title: 'Feature 1', content: 'Description of first key feature' },
              { title: 'Feature 2', content: 'Description of second key feature' },
              { title: 'Feature 3', content: 'Description of third key feature' }
            ]}}
          ]
        },
        {
          title: 'Hands-on Practice',
          elements: [
            { type: 'heading', content: { text: 'Try It Yourself', level: 2 } },
            { type: 'text', content: { text: 'Follow these steps to practice using the product.' } },
            { type: 'interactive', content: { type: 'simulation', data: {} } }
          ]
        }
      ]
    },
    {
      id: 'compliance',
      name: 'Compliance Training',
      description: 'Essential compliance training with regulations, scenarios, and certification',
      preview: '/api/placeholder/300/200',
      modules: [
        {
          title: 'Regulatory Overview',
          elements: [
            { type: 'heading', content: { text: 'Compliance Requirements', level: 1 } },
            { type: 'text', content: { text: 'Understanding the regulatory landscape and our obligations.' } }
          ]
        },
        {
          title: 'Scenarios & Case Studies',
          elements: [
            { type: 'heading', content: { text: 'Real-World Scenarios', level: 2 } },
            { type: 'text', content: { text: 'Learn through practical examples and case studies.' } }
          ]
        },
        {
          title: 'Assessment',
          elements: [
            { type: 'heading', content: { text: 'Compliance Test', level: 2 } },
            { type: 'quiz', content: { 
              question: 'What is the first step in our compliance process?',
              options: ['Report', 'Assess', 'Document', 'Review'],
              correct: 1
            }}
          ]
        }
      ]
    }
  ];

  const moduleTemplates = [
    {
      id: 'intro-module',
      name: 'Introduction Module',
      description: 'Welcome learners with an engaging introduction',
      elements: [
        { type: 'heading', content: { text: 'Welcome to This Module', level: 1 } },
        { type: 'text', content: { text: 'In this module, you will learn...' } },
        { type: 'video', content: { src: '', controls: true } }
      ]
    },
    {
      id: 'content-module',
      name: 'Content Module',
      description: 'Rich content delivery with multiple media types',
      elements: [
        { type: 'heading', content: { text: 'Key Concepts', level: 2 } },
        { type: 'text', content: { text: 'Let\'s explore the main concepts...' } },
        { type: 'image', content: { src: '', alt: 'Concept illustration' } },
        { type: 'accordion', content: { items: [
          { title: 'Concept 1', content: 'Detailed explanation of first concept' },
          { title: 'Concept 2', content: 'Detailed explanation of second concept' }
        ]}}
      ]
    },
    {
      id: 'assessment-module',
      name: 'Assessment Module',
      description: 'Test knowledge with various question types',
      elements: [
        { type: 'heading', content: { text: 'Knowledge Check', level: 2 } },
        { type: 'text', content: { text: 'Test your understanding of the material.' } },
        { type: 'quiz', content: { 
          question: 'Sample question?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct: 0
        }},
        { type: 'quiz', content: { 
          question: 'Another sample question?',
          options: ['Choice 1', 'Choice 2', 'Choice 3'],
          correct: 1
        }}
      ]
    }
  ];

  const elementTemplates = [
    {
      id: 'hero-section',
      name: 'Hero Section',
      description: 'Eye-catching introduction with heading and call-to-action',
      elements: [
        { type: 'heading', content: { text: 'Course Title', level: 1 } },
        { type: 'text', content: { text: 'Engaging description that motivates learners to continue.' } },
        { type: 'image', content: { src: '', alt: 'Hero image' } }
      ]
    },
    {
      id: 'faq-section',
      name: 'FAQ Section',
      description: 'Frequently asked questions in accordion format',
      elements: [
        { type: 'heading', content: { text: 'Frequently Asked Questions', level: 2 } },
        { type: 'accordion', content: { items: [
          { title: 'Question 1?', content: 'Answer to the first question.' },
          { title: 'Question 2?', content: 'Answer to the second question.' },
          { title: 'Question 3?', content: 'Answer to the third question.' }
        ]}}
      ]
    },
    {
      id: 'comparison-table',
      name: 'Comparison Table',
      description: 'Compare features or options side by side',
      elements: [
        { type: 'heading', content: { text: 'Feature Comparison', level: 2 } },
        { type: 'tabs', content: { items: [
          { title: 'Option A', content: 'Features and benefits of Option A' },
          { title: 'Option B', content: 'Features and benefits of Option B' },
          { title: 'Option C', content: 'Features and benefits of Option C' }
        ]}}
      ]
    }
  ];

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const renderTemplateGrid = (templates, type) => (
    <div className="template-grid">
      {templates.map((template) => (
        <div key={template.id} className="template-card" onClick={() => handleSelectTemplate(template)}>
          <div className="template-preview">
            {template.preview ? (
              <img src={template.preview} alt={template.name} />
            ) : (
              <div className="template-placeholder">
                <span className="template-icon">
                  {type === 'course' ? '📚' : type === 'module' ? '📄' : '🧩'}
                </span>
              </div>
            )}
          </div>
          <div className="template-info">
            <h4>{template.name}</h4>
            <p>{template.description}</p>
            <div className="template-meta">
              {template.modules && <span>{template.modules.length} modules</span>}
              {template.elements && <span>{template.elements.length} elements</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="template-library-overlay">
      <div className="template-library">
        <div className="template-header">
          <h2>Template Library</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="template-categories">
          <button 
            className={`category-btn ${activeCategory === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveCategory('courses')}
          >
            Course Templates
          </button>
          <button 
            className={`category-btn ${activeCategory === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveCategory('modules')}
          >
            Module Templates
          </button>
          <button 
            className={`category-btn ${activeCategory === 'elements' ? 'active' : ''}`}
            onClick={() => setActiveCategory('elements')}
          >
            Element Templates
          </button>
        </div>

        <div className="template-content">
          {activeCategory === 'courses' && (
            <div>
              <h3>Course Templates</h3>
              <p>Complete course structures with multiple modules and assessments</p>
              {renderTemplateGrid(courseTemplates, 'course')}
            </div>
          )}

          {activeCategory === 'modules' && (
            <div>
              <h3>Module Templates</h3>
              <p>Pre-built modules for common learning scenarios</p>
              {renderTemplateGrid(moduleTemplates, 'module')}
            </div>
          )}

          {activeCategory === 'elements' && (
            <div>
              <h3>Element Templates</h3>
              <p>Common content patterns and layouts</p>
              {renderTemplateGrid(elementTemplates, 'element')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary; 