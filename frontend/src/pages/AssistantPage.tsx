import React, { useEffect, useMemo, useRef, useState } from 'react';
import { assistantService } from '../services/assistantService';

type Role = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  error?: boolean;
}

const SUGGESTIONS = [
  'Summarize this text',
  'Explain step-by-step',
  'Give me code with comments',
  'List pros & cons',
  'Rewrite more concise',
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem('assistant.chat');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem('assistant.chat', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom on new messages (if user is already near bottom)
  const [atBottom, setAtBottom] = useState(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setAtBottom(nearBottom);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (atBottom) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, atBottom]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    ta.style.height = Math.min(180, Math.max(44, ta.scrollHeight)) + 'px';
  }, [input]);

  const canRegenerate = useMemo(() => {
    if (!messages.length) return false;
    const last = messages[messages.length - 1];
    // Regenerate the last assistant response (requires the previous user message)
    return last.role === 'assistant' && messages.some(m => m.role === 'user');
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setErrorBanner(null);
    const userMsg: Message = { id: uid(), role: 'user', content, createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Track request to ignore stale replies if user sends again quickly
    const key = uid();
    setRequestKey(key);

    try {
      const replyText = await assistantService.chat(content);
      // Ignore if a newer request was started
      if (requestKey && requestKey !== key) return;

      const assistantMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: String(replyText ?? ''),
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const assistantErr: Message = {
        id: uid(),
        role: 'assistant',
        content: 'Unable to fetch response.',
        createdAt: Date.now(),
        error: true,
      };
      setMessages(prev => [...prev, assistantErr]);
      setErrorBanner('The assistant had trouble replying. You can retry or edit your message.');
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setErrorBanner(null);
  }

  function regenerate() {
    // Find last user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) sendMessage(lastUser.content);
  }

  function copyMessage(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    });
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-5xl flex-col px-4 py-6">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/60">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Ask anything. Shift+Enter for a new line. Enter to send.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canRegenerate && (
            <button
              onClick={regenerate}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              title="Regenerate last answer"
            >
              Regenerate
            </button>
          )}
          <button
            onClick={clearChat}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            title="Clear conversation"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorBanner && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800/40 dark:bg-red-900/30 dark:text-red-200">
          {errorBanner}
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="mb-3 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-3 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950"
      >
        {/* Suggestions when empty */}
        {messages.length === 0 && !loading && (
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`mb-3 flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
              {/* Avatar */}
              {!isUser && (
                <div className="mr-2 mt-0.5 hidden h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:flex">
                  AI
                </div>
              )}
              {/* Bubble */}
              <div
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[80%] ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : m.error
                    ? 'border border-red-200 bg-red-50 text-red-800 dark:border-red-700/40 dark:bg-red-900/30 dark:text-red-100'
                    : 'border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
                <div
                  className={`mt-1 flex items-center gap-2 ${
                    isUser ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span className="text-[11px]">{formatTime(m.createdAt)}</span>
                  {!isUser && !m.error && (
                    <button
                      className={`text-[11px] underline-offset-2 hover:underline ${isUser ? 'text-white/80' : ''}`}
                      onClick={() => copyMessage(m.id, m.content)}
                      title="Copy message"
                    >
                      {copiedId === m.id ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
              {/* Avatar (user) */}
              {isUser && (
                <div className="ml-2 mt-0.5 hidden h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white sm:flex">
                  You
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="mb-2 flex items-start justify-start">
            <div className="mr-2 mt-0.5 hidden h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:flex">
              AI
            </div>
            <div className="max-w-[92%] rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:max-w-[80%]">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                </span>
                Assistant is typing…
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Scroll to bottom button */}
      {!atBottom && (
        <button
          onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
          className="mb-2 self-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-800 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          Jump to latest ↓
        </button>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            className="max-h-44 min-h-[44px] w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask something…"
            aria-label="Message input"
          />
          <div className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-gray-400 dark:text-gray-500">
            Enter ↵ to send • Shift+Enter for newline
          </div>
        </div>
        <button
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AssistantPage;
