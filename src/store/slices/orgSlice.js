import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { OrganizationsAPI } from "../../services/api";

// Helper function to handle rate limit errors
const handleRateLimit = (error) => {
  if (error.status === 429) {
    return {
      message: error.message,
      isRateLimited: true,
      retryAfter: error.retryAfter,
    };
  }
  return {
    message: error.message || "An error occurred",
    isRateLimited: false,
    retryAfter: null,
  };
};

// Initial state
const initialState = {
  organizations: [],
  currentOrganization: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  isRateLimited: false,
  retryAfter: null,
};

// Async thunks
export const fetchOrganizations = createAsyncThunk(
  "org/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await OrganizationsAPI.getOrganizations();
      return response.data;
    } catch (error) {
      const errorInfo = handleRateLimit(error);
      return rejectWithValue(errorInfo);
    }
  }
);

export const createOrganization = createAsyncThunk(
  "org/createOrganization",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await OrganizationsAPI.create(orgData);
      console.log("response", response.data.data);
      return response;
    } catch (error) {
      const errorInfo = handleRateLimit(error);
      return rejectWithValue(errorInfo);
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "org/updateOrganization",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await OrganizationsAPI.update(id, data);
      return response.data;
    } catch (error) {
      const errorInfo = handleRateLimit(error);
      return rejectWithValue(errorInfo);
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "org/deleteOrganization",
  async (id, { rejectWithValue }) => {
    try {
      await OrganizationsAPI.delete(id);
      return id;
    } catch (error) {
      const errorInfo = handleRateLimit(error);
      return rejectWithValue(errorInfo);
    }
  }
);

// Organization slice
export const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = "";
      state.isRateLimited = false;
      state.retryAfter = null;
    },
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
    },
    clearRateLimit: (state) => {
      state.isRateLimited = false;
      state.retryAfter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload.message;
        state.isRateLimited = action.payload.isRateLimited;
        state.retryAfter = action.payload.retryAfter;
      })

      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.organizations.push(action.payload);
        state.currentOrganization = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload.message;
        state.isRateLimited = action.payload.isRateLimited;
        state.retryAfter = action.payload.retryAfter;
      })

      // Update organization
      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.organizations.findIndex(
          (org) => org._id === action.payload._id
        );
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        if (state.currentOrganization?._id === action.payload._id) {
          state.currentOrganization = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload.message;
        state.isRateLimited = action.payload.isRateLimited;
        state.retryAfter = action.payload.retryAfter;
      })

      // Delete organization
      .addCase(deleteOrganization.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.organizations = state.organizations.filter(
          (org) => org._id !== action.payload
        );
        if (state.currentOrganization?._id === action.payload) {
          state.currentOrganization = null;
        }
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload.message;
        state.isRateLimited = action.payload.isRateLimited;
        state.retryAfter = action.payload.retryAfter;
      });
  },
});

export const {
  reset,
  setCurrentOrganization,
  clearCurrentOrganization,
  clearRateLimit,
} = orgSlice.actions;
export default orgSlice.reducer;
