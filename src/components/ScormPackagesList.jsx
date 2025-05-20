import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scormApi, coursesApi } from '../services/api';

// Sample data for initial setup
const initialPackages = [
  {
    _id: '1',
    title: 'Introduction to Programming',
    description: 'Learn the basics of programming concepts and languages.',
    uploadDate: new Date('2025-05-10').toISOString(),
    filePath: '/sample/intro-programming',
    progress: 65,
    instructor: 'Jonathan Reed',
    duration: '4h 36min'
  },
  {
    _id: '2',
    title: 'Advanced JavaScript',
    description: 'Master JavaScript techniques for creating interactive content and measuring progress.',
    uploadDate: new Date('2025-05-12').toISOString(),
    filePath: '/sample/advanced-js',
    progress: 25,
    instructor: 'Sarah Chen',
    duration: '6h 20min'
  },
  {
    _id: '3',
    title: 'Responsive Design',
    description: 'Learn how to create courses that look great on any device - from desktop to mobile.',
    uploadDate: new Date('2025-05-14').toISOString(),
    filePath: '/sample/responsive-design',
    progress: 100,
    instructor: 'Miguel Santos',
    duration: '3h 45min'
  },
  {
    _id: '4',
    title: 'Creating Assessments',
    description: 'Design effective quizzes, tests, and other assessments in your courses.',
    uploadDate: new Date('2025-05-15').toISOString(),
    filePath: '/sample/assessments',
    progress: 0,
    instructor: 'Amanda Johnson',
    duration: '5h 10min'
  }
];

const ScormPackagesList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, name: 'Conference', date: 'Apr 14', location: 'Online' },
    { id: 2, name: 'Physio doctorate', date: 'Apr 22', location: 'Room 305' }
  ]);
  const [appStats, setAppStats] = useState([
    { name: 'Achievements', progress: 58 },
    { name: 'Learning', progress: 85 },
    { name: 'Responses', progress: 32 }
  ]);

  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        setLoading(true);
        
        // Fetch both SCORM packages and courses in parallel
        const [scormPackages, courses] = await Promise.all([
          scormApi.getAllPackages(),
          coursesApi.getAllCourses()
        ]);
        
        // Format courses to match the package format
        const formattedCourses = courses.map(course => ({
          _id: course._id || `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: course.title,
          description: course.description || 'No description available',
          uploadDate: course.createdAt || new Date().toISOString(),
          filePath: '/course',
          progress: course.progress || 0,
          instructor: course.instructor || 'You',
          duration: course.duration || '1h 30min',
          isCustomCourse: true,
          coverImage: course.coverImage
        }));
        
        // Combine SCORM packages and courses
        const allContent = [...scormPackages, ...formattedCourses];
        setPackages(allContent);
        setError(null);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load courses. Please try again.');
        
        // If API fails, try to load from localStorage as fallback
        try {
          // Get SCORM packages from localStorage
          const storedPackages = localStorage.getItem('scormPackages');
          const parsedPackages = storedPackages ? JSON.parse(storedPackages) : initialPackages;
          
          // Get courses from localStorage
          const storedCourses = localStorage.getItem('courses');
          const parsedCourses = storedCourses ? JSON.parse(storedCourses) : [];
          
          // Format courses to match package format
          const formattedCourses = parsedCourses.map((course, index) => ({
            _id: course._id || `course-${Date.now()}-${index}`,
            title: course.title,
            description: course.description || 'No description available',
            uploadDate: course.createdAt || new Date().toISOString(),
            filePath: '/course',
            progress: 0,
            instructor: 'You',
            duration: '1h 30min',
            isCustomCourse: true,
            coverImage: course.coverImage
          }));
          
          // Combine all content
          const allContent = Array.isArray(parsedPackages) 
            ? [...parsedPackages, ...formattedCourses] 
            : [...Object.values(parsedPackages), ...formattedCourses];
            
          setPackages(allContent);
          setError('Using offline mode - some features may be limited');
        } catch (localErr) {
          console.error('Error loading from localStorage:', localErr);
          setPackages([]);
          setError('Failed to load courses. Please try refreshing the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setPackages(prevPackages => prevPackages.filter(pkg => pkg._id !== id));
        
        const courseToDelete = packages.find(pkg => pkg._id === id);
        const isCustomCourse = courseToDelete && courseToDelete.isCustomCourse;
        
        if (isCustomCourse) {
          // Delete from courses API
          await coursesApi.deleteCourse(id);
        } else {
          // Delete from SCORM API
          await scormApi.deletePackage(id);
        }
      } catch (err) {
        console.error('Error deleting package:', err);
        setError('Failed to delete the course. Please try again.');
        
        // Reload packages to restore the deleted one
        const fetchAllContent = async () => {
          const [scormPackages, courses] = await Promise.all([
            scormApi.getAllPackages(),
            coursesApi.getAllCourses()
          ]);
          
          const formattedCourses = courses.map(course => ({
            _id: course._id,
            title: course.title,
            description: course.description || 'No description available',
            uploadDate: course.createdAt || new Date().toISOString(),
            filePath: '/course',
            progress: course.progress || 0,
            instructor: 'You',
            duration: '1h 30min',
            isCustomCourse: true,
            coverImage: course.coverImage
          }));
          
          setPackages([...scormPackages, ...formattedCourses]);
        };
        
        fetchAllContent().catch(fetchErr => {
          console.error('Error reloading content after delete:', fetchErr);
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="card flex-col items-center justify-center" style={{minHeight: '300px'}}>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert-error">
          <strong>Error:</strong> {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Main Dashboard Panel */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h1>Dashboard</h1>
          <button className="user-profile-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
            <span>Profile</span>
          </button>
        </div>

        <section className="welcome-section">
          <h2>Welcome back!</h2>
          
          <div className="section-header">
            <h3>Continue Learning</h3>
          </div>
          
          {packages.filter(pkg => pkg.progress > 0 && pkg.progress < 100).length > 0 ? (
            <div className="current-course">
              {packages
                .filter(pkg => pkg.progress > 0 && pkg.progress < 100)
                .slice(0, 1)
                .map((pkg) => (
                  <Link to={`/player/${pkg._id}`} key={pkg._id} className="course-progress-card">
                    <div className="play-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="course-info">
                      <div className="course-details">
                        <h4>{pkg.title}</h4>
                        <span className="author">{pkg.instructor}</span>
                      </div>
                      <div className="course-meta">
                        <span className="duration">Remaining <strong>{pkg.duration}</strong></span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${pkg.progress}%`}}></div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>You don't have any courses in progress.</p>
              <Link to="/create" className="btn btn-primary mt-3">Start a New Course</Link>
            </div>
          )}
          
          <div className="section-header">
            <h3>My Courses</h3>
            <Link to="/create" className="view-all-link">
              View all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
        </Link>
      </div>

          <div className="courses-grid">
            {packages.map((pkg) => (
              <Link to={`/player/${pkg._id}`} key={pkg._id} className="course-card">
                <div className="course-thumbnail">
                  {pkg.coverImage ? (
                    <img src={pkg.coverImage} alt={pkg.title} className="thumbnail-image" />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="course-content">
                  <h4>{pkg.title}</h4>
                  <p className="course-description">{pkg.description}</p>
                  <div className="course-footer">
                    <span className="course-instructor">{pkg.instructor}</span>
                    <span className="course-duration">{pkg.duration}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(pkg._id, e)} 
                    className="delete-button"
                    aria-label="Delete course"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <div className="sidebar-panel">
        <section className="upcoming-section">
          <h3>Upcoming Events</h3>
          
          <div className="events-list">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-date-badge">
                  <span className="event-month">Apr</span>
                  <span className="event-day">{event.date.split(' ')[1]}</span>
        </div>
                <div className="event-details">
                  <h4>{event.name}</h4>
                  <span className="event-location">{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="stats-section">
          <h3>Learning Stats</h3>
          
          {appStats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-header">
                <h4>{stat.name}</h4>
                <span className="stat-percentage">{stat.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${stat.progress}%`}}
                ></div>
              </div>
            </div>
          ))}
          
          <div className="stats-tabs">
            <button className="tab active">Weekly</button>
            <button className="tab">Monthly</button>
            <button className="tab">Yearly</button>
          </div>
        </section>
        </div>
      
      <style jsx>{`
        .dashboard-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard-panel, .sidebar-panel {
          background: var(--white);
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--card-shadow);
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .panel-header h1 {
          font-size: 20px;
          font-weight: var(--font-semibold);
          margin: 0;
          color: var(--dark);
        }
        
        .user-profile-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--secondary);
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .user-profile-button:hover {
          background-color: var(--secondary-hover);
        }
        
        h2 {
          font-size: 18px;
          font-weight: var(--font-semibold);
          margin: 0 0 16px 0;
          color: var(--dark);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0 16px 0;
        }
        
        .section-header h3 {
          font-size: 16px;
          font-weight: var(--font-medium);
          margin: 0;
          color: var(--dark);
        }
        
        .view-all-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: var(--primary);
          text-decoration: none;
          transition: opacity 0.2s;
        }
        
        .view-all-link:hover {
          opacity: 0.8;
        }
        
        .current-course {
          margin-bottom: 16px;
        }
        
        .course-progress-card {
          display: flex;
          flex-wrap: wrap;
          background: var(--secondary);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          padding: 16px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .course-progress-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--hover-shadow);
        }
        
        .play-button {
          width: 36px;
          height: 36px;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-right: 16px;
        }
        
        .course-info {
          flex: 1;
          padding-right: 16px;
        }
        
        .course-details h4 {
          font-size: 16px;
          font-weight: var(--font-medium);
          margin: 0 0 6px 0;
          color: var(--dark);
        }
        
        .author {
          font-size: 14px;
          color: var(--text);
        }
        
        .course-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }
        
        .duration {
          font-size: 14px;
          color: var(--text);
        }
        
        .duration strong {
          font-weight: var(--font-medium);
          color: var(--dark);
        }
        
        .progress-bar {
          height: 4px;
          background: var(--secondary-hover);
          width: 100%;
          margin-top: 12px;
          border-radius: 2px;
        }
        
        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 2px;
        }
        
        .empty-section {
          background: var(--secondary);
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          color: var(--text);
        }
        
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        
        .course-card {
          background: var(--white);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--card-shadow);
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          color: inherit;
          position: relative;
        }
        
        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--hover-shadow);
        }
        
        .course-thumbnail {
          height: 140px;
          background: var(--primary);
          position: relative;
          background-image: linear-gradient(45deg, var(--primary), var(--primary-hover));
        }
        
        .course-thumbnail-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
        }
        
        .course-progress-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 4px 8px;
        }
        
        .progress-text {
          font-size: 12px;
          font-weight: var(--font-medium);
          color: var(--primary);
        }
        
        .course-content {
          padding: 16px;
          position: relative;
        }
        
        .course-card h4 {
          font-size: 16px;
          font-weight: var(--font-medium);
          margin: 0 0 8px 0;
          color: var(--dark);
        }
        
        .course-description {
          font-size: 14px;
          color: var(--text);
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .course-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-light);
        }
        
        .delete-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .course-card:hover .delete-button {
          opacity: 1;
        }
        
        .delete-button:hover {
          color: var(--error);
        }
        
        .upcoming-section, .stats-section {
          margin-bottom: 24px;
        }
        
        .upcoming-section h3, .stats-section h3 {
          font-size: 16px;
          font-weight: var(--font-medium);
          margin: 0 0 16px 0;
          color: var(--dark);
        }
        
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .event-item {
          display: flex;
          gap: 12px;
          background: var(--secondary);
          border-radius: 12px;
          padding: 12px;
          transition: transform 0.2s;
        }
        
        .event-item:hover {
          transform: translateY(-2px);
        }
        
        .event-date-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          height: 48px;
          background: var(--white);
          border-radius: 8px;
          box-shadow: var(--card-shadow);
        }
        
        .event-month {
          font-size: 10px;
          font-weight: var(--font-medium);
          color: var(--text);
          text-transform: uppercase;
        }
        
        .event-day {
          font-size: 14px;
          font-weight: var(--font-bold);
          color: var(--primary);
        }
        
        .event-details {
          flex: 1;
        }
        
        .event-details h4 {
          font-size: 14px;
          font-weight: var(--font-medium);
          margin: 0 0 4px 0;
          color: var(--dark);
        }
        
        .event-location {
          font-size: 12px;
          color: var(--text);
        }
        
        .stat-item {
          margin-bottom: 20px;
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .stat-header h4 {
          font-size: 14px;
          font-weight: var(--font-medium);
          margin: 0;
          color: var(--dark);
        }
        
        .stat-percentage {
          font-size: 14px;
          font-weight: var(--font-medium);
          color: var(--primary);
        }
        
        .stats-tabs {
          display: flex;
          border-top: 1px solid var(--border);
          margin-top: 20px;
          padding-top: 12px;
        }
        
        .tab {
          flex: 1;
          padding: 8px;
          background: transparent;
          border: none;
          font-size: 14px;
          color: var(--text);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        
        .tab.active {
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
        }
        
        /* Responsive design */
        @media (max-width: 992px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
          
          .sidebar-panel {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        }
        
        @media (max-width: 768px) {
          .courses-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
          
          .sidebar-panel {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .courses-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ScormPackagesList; 