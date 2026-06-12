import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Loader } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chatApi, type Message } from '../api/chat';

interface Props {
  hackathonId: string;
  hackathonName?: string;
}

const HackathonChat: React.FC<Props> = ({ hackathonId, hackathonName }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history & join room
  useEffect(() => {
    setIsLoading(true);
    chatApi
      .getHackathonMessages(hackathonId, { limit: 50 })
      .then((res) => {
        setMessages([...(res.data || [])].reverse());
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [hackathonId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_hackathon', { hackathonId });

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('hackathon_message', handleMessage);

    return () => {
      socket.emit('leave_hackathon', { hackathonId });
      socket.off('hackathon_message', handleMessage);
    };
  }, [socket, hackathonId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || isSending) return;
    setIsSending(true);
    socket.emit('send_hackathon_message', { hackathonId, content: input.trim() }, () => {
      setIsSending(false);
    });
    setInput('');
    inputRef.current?.focus();
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '420px',
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '10px',
            background: 'rgba(163,230,53,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageSquare size={15} color="var(--accent-primary)" />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Public Chat
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {hackathonName || 'Hackathon Room'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
            }}
          >
            <Loader size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 8,
            }}
          >
            <MessageSquare size={32} color="var(--text-muted)" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '8px 12px',
                      borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isOwn
                        ? 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)'
                        : 'rgba(255,255,255,0.06)',
                      color: isOwn ? '#fff' : 'var(--text-primary)',
                      fontSize: '0.85rem',
                      boxShadow: isOwn ? '0 2px 12px rgba(163,230,53,0.3)' : 'none',
                      wordBreak: 'break-word',
                    }}
                  >
                    {!isOwn && (
                      <p
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--accent-primary)',
                          fontWeight: 600,
                          marginBottom: 2,
                        }}
                      >
                        {msg.senderId.slice(0, 8)}
                      </p>
                    )}
                    {msg.content}
                    <p
                      style={{
                        fontSize: '0.62rem',
                        marginTop: 4,
                        opacity: 0.7,
                        textAlign: 'right',
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: 8,
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          style={{
            flex: 1,
            padding: '9px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'var(--accent-primary)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={sendMessage}
          disabled={!input.trim() || isSending}
          style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: input.trim()
              ? 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)'
              : 'rgba(255,255,255,0.06)',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
            boxShadow: input.trim() ? '0 2px 12px rgba(163,230,53,0.35)' : 'none',
          }}
        >
          <Send
            size={16}
            color={input.trim() ? '#fff' : 'var(--text-muted)'}
          />
        </motion.button>
      </div>
    </div>
  );
};

export default HackathonChat;
