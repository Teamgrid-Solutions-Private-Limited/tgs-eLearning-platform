import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'

// Import pages
import CoursesList from './components/CoursesList'
import CoursePlayer from './components/CoursePlayer'
import ContentUploader from './components/ContentUploader'
import ContentBuilder from './components/ContentBuilder'
import Auth from './components/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import UserProfile from './components/UserProfile'
import TemplateLibrary from './components/TemplateLibrary'

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Validate session (in real app, this would verify with backend)
          if (userData.sessionId && userData.email) {
            setCurrentUser(userData);
          } else {
            // Invalid session data, clear it
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {currentUser && (
          <header className="app-header">
            <div className="header-content">
              <Link to="/" className="app-logo" onClick={closeMenu}>
                <div className="logo-icon">S</div>
                <h1>TGS eLearning Platform</h1>
              </Link>

              <button 
                className="nav-toggle" 
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
              >
                ☰
              </button>

              <nav>
                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                  <li>
                    <Link to="/" onClick={closeMenu}>My Courses</Link>
                  </li>
                  <li>
                    <Link to="/upload" onClick={closeMenu}>Upload Module</Link>
                  </li>
                  <li>
                    <Link to="/content-builder" onClick={closeMenu}>Content Builder</Link>
                  </li>
                </ul>
              </nav>

              <UserProfile 
                currentUser={currentUser} 
                onLogout={handleLogout}
              />
            </div>
          </header>
        )}

        <main className={`app-content ${!currentUser ? 'no-header' : ''}`} onClick={menuOpen ? closeMenu : undefined}>
          <Routes>
            {/* Public route */}
            <Route 
              path="/auth" 
              element={
                currentUser ? (
                  <Navigate to="/" replace />
                ) : (
                  <Auth onAuthSuccess={handleAuthSuccess} />
                )
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <CoursesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/player/:id" 
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <CoursePlayer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <ContentUploader />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/content-builder" 
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <ContentBuilder />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        {currentUser && (
          <footer className="app-footer">
            <div className="footer-content">
              <p>© {new Date().getFullYear()} TGS eLearning Platform</p>
              <div className="footer-info">
                <span>Welcome, {currentUser.firstName}!</span>
                <span className="org-info">{currentUser.organizationName}</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </Router>
  )
}

export default App
