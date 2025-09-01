const request = require('supertest');
const express = require('express');

describe('Assistant Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const assistantRoutes = require('../../routes/assistantRoutes');
    app.use('/assistant', assistantRoutes);
  });

  test('returns fallback response when GROQ_API_KEY is missing', async () => {
    delete process.env.GROQ_API_KEY;
    const res = await request(app).post('/assistant/chat').send({ message: 'Hello' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ reply: 'You said: Hello' });
  });

  test('returns 400 when message is missing', async () => {
    const res = await request(app).post('/assistant/chat').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Message is required/);
  });
});
