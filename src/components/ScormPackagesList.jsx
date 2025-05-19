import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Sample data for initial setup
const initialPackages = [
  {
    _id: '1',
    title: 'Introduction to SCORM Standards',
    description: 'Learn the basics of SCORM standards and how they work in e-learning environments.',
    uploadDate: new Date('2025-05-10').toISOString(),
    filePath: '/sample/intro-scorm'
  },
  {
    _id: '2',
    title: 'Advanced JavaScript for E-Learning',
    description: 'Master JavaScript techniques for creating interactive SCORM content and measuring learner progress.',
    uploadDate: new Date('2025-05-12').toISOString(),
    filePath: '/sample/advanced-js'
  },
  {
    _id: '3',
    title: 'Responsive Design for E-Learning',
    description: 'Learn how to create SCORM courses that look great on any device - from desktop to mobile.',
    uploadDate: new Date('2025-05-14').toISOString(),
    filePath: '/sample/responsive-design'
  },
  {
    _id: '4',
    title: 'Creating Assessments in SCORM',
    description: 'Design effective quizzes, tests, and other assessments in your SCORM packages.',
    uploadDate: new Date('2025-05-15').toISOString(),
    filePath: '/sample/assessments'
  }
];

const ScormPackagesList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading for demo purposes
    const timer = setTimeout(() => {
      try {
        // Try to get packages from local storage
        const storedPackages = localStorage.getItem('scormPackages');
        
        if (storedPackages) {
          const parsedPackages = JSON.parse(storedPackages);
          console.log('Loaded packages from localStorage:', parsedPackages.length);
          setPackages(parsedPackages);
        } else {
          // If not in local storage, use initial data and save it
          localStorage.setItem('scormPackages', JSON.stringify(initialPackages));
          setPackages(initialPackages);
        }
      } catch (err) {
        console.error('Error loading packages:', err);
        // Fallback to initial data if there's an error
        setPackages(initialPackages);
      } finally {
        setLoading(false);
      }
    }, 1000); // 1 second delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this SCORM package?')) {
      try {
        // Find the package to delete
        const packageToDelete = packages.find(pkg => pkg._id === id);
        
        // If it's a media-based package, revoke the objectURLs to prevent memory leaks
        if (packageToDelete && packageToDelete.isMediaBased && packageToDelete.mediaFiles) {
          packageToDelete.mediaFiles.forEach(file => {
            if (file.objectURL) {
              URL.revokeObjectURL(file.objectURL);
              console.log('Revoked URL for:', file.name);
            }
          });
        }
        
        // Remove from state
        const updatedPackages = packages.filter(pkg => pkg._id !== id);
        setPackages(updatedPackages);
        
        // Update local storage
        localStorage.setItem('scormPackages', JSON.stringify(updatedPackages));
      } catch (err) {
        console.error('Error deleting package:', err);
        setError('Failed to delete the package. Please try again.');
      }
    }
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
          <h2 className="page-title">My SCORM Courses</h2>
          <p className="page-subtitle">Browse and manage your e-learning content</p>
        </div>
        <div className="header-actions">
          <Link to="/upload" className="btn btn-secondary">
            Upload SCORM
          </Link>
          <Link to="/builder" className="btn btn-primary">
            + Create Media Course
          </Link>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📚</div>
          <h3>No courses yet</h3>
          <p>You haven't uploaded any SCORM packages yet. Upload one to get started!</p>
          <div className="empty-actions">
            <Link to="/upload" className="btn btn-secondary">Upload SCORM</Link>
            <Link to="/builder" className="btn btn-primary">Create Media Course</Link>
          </div>
        </div>
      ) : (
        <div className="grid">
          {packages.map((pkg) => (
            <div key={pkg._id} className="card course-card">
              <div className="course-card-body">
                <h3>
                  {pkg.title}
                  {pkg.isMediaBased && (
                    <span className="media-badge">Media-Based</span>
                  )}
                </h3>
                <p>{pkg.description || 'No description available'}</p>
                <div className="metadata">
                  <span>
                    <strong>Uploaded:</strong> {new Date(pkg.uploadDate).toLocaleDateString()}
                  </span>
                  {pkg.fileCount && (
                    <span>
                      <strong>Files:</strong> {pkg.fileCount}
                    </span>
                  )}
                  {pkg.isMediaBased && pkg.mediaCount && (
                    <span className="media-count">
                      <strong>Media:</strong> {pkg.mediaCount} files (images/videos)
                    </span>
                  )}
                </div>
              </div>
              <div className="course-card-footer">
                <Link to={`/player/${pkg._id}`} className="btn btn-primary">
                  {pkg.isMediaBased ? 'View Media' : 'Launch Course'}
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
  );
};

export default ScormPackagesList; 