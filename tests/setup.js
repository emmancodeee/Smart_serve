// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.LOG_LEVEL = 'ERROR'; // Reduce logging during tests