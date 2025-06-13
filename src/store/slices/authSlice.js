import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthAPI } from "../../services/api";
import { logEnvironmentInfo } from "../../utils/env";

// Log environment for debugging
logEnvironmentInfo();

// Get user from localStorage
const user = JSON.parse(localStorage.getItem("currentUser"));
const token = localStorage.getItem("token");

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!user,
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  roles: [],
  organizations: [],
};

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      console.log("Register thunk started", userData);
      // Actual API call for production
      const response = await AuthAPI.register(userData);
      console.log("Register response:", response);

      // Handle the backend response format
      const { token, data: user, success, message } = response.data;

      if (!success) {
        return thunkAPI.rejectWithValue(message || "Registration failed");
      }

      // Transform backend user object if needed
      const transformedUser = {
        ...user,
        id: user.id || user._id,
        roleName: user.role?.name || user.roleName || "User",
        roleId: user.role?._id || user.roleId || user.role,
        organizationName:
          user.organization?.name || user.organizationName || "",
        organizationId:
          user.organization?._id || user.organizationId || user.organization,
        organizationType:
          user.organization?.type || user.organizationType || "",
      };

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(transformedUser));

      return { user: transformedUser, token };
    } catch (error) {
      console.error("Registration error:", error);

      // Log detailed error information
      if (error.response) {
        console.error("Registration API response error details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }

      // Special handling for rate limit errors
      if (error.response?.status === 429) {
        return thunkAPI.rejectWithValue(
          "Rate limit reached. Please try again later or contact support if this persists."
        );
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Registration failed. Please try again.";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    console.log("Login thunk started", credentials);
    try {
      // Actual API call for production
      console.log("Using production API for login");
      const response = await AuthAPI.login(credentials);
      console.log("Login response:", response);

      // Handle the backend response format
      const { token, data: user, success, message } = response.data;

      if (!success) {
        return thunkAPI.rejectWithValue(message || "Login failed");
      }

      // Transform backend user object if needed
      const transformedUser = {
        ...user,
        id: user.id || user._id,
        roleName: user.role?.name || user.roleName || "User",
        roleId: user.role?._id || user.roleId || user.role,
        organizationName:
          user.organization?.name || user.organizationName || "",
        organizationId:
          user.organization?._id || user.organizationId || user.organization,
        organizationType:
          user.organization?.type || user.organizationType || "",
      };

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(transformedUser));

      return { user: transformedUser, token };
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    // Actual API call
    await AuthAPI.logout();
  } catch (error) {
    console.error("Logout API error:", error);
  }

  // Remove from localStorage regardless of API success
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
});

// Get current user
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, thunkAPI) => {
    try {
      // Actual API call for production
      const response = await AuthAPI.getMe();
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to get user data.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get roles
export const getRoles = createAsyncThunk(
  "auth/getRoles",
  async (_, thunkAPI) => {
    try {
      // Actual API call for production
      const response = await AuthAPI.getRoles();
      console.log("Roles response:", response);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to fetch roles.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get organizations
export const getOrganizations = createAsyncThunk(
  "auth/getOrganizations",
  async (_, thunkAPI) => {
    try {
      // Actual API call for production
      const response = await AuthAPI.getOrganizations();
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch organizations.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update password
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (passwordData, thunkAPI) => {
    try {
      // Actual API call
      const response = await AuthAPI.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      const { success, data, message } = response.data;

      if (!success) {
        return thunkAPI.rejectWithValue(message || "Failed to update password");
      }

      return { success, message: message || "Password updated successfully" };
    } catch (error) {
      console.error("Update password error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update password.";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      // Actual API call
      const response = await AuthAPI.forgotPassword(email);
      const { success, data, message } = response.data;

      if (!success) {
        return thunkAPI.rejectWithValue(
          message || "Failed to process password reset"
        );
      }

      return {
        success,
        message: data || message || "Password reset email sent successfully",
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to process password reset.";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, thunkAPI) => {
    try {
      // Actual API call
      const response = await AuthAPI.resetPassword(token, password);
      const { success, data, token: authToken, message } = response.data;

      if (!success) {
        return thunkAPI.rejectWithValue(message || "Failed to reset password");
      }

      // If successful and login token returned, save it
      if (authToken && data) {
        // Transform user data
        const transformedUser = {
          ...data,
          id: data.id || data._id,
          roleName: data.role?.name || data.roleName || "User",
          roleId: data.role?._id || data.roleId || data.role,
          organizationName:
            data.organization?.name || data.organizationName || "",
          organizationId:
            data.organization?._id || data.organizationId || data.organization,
          organizationType:
            data.organization?.type || data.organizationType || "",
        };

        // Store in localStorage
        localStorage.setItem("token", authToken);
        localStorage.setItem("currentUser", JSON.stringify(transformedUser));

        return {
          success: true,
          message: "Password reset successful",
          token: authToken,
          user: transformedUser,
        };
      }

      return { success: true, message: message || "Password reset successful" };
    } catch (error) {
      console.error("Reset password error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to reset password.";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify email
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, thunkAPI) => {
    try {
      // Actual API call
      const response = await AuthAPI.verifyEmail(token);
      const { success, message } = response.data;

      if (!success) {
        return thunkAPI.rejectWithValue(message || "Failed to verify email");
      }

      return { success, message: message || "Email verified successfully" };
    } catch (error) {
      console.error("Verify email error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to verify email.";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = "";
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setError: (state, action) => {
      state.isError = true;
      state.errorMessage = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.isError = false;
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isSuccess = false;
      })

      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Get roles cases
      .addCase(getRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
      })

      // Get organizations cases
      .addCase(getOrganizations.fulfilled, (state, action) => {
        state.organizations = action.payload;
      })

      // Update password cases
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // Verify email cases
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const { reset, setUser, setToken, setError, clearError } =
  authSlice.actions;
export default authSlice.reducer;
