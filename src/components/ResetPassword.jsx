import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, reset } from "../store/authSlice";
import "./style/Auth.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [validationError, setValidationError] = useState("");

  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isSuccess, isError, errorMessage } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess) {
      setSuccess(
        "Password reset successful! You can now login with your new password."
      );
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after delay
      const timer = setTimeout(() => {
        dispatch(reset());
        navigate("/auth");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch, navigate]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const validateForm = () => {
    setValidationError("");

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(resetPassword({ token, password }));
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
            <h2>Reset Password</h2>
            <p>Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {errorMessage}
              </div>
            )}

            {validationError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {validationError}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={isLoading || isSuccess}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isLoading || isSuccess}
                required
              />
            </div>

            <button
              type="submit"
              className={`auth-submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
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

export default ResetPassword;
