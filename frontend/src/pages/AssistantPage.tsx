import React, { useState } from 'react';
import { assistantService } from '../services/assistantService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const reply = await assistantService.chat(userMessage.content);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Unable to fetch response.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold mb-4">AI Assistant</h1>
      <div className="border rounded p-4 h-96 overflow-y-auto mb-4 bg-white dark:bg-gray-800">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div>Loading...</div>}
      </div>
      <div className="flex">
        <input
          className="flex-1 border rounded-l p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask something..."
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-r disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AssistantPage;
