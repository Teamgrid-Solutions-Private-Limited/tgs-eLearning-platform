import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

// Import pages
import ScormPackagesList from './components/ScormPackagesList'
import ScormPlayer from './components/ScormPlayer'
import ScormUploader from './components/ScormUploader'
import ScormBuilder from './components/ScormBuilder'
import QuizBuilder from './components/QuizBuilder'
import CourseAnalytics from './components/CourseAnalytics'
import CreateCourse from './components/CreateCourse'

// NavLink component to handle active links
const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link 
      to={to} 
      className={isActive ? 'active' : ''} 
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="app-logo" onClick={closeMenu}>
              <div className="logo-icon">E</div>
              <h1>eLearning Platform</h1>
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
                  <NavLink to="/" onClick={closeMenu}>Dashboard</NavLink>
                </li>
                <li>
                  <NavLink to="/create" onClick={closeMenu}>Create Course</NavLink>
                </li>
                {/* <li>
                  <NavLink to="/quiz" onClick={closeMenu}>Create Quiz</NavLink>
                </li> */}
                <li>
                  <NavLink to="/analytics" onClick={closeMenu}>Analytics</NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="app-content" onClick={menuOpen ? closeMenu : undefined}>
          <Routes>
            <Route path="/" element={<ScormPackagesList />} />
            <Route path="/player/:id" element={<ScormPlayer />} />
            <Route path="/upload" element={<ScormUploader />} />
            <Route path="/create" element={<CreateCourse />} />
            <Route path="/builder" element={<ScormBuilder />} />
            <Route path="/quiz" element={<QuizBuilder />} />
            <Route path="/analytics" element={<CourseAnalytics />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© {new Date().getFullYear()} eLearning Platform</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
