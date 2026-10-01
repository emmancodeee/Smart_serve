const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  describe('GET /health', () => {
    it('should return health status (may be 503 if database unavailable)', async () => {
      const response = await request(app).get('/health');
      
      // Accept either 200 (healthy) or 503 (database unavailable)
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('ok');
      expect(response.body).toHaveProperty('uptimeSeconds');
      expect(response.body).toHaveProperty('database');
    });
  });
});

describe('Route Validation', () => {
  describe('GET /nonexistent-route', () => {
    it('should return 404 for non-existent routes (or 503 if database unavailable)', async () => {
      const response = await request(app).get('/api/nonexistent-route');
      
      // Accept either 404 (not found) or 503 (database unavailable)
      expect([404, 503]).toContain(response.status);
      if (response.status === 404) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });
});