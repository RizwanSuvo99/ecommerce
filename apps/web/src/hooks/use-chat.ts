'use client';

import { useState, useCallback } from 'react';
import { sendChatMessage, type ChatMessage } from '@/lib/api/chat';

const STORAGE_KEY = 'chatbot_messages';
const MAX_STORED_MESSAGES = 50;

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistMessages(msgs: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    // storage full — ignore
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = useCallback(
    async (message: string) => {
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      const updated = [...messages, userMessage].slice(-MAX_STORED_MESSAGES);
      setMessages(updated);
      persistMessages(updated);
      setIsLoading(true);

      try {
        const history = updated
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await sendChatMessage(message, history);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          products: response.products,
          suggestedQuestions: response.suggestedQuestions,
          timestamp: Date.now(),
        };

        const withReply = [...updated, assistantMessage].slice(
          -MAX_STORED_MESSAGES,
        );
        setMessages(withReply);
        persistMessages(withReply);
      } catch {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        };
        const withError = [...updated, errorMessage].slice(
          -MAX_STORED_MESSAGES,
        );
        setMessages(withError);
        persistMessages(withError);
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    messages,
    isLoading,
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    clearMessages,
  };
}
