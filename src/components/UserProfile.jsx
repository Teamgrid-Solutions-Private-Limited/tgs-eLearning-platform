import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import "./style/UserProfile.css";

const UserProfile = ({ onLogout }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);  
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setShowDropdown(false); 
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showDropdown]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
        setShowProfileModal(false);
        setShowHelpModal(false);
      }
    };

    if (showDropdown || showProfileModal || showHelpModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDropdown, showProfileModal, showHelpModal]);

  // Smart positioning to prevent dropdown from going off-screen
  useEffect(() => {
    if (showDropdown && dropdownRef.current && triggerRef.current) {
      const dropdown = dropdownRef.current;
      const trigger = triggerRef.current;

      // Reset positioning classes and styles
      dropdown.classList.remove("positioned-left", "positioned-center");
      dropdown.style.left = "";
      dropdown.style.right = "";
      dropdown.style.transform = "";

      // Use a small timeout to ensure the dropdown is fully rendered
      const timeoutId = setTimeout(() => {
        const viewportWidth = window.innerWidth;
        const triggerRect = trigger.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();

        const margin = 16; // Minimum margin from viewport edge

        // Calculate if there's enough space on the right (default position)
        const spaceOnRight = viewportWidth - triggerRect.right;
        const dropdownWidth = dropdownRect.width;

        if (spaceOnRight >= dropdownWidth + margin) {
          // Default position is fine
          dropdown.style.right = "0";
        } else {
          // Calculate if we can shift left
          const spaceOnLeft = triggerRect.left;

          if (spaceOnLeft >= dropdownWidth + margin) {
            // Position to align right edge with left edge of trigger
            dropdown.style.right = `${triggerRect.width}px`;
          } else {
            // Center in viewport if neither side has enough space
            const availableWidth = viewportWidth - 2 * margin;

            if (dropdownWidth <= availableWidth) {
              dropdown.classList.add("positioned-center");
            } else {
              // Force left alignment with margin if dropdown is too wide
              dropdown.classList.add("positioned-left");
            }
          }
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [showDropdown]);

  const handleLogout = async () => {
    setShowDropdown(false);

    // Dispatch logout action
    await dispatch(logout());

    // Call the logout callback from parent component
    if (onLogout) {
      onLogout();
    }

    // Redirect to auth page
    navigate("/auth");
  };

  const handleProfileSettings = () => {
    setShowDropdown(false);
    setShowProfileModal(true);
  };

  const handleHelpSupport = () => {
    setShowDropdown(false);
    setShowHelpModal(true);
  };

  const getInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getOrganizationTypeLabel = (type) => {
    const types = {
      education: "Educational Institution",
      corporate: "Corporate",
      government: "Government",
      nonprofit: "Non-Profit",
      healthcare: "Healthcare",
      other: "Other",
    };
    return types[type] || type;
  };

  const getRoleLabel = (role) => {
    // If role is already a string, return it
    if (typeof role === "string") {
      const roles = {
        admin: "Administrator",
        instructor: "Instructor",
        manager: "Manager",
        coordinator: "Coordinator",
      };
      return roles[role] || role;
    }

    // For new API structure, role could be the name directly
    return role;
  };

  const formatMemberSince = (loginTime) => {
    try {
      return new Date(loginTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <button
        ref={triggerRef}
        className={`profile-trigger ${showDropdown ? "active" : ""}`}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="User menu"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <div className="profile-avatar">{getInitials()}</div>
        <div className="profile-info">
          <span className="profile-name">
            {user.firstName} {user.lastName}
          </span>
          <span className="profile-org">{user.organizationName}</span>
        </div>
        <span className={`dropdown-arrow ${showDropdown ? "rotated" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="profile-dropdown"
          role="menu"
          aria-label="User menu"
        >
          <div className="dropdown-header">
            <div className="dropdown-avatar">{getInitials()}</div>
            <div className="dropdown-info">
              <h4>
                {user.firstName} {user.lastName}
              </h4>
              <p className="user-email">{user.email}</p>
              <span className="org-badge">{user.organizationName}</span>
            </div>
          </div>

          <div className="dropdown-content">
            <div className="user-details">
              <div className="detail-item">
                <span className="detail-label">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                  </svg>
                  Role
                </span>
                <span className="detail-value">
                  {getRoleLabel(user.roleName || user.role)}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687ZM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.81 8.985.936 8 1.783Z" />
                  </svg>
                  Organization
                </span>
                <span className="detail-value">
                  {getOrganizationTypeLabel(user.organizationType)}
                </span>
              </div>

              {user.position && (
                <div className="detail-item">
                  <span className="detail-label">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                      <path d="M5.5 1A2.5 2.5 0 0 0 3 3.5v9A2.5 2.5 0 0 0 5.5 15h5a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 10.5 1h-5ZM6 4h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1Zm-.5 2h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1ZM6 8h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1Zm0 2h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1Z" />
                    </svg>
                    Position
                  </span>
                  <span className="detail-value">{user.position}</span>
                </div>
              )}

              {user.department && (
                <div className="detail-item">
                  <span className="detail-label">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
                    </svg>
                    Department
                  </span>
                  <span className="detail-value">{user.department}</span>
                </div>
              )}

              <div className="detail-item">
                <span className="detail-label">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                  </svg>
                  Member Since
                </span>
                <span className="detail-value">
                  {formatMemberSince(user.createdAt || user.loginTime)}
                </span>
              </div>
            </div>

            <div className="dropdown-actions">
              <button
                className="dropdown-action-btn profile-btn"
                onClick={handleProfileSettings}
                role="menuitem"
              >
                <span className="action-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                  </svg>
                </span>
                Profile Settings
              </button>

              <button
                className="dropdown-action-btn help-btn"
                onClick={handleHelpSupport}
                role="menuitem"
              >
                <span className="action-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                  </svg>
                </span>
                Help & Support
              </button>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-action-btn logout-btn"
                onClick={handleLogout}
                role="menuitem"
              >
                <span className="action-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                    />
                    <path
                      fillRule="evenodd"
                      d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                    />
                  </svg>
                </span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="modal-content profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Profile Settings</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-info-section">
                <div className="profile-avatar-large">{getInitials()}</div>
                <h4>
                  {user.firstName} {user.lastName}
                </h4>
                <p className="profile-email">{user.email}</p>
              </div>

              <div className="profile-details-grid">
                <div className="profile-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={user.firstName}
                    readOnly
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={user.lastName}
                    readOnly
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label>Organization</label>
                  <input
                    type="text"
                    value={user.organizationName}
                    readOnly
                    className="profile-input"
                  />
                </div>
                <div className="profile-field">
                  <label>Role</label>
                  <input
                    type="text"
                    value={getRoleLabel(user.roleName || user.role)}
                    readOnly
                    className="profile-input"
                  />
                </div>
                {user.position && (
                  <div className="profile-field">
                    <label>Position</label>
                    <input
                      type="text"
                      value={user.position}
                      readOnly
                      className="profile-input"
                    />
                  </div>
                )}
                {user.department && (
                  <div className="profile-field">
                    <label>Department</label>
                    <input
                      type="text"
                      value={user.department}
                      readOnly
                      className="profile-input"
                    />
                  </div>
                )}
              </div>

              <div className="profile-note">
                <p>
                  <strong>Note:</strong> Profile editing is currently read-only.
                  Contact your administrator to update your information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div
            className="modal-content help-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Help & Support</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowHelpModal(false)}
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="help-sections">
                <div className="help-section">
                  <h4>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      />
                    </svg>
                    Getting Started
                  </h4>
                  <ul>
                    <li>
                      Use the <strong>Content Builder</strong> to create
                      interactive Learning Modules
                    </li>
                    <li>
                      Upload existing E-Learning content using the{" "}
                      <strong>Upload</strong> feature
                    </li>
                    <li>View and manage your packages in the main dashboard</li>
                    <li>Preview content before publishing</li>
                  </ul>
                </div>

                <div className="help-section">
                  <h4>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Content Builder Features
                  </h4>
                  <ul>
                    <li>Choose from various templates and layouts</li>
                    <li>Add text, images, videos, and interactive elements</li>
                    <li>Auto-save functionality keeps your work safe</li>
                    <li>Export as E-Learning Standard compliant packages</li>
                  </ul>
                </div>

                <div className="help-section">
                  <h4>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                      />
                    </svg>
                    Supported Formats
                  </h4>
                  <ul>
                    <li>E-Learning Standard packages</li>
                    <li>Images: JPG, PNG, GIF, SVG</li>
                    <li>Videos: MP4, WebM</li>
                    <li>Documents: PDF (for reference)</li>
                  </ul>
                </div>

                <div className="help-section">
                  <h4>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Need More Help?
                  </h4>
                  <p>Contact our support team for additional assistance:</p>
                  <div className="contact-info">
                    <p>
                      <strong>Email:</strong> support@tgs-elearning.com
                    </p>
                    <p>
                      <strong>Phone:</strong> +1 (555) 123-4567
                    </p>
                    <p>
                      <strong>Hours:</strong> Monday - Friday, 9 AM - 5 PM EST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
