import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Search, Plus, Loader, ArrowLeft } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chatApi, type Message, type Conversation } from '../api/chat';
import Username from '../components/Username';

const Chat: React.FC = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [newDmId, setNewDmId] = useState('');
  const [showNewDm, setShowNewDm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const initialUserId = query.get('userId');

    setIsLoadingConvs(true);
    chatApi
      .getConversations()
      .then(async (res) => {
        const convList = res.data || [];
        setConversations(convList);

        if (initialUserId) {
          try {
            const createRes = await chatApi.createConversation(initialUserId);
            const newConv = createRes.data;
            setConversations((prev) => {
              const exists = prev.find((c) => c.id === newConv.id);
              return exists ? prev : [newConv, ...prev];
            });
            setActiveConv(newConv);
            // remove query param from URL without reloading page
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err) {
            console.error('Failed to auto-create conversation', err);
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingConvs(false));
  }, []);

  // When conversation changes, load messages and join socket room
  useEffect(() => {
    if (!activeConv || !socket) return;

    setIsLoadingMsgs(true);
    chatApi
      .getConversationMessages(activeConv.id, { limit: 50 })
      .then((res) => setMessages([...(res.data || [])].reverse()))
      .catch(console.error)
      .finally(() => setIsLoadingMsgs(false));

    socket.emit('join_conversation', { conversationId: activeConv.id });

    const handleDm = (msg: Message) => {
      if (msg.conversationId === activeConv.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('dm_message', handleDm);
    return () => {
      socket.off('dm_message', handleDm);
    };
  }, [activeConv, socket]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !activeConv) return;
    socket.emit('send_dm', { conversationId: activeConv.id, content: input.trim() });
    setInput('');
    inputRef.current?.focus();
  };

  const startNewDm = async () => {
    if (!newDmId.trim()) return;
    try {
      const res = await chatApi.createConversation(newDmId.trim());
      const conv = res.data;
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        return exists ? prev : [conv, ...prev];
      });
      setActiveConv(conv);
      setShowNewDm(false);
      setNewDmId('');
    } catch (err) {
      console.error('Failed to start DM', err);
    }
  };

  const getOtherMemberId = (conv: Conversation) =>
    conv.members.find((m) => m.userId !== user?.id)?.userId || '';

  const filteredConvs = conversations.filter((c) => {
    const otherId = getOtherMemberId(c);
    return otherId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const lastMessage = (conv: Conversation) => conv.messages?.[0];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Conversations Panel */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          width: '300px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Messages
            </h2>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNewDm((v) => !v)}
              style={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: showNewDm ? 'rgba(163,230,53,0.2)' : 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: showNewDm ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              <Plus size={15} />
            </motion.button>
          </div>

          {/* New DM input */}
          <AnimatePresence>
            {showNewDm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginBottom: 10 }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newDmId}
                    onChange={(e) => setNewDmId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && startNewDm()}
                    placeholder="Paste User ID…"
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    onClick={startNewDm}
                    style={{
                      padding: '7px 10px',
                      background: 'var(--accent-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Start
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              style={{
                width: '100%',
                padding: '7px 10px 7px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {isLoadingConvs ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24, color: 'var(--text-muted)' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {conversations.length === 0
                ? 'No conversations yet. Start a DM!'
                : 'No results found.'}
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const otherId = getOtherMemberId(conv);
              const last = lastMessage(conv);
              const isActive = activeConv?.id === conv.id;

              return (
                <motion.button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  whileHover={{ x: 2 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(163,230,53,0.12)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(163,230,53,0.25)' : 'transparent'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: 4,
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {otherId.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: isActive ? '#fff' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <Username userId={otherId} fallback={otherId.slice(0, 12)} />
                    </p>
                    {last && (
                      <p
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {last.content}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Message Area */}
      {activeConv ? (
        <motion.div
          key={activeConv.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--bg-secondary)',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {getOtherMemberId(activeConv).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Username userId={getOtherMemberId(activeConv)} fallback={getOtherMemberId(activeConv).slice(0, 16)} />
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Direct Message</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {isLoadingMsgs ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--text-muted)',
                  gap: 8,
                }}
              >
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Loading messages…
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
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '65%',
                          padding: '10px 14px',
                          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isOwn
                            ? 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)'
                            : 'rgba(255,255,255,0.07)',
                          color: isOwn ? '#fff' : 'var(--text-primary)',
                          fontSize: '0.875rem',
                          boxShadow: isOwn ? '0 4px 16px rgba(163,230,53,0.3)' : 'none',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                        <p
                          style={{
                            fontSize: '0.64rem',
                            marginTop: 5,
                            opacity: 0.6,
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
              padding: '12px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: 10,
              background: 'var(--bg-secondary)',
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message…"
              style={{
                flex: 1,
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
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
              whileTap={{ scale: 0.9 }}
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: input.trim()
                  ? 'linear-gradient(135deg, var(--accent-primary), #1d4ed8)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: input.trim() ? '0 4px 14px rgba(163,230,53,0.4)' : 'none',
              }}
            >
              <Send size={17} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Empty state */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: 'var(--text-muted)',
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 72,
              height: 72,
              borderRadius: '24px',
              background: 'rgba(163,230,53,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={32} color="var(--accent-primary)" />
          </motion.div>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Your Messages
          </p>
          <p style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: 260 }}>
            Select a conversation or start a new direct message by clicking{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>+</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;
