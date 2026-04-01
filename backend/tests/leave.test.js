const request = require('supertest');
const app     = require('../app');
const { connectTestDB, clearDB, closeDB } = require('./helpers');

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearDB());
afterAll(async  () => await closeDB());

const employeeData = { name: 'Emp',   email: 'emp@test.com',   password: 'pass123', role: 'employee' };
const adminData    = { name: 'Admin', email: 'admin@test.com', password: 'pass123', role: 'admin'    };

const getToken = async (userData) => {
  const res = await request(app).post('/api/v1/auth/register').send(userData);
  return res.body.data.token;
};

const futureDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const leavePayload = {
  leaveType: 'sick',
  startDate: futureDate(3),
  endDate:   futureDate(5),
  reason:    'Fever and rest needed',
};

describe('POST /api/v1/leave/apply', () => {
  it('employee can apply for leave', async () => {
    const token = await getToken(employeeData);
    const res = await request(app)
      .post('/api/v1/leave/apply')
      .set('Authorization', `Bearer ${token}`)
      .send(leavePayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.leave.status).toBe('pending');
  });

  it('admin cannot apply for leave', async () => {
    const token = await getToken(adminData);
    const res = await request(app)
      .post('/api/v1/leave/apply')
      .set('Authorization', `Bearer ${token}`)
      .send(leavePayload);
    expect(res.statusCode).toBe(403);
  });

  it('rejects missing fields', async () => {
    const token = await getToken(employeeData);
    const res = await request(app)
      .post('/api/v1/leave/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ leaveType: 'sick' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects past start date', async () => {
    const token = await getToken(employeeData);
    const res = await request(app)
      .post('/api/v1/leave/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...leavePayload, startDate: '2020-01-01', endDate: '2020-01-03' });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/v1/leave/my', () => {
  it('employee sees only their own leaves', async () => {
    const token = await getToken(employeeData);
    await request(app).post('/api/v1/leave/apply').set('Authorization', `Bearer ${token}`).send(leavePayload);
    const res = await request(app).get('/api/v1/leave/my').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.total).toBe(1);
  });

  it('admin cannot access /my', async () => {
    const token = await getToken(adminData);
    const res = await request(app).get('/api/v1/leave/my').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('GET /api/v1/leave/all', () => {
  it('admin sees all leave requests', async () => {
    const empToken   = await getToken(employeeData);
    const adminToken = await getToken(adminData);
    await request(app).post('/api/v1/leave/apply').set('Authorization', `Bearer ${empToken}`).send(leavePayload);
    const res = await request(app).get('/api/v1/leave/all').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.total).toBe(1);
  });

  it('employee cannot access /all', async () => {
    const token = await getToken(employeeData);
    const res = await request(app).get('/api/v1/leave/all').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('PUT /api/v1/leave/:id', () => {
  it('admin can approve a leave', async () => {
    const empToken   = await getToken(employeeData);
    const adminToken = await getToken(adminData);
    const apply = await request(app)
      .post('/api/v1/leave/apply')
      .set('Authorization', `Bearer ${empToken}`)
      .send(leavePayload);
    const leaveId = apply.body.data.leave._id;
    const res = await request(app)
      .put(`/api/v1/leave/${leaveId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved', adminComment: 'Approved' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.leave.status).toBe('approved');
  });

  it('cannot re-review an already approved leave', async () => {
    const empToken   = await getToken(employeeData);
    const adminToken = await getToken(adminData);
    const apply = await request(app)
      .post('/api/v1/leave/apply')
      .set('Authorization', `Bearer ${empToken}`)
      .send(leavePayload);
    const leaveId = apply.body.data.leave._id;
    await request(app).put(`/api/v1/leave/${leaveId}`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'approved' });
    const res = await request(app).put(`/api/v1/leave/${leaveId}`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'rejected' });
    expect(res.statusCode).toBe(400);
  });

  it('employee cannot approve leave', async () => {
    const empToken = await getToken(employeeData);
    const apply = await request(app)
      .post('/api/v1/leave/apply')
      .set('Authorization', `Bearer ${empToken}`)
      .send(leavePayload);
    const leaveId = apply.body.data.leave._id;
    const res = await request(app).put(`/api/v1/leave/${leaveId}`).set('Authorization', `Bearer ${empToken}`).send({ status: 'approved' });
    expect(res.statusCode).toBe(403);
  });
});
