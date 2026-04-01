const request   = require('supertest');
const app       = require('../app');
const { connectTestDB, clearDB, closeDB } = require('./helpers');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearDB());
afterAll(async  () => await closeDB());

const baseUser = { name: 'Test User', email: 'test@example.com', password: 'pass123', role: 'employee' };

describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(baseUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(baseUser.email);
    expect(res.body.data.user.role).toBe('employee');
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(baseUser);
    const res = await request(app).post('/api/v1/auth/register').send(baseUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'a@b.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...baseUser, password: '123' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(baseUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: baseUser.email,
      password: baseUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: baseUser.email,
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'ghost@example.com',
      password: 'pass123',
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns current user with valid token', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send(baseUser);
    const token = reg.body.data.token;
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(baseUser.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
