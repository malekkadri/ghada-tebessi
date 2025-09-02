const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  // Provide a graceful fallback when the API key is missing. This avoids
  // returning an internal server error during development or testing
  // environments where the external API cannot be reached.
  if (!process.env.GROQ_API_KEY) {
    return res.json({ reply: `You said: ${message}` });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a helpful CRM assistant.' },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || '';
    res.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      // Graceful fallback when the assistant API returns a client error.
      return res.json({ reply: `You said: ${message}` });
    }
    res.status(500).json({ error: 'Failed to get response from assistant' });
  }
});

module.exports = router;
