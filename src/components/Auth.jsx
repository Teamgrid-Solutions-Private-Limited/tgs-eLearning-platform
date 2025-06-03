import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationType: 'education',
    role: 'admin',
    phone: '',
    agreeToTerms: false
  });

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      onAuthSuccess(user);
      navigate('/');
    }

    // Initialize demo users if none exist
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const demoUsers = [
        {
          id: 'demo1',
          email: 'admin@demo.com',
          password: 'demo123',
          firstName: 'John',
          lastName: 'Admin',
          organizationName: 'Demo University',
          organizationType: 'education',
          role: 'admin',
          phone: '+1-555-0123',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'demo2',
          email: 'instructor@demo.com',
          password: 'demo123',
          firstName: 'Sarah',
          lastName: 'Johnson',
          organizationName: 'Tech Corp Learning',
          organizationType: 'corporate',
          role: 'instructor',
          phone: '+1-555-0124',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }
  }, [navigate, onAuthSuccess]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required');
        return false;
      }
      
      if (!formData.organizationName) {
        setError('Organization name is required');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      
      if (!formData.agreeToTerms) {
        setError('You must agree to the terms and conditions');
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => 
      u.email === formData.email && u.password === formData.password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Create session
    const sessionData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: user.organizationName,
      organizationType: user.organizationType,
      role: user.role,
      loginTime: new Date().toISOString(),
      sessionId: Date.now().toString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    return sessionData;
  };

  const handleSignup = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === formData.email)) {
      throw new Error('An account with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: formData.email,
      password: formData.password, // In real app, this would be hashed
      firstName: formData.firstName,
      lastName: formData.lastName,
      organizationName: formData.organizationName,
      organizationType: formData.organizationType,
      role: formData.role,
      phone: formData.phone,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Create session
    const sessionData = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      organizationName: newUser.organizationName,
      organizationType: newUser.organizationType,
      role: newUser.role,
      loginTime: new Date().toISOString(),
      sessionId: Date.now().toString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    return sessionData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let userData;
      
      if (isLogin) {
        userData = await handleLogin();
        setSuccess('Login successful! Redirecting...');
      } else {
        userData = await handleSignup();
        setSuccess('Account created successfully! Redirecting...');
      }
      
      // Call the auth success callback
      onAuthSuccess(userData);
      
      // Redirect after success
      setTimeout(() => {
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo);
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      organizationName: '',
      organizationType: 'education',
      role: 'admin',
      phone: '',
      agreeToTerms: false
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">S</div>
              <h1>TGS eLearning Platform</h1>
            </div>
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>
              {isLogin 
                ? 'Sign in to your organization account' 
                : 'Set up your organization on our platform'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="organizationName">Organization Name</label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="Enter your organization name"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="organizationType">Organization Type</label>
                    <select
                      id="organizationType"
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="education">Educational Institution</option>
                      <option value="corporate">Corporate</option>
                      <option value="government">Government</option>
                      <option value="nonprofit">Non-Profit</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Your Role</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="admin">Administrator</option>
                      <option value="instructor">Instructor</option>
                      <option value="manager">Manager</option>
                      <option value="coordinator">Coordinator</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                disabled={loading}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
                />
              </div>
            )}

            {!isLogin && (
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                  />
                  <span className="checkmark"></span>
                  I agree to the <a href="#" className="link">Terms of Service</a> and <a href="#" className="link">Privacy Policy</a>
                </label>
              </div>
            )}

            <button
              type="submit"
              className={`auth-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={toggleMode}
                disabled={loading}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            
            {isLogin && (
              <div className="demo-accounts">
                <p className="demo-title">Try Demo Accounts:</p>
                <div className="demo-buttons">
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        email: 'admin@demo.com',
                        password: 'demo123'
                      }));
                    }}
                    disabled={loading}
                  >
                    Admin Demo
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        email: 'instructor@demo.com',
                        password: 'demo123'
                      }));
                    }}
                    disabled={loading}
                  >
                    Instructor Demo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="auth-features">
          <h3>Why Choose Our Platform?</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h4>Content Builder</h4>
              <p>Create interactive learning courses with our drag-and-drop builder</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h4>Analytics</h4>
              <p>Track learner progress and course effectiveness</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h4>Secure</h4>
              <p>Enterprise-grade security for your organization</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌐</div>
              <h4>E-Learning Standard Compatible</h4>
              <p>Full support for modern e-learning standards and LMS integration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 