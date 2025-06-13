import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  login,
  register,
  reset as resetAuth,
  getRoles,
  getOrganizations,
  setError as setAuthError,
  clearError as clearAuthError,
} from "../store/slices/authSlice";
import {
  createOrganization,
  reset as resetOrg,
  setCurrentOrganization,
} from "../store/slices/orgSlice";

import { logEnvironmentInfo } from "../utils/env";
import "./style/Auth.css";

const Auth = () => {
  // Log environment info for debugging
  useEffect(() => {
    logEnvironmentInfo();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    user,
    isLoading: authLoading,
    isSuccess,
    isError: authError,
    errorMessage: authErrorMessage,
    roles,
    organizations,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  const {
    isLoading: orgLoading,
    isError: orgError,
    errorMessage: orgErrorMessage,
    isRateLimited,
    retryAfter,
  } = useSelector((state) => state.org);

  const isLoading = authLoading || orgLoading;
  const isError = authError || orgError;
  const errorMessage = authErrorMessage || orgErrorMessage;

  const [isLogin, setIsLogin] = useState(true);
  const [showOrgSetup, setShowOrgSetup] = useState(false);
  const [success, setSuccess] = useState("");
  const [createdOrgId, setCreatedOrgId] = useState("");
  const [createdOrgName, setCreatedOrgName] = useState("");
  console.log("Roles:", roles);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "",
    termsAccepted: false,
    privacyPolicyAccepted: false,
  });

  // Organization form data
  const [orgFormData, setOrgFormData] = useState({
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });

  // Fetch roles on component mount
  useEffect(() => {
    // In development, use mock roles instead of API call
    if (process.env.NODE_ENV === "development") {
      const mockRoles = [
        { _id: "admin", name: "Administrator" },
        { _id: "instructor", name: "Instructor" },
      ];
      dispatch({ type: "auth/getRoles/fulfilled", payload: mockRoles });
    } else {
      dispatch(getRoles());
    }
  }, [dispatch]);

  // Reset success/error states when component unmounts
  useEffect(() => {
    dispatch(getRoles());
    return () => {
      dispatch(resetAuth());
      dispatch(resetOrg());
    };
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo);
    }
  }, [isAuthenticated, user, navigate, location]);

  // Check if login/register was successful
  useEffect(() => {
    if (isSuccess) {
      setSuccess(
        isLogin
          ? "Login successful! Redirecting..."
          : "Account created successfully! Redirecting..."
      );

      // Reset form data
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        role: "",
        termsAccepted: false,
        privacyPolicyAccepted: false,
      });

      // Clear success message after delay
      const timer = setTimeout(() => {
        dispatch(resetAuth());
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, isLogin, dispatch]);

  // Fetch organizations
  // useEffect(() => {
  //   dispatch(getOrganizations());
  // }, [dispatch]);

  const handleOrgInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setOrgFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setOrgFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting organization form:", orgFormData);

    // Check if rate limited
    if (isRateLimited) {
      dispatch(
        setAuthError(
          `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
        )
      );
      return;
    }

    // Validate organization data
    const errors = {};

    // Required fields
    if (!orgFormData.name) {
      errors.name = "Organization name is required";
    } else if (orgFormData.name.length > 100) {
      errors.name = "Organization name cannot be more than 100 characters";
    }

    if (orgFormData.description && orgFormData.description.length > 500) {
      errors.description = "Description cannot be more than 500 characters";
    }

    if (
      orgFormData.website &&
      !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
        orgFormData.website
      )
    ) {
      errors.website = "Please provide a valid website URL";
    }

    if (orgFormData.email && !/\S+@\S+\.\S+/.test(orgFormData.email)) {
      errors.email = "Please provide a valid email";
    }

    if (orgFormData.phone && orgFormData.phone.length > 20) {
      errors.phone = "Phone number cannot be longer than 20 characters";
    }

    // Address validation
    if (orgFormData.address) {
      if (orgFormData.address.street && !orgFormData.address.street.trim()) {
        errors.street = "Street address cannot be empty";
      }
      if (orgFormData.address.city && !orgFormData.address.city.trim()) {
        errors.city = "City cannot be empty";
      }
      if (orgFormData.address.state && !orgFormData.address.state.trim()) {
        errors.state = "State cannot be empty";
      }
      if (orgFormData.address.country && !orgFormData.address.country.trim()) {
        errors.country = "Country cannot be empty";
      }
      if (orgFormData.address.zipCode && !orgFormData.address.zipCode.trim()) {
        errors.zipCode = "Zip code cannot be empty";
      }
    }

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      dispatch(setAuthError(firstError));
      return;
    }

    try {
      // Create organization using Redux action
      const resultAction = await dispatch(createOrganization(orgFormData));

      if (createOrganization.fulfilled.match(resultAction)) {
        const createdOrg = resultAction.payload.data;
        console.log("Organization created:", createdOrg);
        localStorage.setItem("orgId", createdOrg._id);

        // Set the created organization as current
        dispatch(setCurrentOrganization(createdOrg));

        setCreatedOrgId(createdOrg._id);
        setCreatedOrgName(createdOrg.name);
        setShowOrgSetup(false);
        setIsLogin(false);
        setSuccess("Organization created successfully");

        // Reset organization form data
        setOrgFormData({
          name: "",
          description: "",
          website: "",
          email: "",
          phone: "",
          address: {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
          },
        });
      } else {
        throw new Error(
          resultAction.payload.message || "Failed to create organization"
        );
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      dispatch(
        setAuthError(
          error.message || "Failed to create organization. Please try again."
        )
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (isError) {
      dispatch(clearAuthError());
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // For registration form only
    if (!isLogin) {
      // First name validation
      if (!formData.firstName) {
        errors.firstName = "First name is required";
      } else if (formData.firstName.trim().length === 0) {
        errors.firstName = "First name cannot be empty";
      } else if (formData.firstName.length > 50) {
        errors.firstName = "First name cannot be more than 50 characters";
      }

      // Last name validation
      if (!formData.lastName) {
        errors.lastName = "Last name is required";
      } else if (formData.lastName.trim().length === 0) {
        errors.lastName = "Last name cannot be empty";
      } else if (formData.lastName.length > 50) {
        errors.lastName = "Last name cannot be more than 50 characters";
      }

      // Confirm password
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      // Role validation
      if (!formData.role) {
        errors.role = "Role is required";
      }

      // Terms agreement
      if (!formData.termsAccepted) {
        errors.termsAccepted = "You must agree to the terms";
      }
    }

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      dispatch(setAuthError(firstError));
      return false;
    }

    dispatch(clearAuthError());
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRateLimited) {
      dispatch(
        setAuthError(
          "Please wait before trying again. Our API has rate limits in place."
        )
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      dispatch(
        login({
          email: formData.email,
          password: formData.password,
        })
      );
    } else {
      if (!createdOrgId) {
        dispatch(setAuthError("Please create an organization first"));
        return;
      }

      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organization: createdOrgId,
        // position: formData.position || "",
        // department: formData.department || "",
        termsAccepted: formData.termsAccepted,
        privacyPolicyAccepted: formData.termsAccepted,
      };
      console.log("Register data:", registerData);
      dispatch(register(registerData));
    }
  };

  const toggleMode = () => {
    console.log("Toggle mode called. Current isLogin:", isLogin);
    if (isLogin) {
      // When switching to signup, show organization form first
      console.log("Switching to signup, showing org form");
      setShowOrgSetup(true);
      setIsLogin(false);
    } else {
      // When switching to login, reset all states
      console.log("Switching to login, resetting states");
      setShowOrgSetup(false);
      setCreatedOrgId("");
      setCreatedOrgName("");
      setIsLogin(true);
    }
    dispatch(resetAuth());
    setSuccess("");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: roles && roles.length > 0 ? roles[0]._id : "",
      termsAccepted: false,
      privacyPolicyAccepted: false,
    });
  };

  const renderOrgSetupForm = () => (
    <form onSubmit={handleOrgSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="orgName">Organization Name</label>
        <input
          type="text"
          id="orgName"
          name="name"
          value={orgFormData.name}
          onChange={handleOrgInputChange}
          placeholder="Enter organization name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="orgDescription">Description</label>
        <textarea
          id="orgDescription"
          name="description"
          value={orgFormData.description}
          onChange={handleOrgInputChange}
          placeholder="Enter organization description"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="orgWebsite">Website</label>
        <input
          type="url"
          id="orgWebsite"
          name="website"
          value={orgFormData.website}
          onChange={handleOrgInputChange}
          placeholder="Enter organization website"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="orgEmail">Organization Email</label>
        <input
          type="email"
          id="orgEmail"
          name="email"
          value={orgFormData.email}
          onChange={handleOrgInputChange}
          placeholder="Enter organization email"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="orgPhone">Phone</label>
        <input
          type="tel"
          id="orgPhone"
          name="phone"
          value={orgFormData.phone}
          onChange={handleOrgInputChange}
          placeholder="Enter organization phone"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="orgStreet">Street Address</label>
        <input
          type="text"
          id="orgStreet"
          name="address.street"
          value={orgFormData.address.street}
          onChange={handleOrgInputChange}
          placeholder="Enter street address"
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="orgCity">City</label>
          <input
            type="text"
            id="orgCity"
            name="address.city"
            value={orgFormData.address.city}
            onChange={handleOrgInputChange}
            placeholder="Enter city"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="orgState">State</label>
          <input
            type="text"
            id="orgState"
            name="address.state"
            value={orgFormData.address.state}
            onChange={handleOrgInputChange}
            placeholder="Enter state"
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="orgCountry">Country</label>
          <input
            type="text"
            id="orgCountry"
            name="address.country"
            value={orgFormData.address.country}
            onChange={handleOrgInputChange}
            placeholder="Enter country"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="orgZipCode">ZIP Code</label>
          <input
            type="text"
            id="orgZipCode"
            name="address.zipCode"
            value={orgFormData.address.zipCode}
            onChange={handleOrgInputChange}
            placeholder="Enter ZIP code"
            required
          />
        </div>
      </div>
      <button type="submit" className="auth-submit-btn">
        Create Organization
      </button>
    </form>
  );

  // Add useEffect to monitor state changes
  useEffect(() => {
    console.log("State updated:", {
      isLogin,
      showOrgSetup,
      createdOrgId,
      createdOrgName,
    });
  }, [isLogin, showOrgSetup, createdOrgId, createdOrgName]);

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
            <h2>
              {showOrgSetup
                ? "Create Organization"
                : isLogin
                ? "Welcome Back"
                : "Create Account"}
            </h2>
            <p>
              {showOrgSetup
                ? "Set up your organization first"
                : isLogin
                ? "Sign in to your organization account"
                : createdOrgName
                ? `Complete your registration for ${createdOrgName}`
                : "Complete your registration"}
            </p>
          </div>
          {/* 
          {isError && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {errorMessage}
              {isRateLimited && retryAfter && (
                <div className="rate-limit-info">
                  Please try again in {retryAfter} seconds
                </div>
              )}
            </div>
          )} */}

          {/* {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )} */}

          {showOrgSetup ? (
            <div>{renderOrgSetupForm()}</div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Your Role</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    >
                      {roles.length === 0 && (
                        <option value="">Loading roles...</option>
                      )}
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
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
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                {isLogin && (
                  <div className="forgot-password">
                    <a href="/forgot-password" className="link">
                      Forgot Password?
                    </a>
                  </div>
                )}
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
                    disabled={isLoading}
                    required
                  />
                </div>
              )}

              {!isLogin && (
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                    <span className="checkmark"></span>I agree to the{" "}
                    <a href="#" className="link">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="link">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              )}

              <button
                type="submit"
                className={`auth-submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={toggleMode}
                disabled={isLoading}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-features">
          <h3>Why Choose Our Platform?</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h4>Content Builder</h4>
              <p>
                Create interactive learning courses with our drag-and-drop
                builder
              </p>
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
              <p>
                Full support for modern e-learning standards and LMS integration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
