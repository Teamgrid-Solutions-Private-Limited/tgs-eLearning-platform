// Save user and token to localStorage
export const setCurrentUser = (userData, token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("currentUser", JSON.stringify(userData));
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

// Remove user and token from localStorage
export const clearCurrentUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Check if email is verified
export const isEmailVerified = () => {
  const user = getCurrentUser();
  return user ? user.isEmailVerified : false;
};

// Format user data for frontend consumption
export const formatUserData = (apiUserData) => {
  return {
    id: apiUserData.id,
    firstName: apiUserData.firstName,
    lastName: apiUserData.lastName,
    email: apiUserData.email,
    role: apiUserData.role.name,
    roleName: apiUserData.role.name,
    roleId: apiUserData.role._id,
    organizationName: apiUserData.organization.name,
    organizationId: apiUserData.organization._id,
    organizationType: apiUserData.organization.type,
    position: apiUserData.position,
    department: apiUserData.department,
    isEmailVerified: apiUserData.isEmailVerified,
    createdAt: apiUserData.createdAt,
    loginTime: new Date().toISOString(),
  };
};
