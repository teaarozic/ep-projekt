import request from 'supertest';
import app from '@/app.js';
import { prisma } from '@/lib/prisma.js';
import { jest } from '@jest/globals';

jest.setTimeout(20000);

let token: string;
let userEmail: string;
let clientId: number;

beforeAll(async () => {
  userEmail = `test-${Date.now()}@example.com`;
  const clientEmail = `client-${Date.now()}@example.com`;

  await request(app).post('/api/v1/auth/register').send({
    email: userEmail,
    password: 'testpass', // pragma: allowlist secret
  });

  await prisma.user.update({
    where: { email: userEmail },
    data: { role: 'ADMIN', status: 'Active' },
  });

  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: userEmail,
    password: 'testpass', // pragma: allowlist secret
  });

  token = loginRes.body.data.accessToken;
  if (!token) throw new Error('Login failed — no access token');

  const client = await prisma.client.create({
    data: {
      name: 'Test Client',
      email: clientEmail,
      company: 'Test Company',
      phone: '+111111111',
      user: { connect: { email: userEmail } },
    },
  });

  clientId = client.id;
});

describe('Projects CRUD (API /api/v1/projects)', () => {
  it('should create a new project', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Project',
        country: 'Bosnia',
        status: 'Active',
        clientId,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Project');
  });

  it('should not allow empty project name', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        country: 'Croatia',
        clientId,
      });

    expect(res.status).toBe(400);
  });

  it('should not allow duplicate project names for the same user', async () => {
    await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate Project', clientId });

    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate Project', clientId });

    expect([400, 409]).toContain(res.status);
  });

  it('should update an existing project', async () => {
    const created = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Old Project', clientId });

    const projectId = created.body.data.id;
    const res = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Project', status: 'Inactive' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Project');
  });

  it('should delete a project', async () => {
    const created = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete', clientId });

    const projectId = created.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 204]).toContain(res.status);
  });
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
