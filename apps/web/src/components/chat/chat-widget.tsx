'use client';

import { useRef, useEffect, useState, Fragment } from 'react';
import { MessageCircle, X, Trash2, Send } from 'lucide-react';

import { useChat } from '@/hooks/use-chat';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatProductCards } from './chat-product-cards';
import { ChatSuggestedQuestions } from './chat-suggested-questions';

const STARTER_QUESTIONS = [
  'What categories do you have?',
  'Show me featured products',
  'What are the best-rated products?',
];

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const {
    messages,
    isLoading,
    isOpen,
    toggleChat,
    closeChat,
    sendMessage,
    clearMessages,
  } = useChat();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return;
    sendMessage(question);
  };

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[65] flex h-[32rem] w-[calc(100%-2rem)] max-w-[22rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:right-6 sm:max-w-96">
          {/* Header */}
          <div className="flex items-center justify-between bg-teal-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Shopping Assistant
                </h3>
                <p className="text-xs text-teal-100">Ask about our products</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  title="Clear chat"
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeChat}
                title="Close"
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Hi there!
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  I can help you find products, compare prices, and answer
                  questions about our store.
                </p>
                <div className="flex flex-col gap-1.5 w-full">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestedQuestion(q)}
                      className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-700 hover:bg-teal-100 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <Fragment key={i}>
                    <ChatMessageBubble message={msg} />
                    {msg.products && msg.products.length > 0 && (
                      <ChatProductCards products={msg.products} />
                    )}
                    {msg.suggestedQuestions &&
                      msg.suggestedQuestions.length > 0 &&
                      i === messages.length - 1 && (
                        <ChatSuggestedQuestions
                          questions={msg.suggestedQuestions}
                          onSelect={handleSuggestedQuestion}
                        />
                      )}
                  </Fragment>
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 px-4 py-3"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                disabled={isLoading}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-teal-600 px-3 py-2 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-[65] flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-all hover:scale-105 sm:right-6"
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
