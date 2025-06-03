import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, currentUser }) => {
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 