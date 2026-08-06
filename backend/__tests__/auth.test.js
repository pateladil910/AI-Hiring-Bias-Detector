const request = require('supertest');
const app = require('../../src/index');

describe('Auth Routes', () => {
  const testRecruiter = {
    email: `recruiter_${Date.now()}@test.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Recruiter',
    role: 'recruiter',
    orgName: 'Test Corp',
  };
  const testCandidate = {
    email: `candidate_${Date.now()}@test.com`,
    password: 'TestPass123!',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'candidate',
  };

  let recruiterToken = '';
  let candidateToken = '';

  describe('POST /api/auth/register', () => {
    it('registers a recruiter successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(testRecruiter);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('recruiter');
      recruiterToken = res.body.token;
    });

    it('registers a candidate successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(testCandidate);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('candidate');
      candidateToken = res.body.token;
    });

    it('rejects duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send(testRecruiter);
      expect(res.statusCode).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_TAKEN');
    });

    it('rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testCandidate, email: 'not-an-email' });
      expect(res.statusCode).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in a recruiter successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testRecruiter.email, password: testRecruiter.password });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testRecruiter.email, password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user for valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe(testRecruiter.email);
    });

    it('rejects request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });
});
