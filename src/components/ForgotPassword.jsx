import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, reset } from "../store/authSlice";
import "./style/Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isSuccess, isError, errorMessage } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess) {
      setSuccess("Password reset email sent! Please check your inbox.");
      setEmail("");

      // Clear success message after delay
      const timer = setTimeout(() => {
        dispatch(reset());
        setSuccess("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    dispatch(forgotPassword(email));
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
            <h2>Forgot Password</h2>
            <p>Enter your email address to receive a password reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {errorMessage}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              className={`auth-submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="form-footer">
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={() => navigate("/auth")}
                disabled={isLoading}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
