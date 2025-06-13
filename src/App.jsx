import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./store/slices/authSlice";
import "./App.css";

// Import pages
import CoursesList from "./components/CoursesList";
import CoursePlayer from "./components/CoursePlayer";
import ContentUploader from "./components/ContentUploader";
import ContentBuilder from "./components/ContentBuilder";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./components/UserProfile";
import TemplateLibrary from "./components/TemplateLibrary";
import OrganizationForm from "./components/OrganizationForm";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
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
        {isAuthenticated && user && (
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
                <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
                  <li>
                    <Link to="/" onClick={closeMenu}>
                      My Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/upload" onClick={closeMenu}>
                      Upload Module
                    </Link>
                  </li>
                  <li>
                    <Link to="/content-builder" onClick={closeMenu}>
                      Content Builder
                    </Link>
                  </li>
                </ul>
              </nav>

              <UserProfile currentUser={user} onLogout={handleLogout} />
            </div>
          </header>
        )}

        <main
          className={`app-content ${!isAuthenticated ? "no-header" : ""}`}
          onClick={menuOpen ? closeMenu : undefined}
        >
          <Routes>
            {/* Public route */}
            <Route
              path="/auth"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />}
            />

            {/* Redirect login and register to auth */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth" replace />} />

            {/* Organization routes */}
            <Route path="/organization/create" element={<OrganizationForm />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CoursesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/player/:id"
              element={
                <ProtectedRoute>
                  <CoursePlayer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <ContentUploader />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content-builder"
              element={
                <ProtectedRoute>
                  <ContentBuilder />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {isAuthenticated && user && (
          <footer className="app-footer">
            <div className="footer-content">
              <p>© {new Date().getFullYear()} TGS eLearning Platform</p>
              <div className="footer-info">
                <span>Welcome, {user.firstName}!</span>
                <span className="org-info">{user.organizationName}</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;
