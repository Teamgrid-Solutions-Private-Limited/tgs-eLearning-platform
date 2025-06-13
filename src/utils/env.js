// Helper functions for environment detection

// Check if we're in development mode
export const isDevelopment = () => {
  return (
    import.meta.env.DEV ||
    import.meta.env.MODE === "development" ||
    process.env.NODE_ENV === "development"
  );
};

// Check if we're in production mode
export const isProduction = () => {
  return (
    import.meta.env.PROD ||
    import.meta.env.MODE === "production" ||
    process.env.NODE_ENV === "production"
  );
};

// Get the current environment
export const getEnvironment = () => {
  if (isDevelopment()) return "development";
  if (isProduction()) return "production";
  return "unknown";
};

// Log environment information for debugging
export const logEnvironmentInfo = () => {
  console.log("Environment Info:", {
    isDev: isDevelopment(),
    isProd: isProduction(),
    environment: getEnvironment(),
    importMetaEnv: {
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    },
    processEnv: {
      NODE_ENV: process.env.NODE_ENV,
    },
  });
};
