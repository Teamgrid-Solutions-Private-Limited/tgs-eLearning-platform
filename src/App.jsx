import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Import pages
import ScormPackagesList from './components/ScormPackagesList'
import ScormPlayer from './components/ScormPlayer'
import ScormUploader from './components/ScormUploader'
import ScormBuilder from './components/ScormBuilder'

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
              <div className="logo-icon">S</div>
              <h1>SCORM Learning Platform</h1>
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
                  <Link to="/upload" onClick={closeMenu}>Upload SCORM</Link>
                </li>
                <li>
                  <Link to="/builder" onClick={closeMenu}>SCORM Builder</Link>
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
            <Route path="/builder" element={<ScormBuilder />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© {new Date().getFullYear()} SCORM Learning Platform</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
