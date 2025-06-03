import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Sample data for initial setup
const initialPackages = [
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

const CoursesList = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading for demo purposes
    const timer = setTimeout(() => {
      try {
        // Load packages from local storage
        const storedPackages = localStorage.getItem('learningModules');
        
        if (storedPackages) {
          const parsedPackages = JSON.parse(storedPackages);
          console.log('Loaded packages from localStorage:', parsedPackages.length);
          setPackages(parsedPackages);
        } else {
          // If not in local storage, use initial data and save it
          localStorage.setItem('learningModules', JSON.stringify(initialPackages));
          setPackages(initialPackages);
        }

        // Load recent drafts from Content Builder
        const storedDrafts = localStorage.getItem('contentBuilderDrafts');
        if (storedDrafts) {
          const parsedDrafts = JSON.parse(storedDrafts);
          // Get the 5 most recent drafts with content
          const recentDraftsWithContent = parsedDrafts
            .filter(draft => draft.courseData && (draft.courseData.title || draft.courseData.modules.length > 0))
            .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
            .slice(0, 5);
          setRecentDrafts(recentDraftsWithContent);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        // Fallback to initial data if there's an error
        setPackages(initialPackages);
      } finally {
        setLoading(false);
      }
    }, 1000); // 1 second delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this Learning Module?')) {
      try {
        // Remove from state
        const updatedPackages = packages.filter(pkg => pkg._id !== id);
        setPackages(updatedPackages);
        
        // Update local storage
        localStorage.setItem('learningModules', JSON.stringify(updatedPackages));
      } catch (err) {
        console.error('Error deleting package:', err);
        setError('Failed to delete the package. Please try again.');
      }
    }
  };

  const handleContinueEditing = (draftId) => {
    // Navigate to content builder with the draft ID as a URL parameter
    navigate(`/content-builder?draft=${draftId}`);
  };

  const handleDeleteDraft = (draftId) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        const drafts = JSON.parse(localStorage.getItem('contentBuilderDrafts') || '[]');
        const filteredDrafts = drafts.filter(d => d.id !== draftId);
        localStorage.setItem('contentBuilderDrafts', JSON.stringify(filteredDrafts));
        setRecentDrafts(filteredDrafts.slice(0, 5));
      } catch (err) {
        console.error('Error deleting draft:', err);
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading courses...</p>
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
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Learning Content</h2>
          <p className="page-subtitle">Create, manage, and launch your e-learning courses</p>
        </div>
        <div className="header-actions">
          <Link to="/content-builder" className="btn btn-primary">
            + Create New Course
          </Link>
        </div>
      </div>

      {/* Recent Drafts Section */}
      {recentDrafts.length > 0 && (
        <div className="recent-drafts-section">
          <div className="section-header">
            <h3>Continue Editing</h3>
            <p>Pick up where you left off with your recent work</p>
          </div>
          
          <div className="recent-drafts-grid">
            {recentDrafts.map((draft) => (
              <div key={draft.id} className="draft-card">
                <div className="draft-card-header">
                  <div className="draft-info">
                    <h4>{draft.title || 'Untitled Course'}</h4>
                    <p className="draft-meta">
                      Last edited {formatTimeAgo(draft.lastModified)}
                    </p>
                  </div>
                  <div className="draft-status">
                    {draft.isManual && <span className="manual-save-indicator">💾</span>}
                    <span className="auto-save-indicator">✓</span>
                  </div>
                </div>
                
                <div className="draft-card-body">
                  {draft.description && (
                    <p className="draft-description">{draft.description}</p>
                  )}
                  <div className="draft-stats">
                    <span className="stat-item">
                      <span className="stat-icon">📑</span>
                      {draft.moduleCount} modules
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">🧩</span>
                      {draft.elementCount} elements
                    </span>
                  </div>
                </div>
                
                <div className="draft-card-footer">
                  <button 
                    onClick={() => handleContinueEditing(draft.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Continue Editing
                  </button>
                  <button 
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="btn btn-secondary btn-sm"
                    title="Delete draft"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Courses Section */}
      <div className="published-courses-section">
        <div className="section-header">
          <h3>Published Courses</h3>
          <p>Your completed and published courses</p>
        </div>

        {packages.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">📚</div>
            <h3>No published courses yet</h3>
            <p>Create your first course using our Content Builder or upload an existing Learning Module.</p>
            <div className="empty-actions">
              <Link to="/content-builder" className="btn btn-primary">Create Course</Link>
              <Link to="/upload" className="btn btn-secondary">Upload Module</Link>
            </div>
          </div>
        ) : (
          <div className="grid">
            {packages.map((pkg) => (
              <div key={pkg._id} className="card course-card">
                <div className="course-card-body">
                  <h3>
                    {pkg.title}
                    {pkg.isBuiltWithBuilder && (
                      <span className="builder-badge">Content Builder</span>
                    )}
                  </h3>
                  <p>{pkg.description || 'No description available'}</p>
                  <div className="metadata">
                    <span>
                      <strong>Published:</strong> {new Date(pkg.uploadDate).toLocaleDateString()}
                    </span>
                    {pkg.fileCount && (
                      <span>
                        <strong>Files:</strong> {pkg.fileCount}
                      </span>
                    )}
                    {pkg.isBuiltWithBuilder && pkg.moduleCount && (
                      <span className="module-count">
                        <strong>Modules:</strong> {pkg.moduleCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="course-card-footer">
                  <Link to={`/player/${pkg._id}`} className="btn btn-primary">
                    Launch Course
                  </Link>
                  <button 
                    onClick={() => handleDelete(pkg._id)} 
                    className="btn btn-danger"
                    aria-label={`Delete ${pkg.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesList; 