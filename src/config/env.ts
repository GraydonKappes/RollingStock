const env = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // Add your environment variables here with types
  // Example:
  // apiUrl: process.env.NEXT_PUBLIC_API_URL as string,
} as const;

// Validate required environment variables
function validateEnv() {
  if (env.isProduction) {
    // Add validation for required production environment variables
    // Example:
    // if (!process.env.NEXT_PUBLIC_API_URL) throw new Error('NEXT_PUBLIC_API_URL is required');
  }
}

// Run validation
validateEnv();

export default env; 