import api from './index';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  conversationId?: string;
  roomId?: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  members: { conversationId: string; userId: string }[];
  messages: Message[];
}

export const chatApi = {
  // Hackathon public chat
  getHackathonMessages: (hackathonId: string, params?: { limit?: number; before?: string }) =>
    api.get<Message[]>(`/chat/hackathon/${hackathonId}/messages`, { params }),

  // DM conversations
  getConversations: () => api.get<Conversation[]>('/chat/conversations'),

  createConversation: (recipientId: string) =>
    api.post<Conversation>('/chat/conversations', { recipientId }),

  getConversationMessages: (conversationId: string, params?: { limit?: number; before?: string }) =>
    api.get<Message[]>(`/chat/conversations/${conversationId}/messages`, { params }),
};
