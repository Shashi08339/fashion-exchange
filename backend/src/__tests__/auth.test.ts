// backend/src/__tests__/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';

describe('Authentication Routing Integration Engine Suites', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_exchange_test';
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should prevent access to protected resources when authentication headers are missing', async () => {
    const res = await request(app)
      .post('/api/listings')
      .send({ title: 'Invalid execution scope item' });
      
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});