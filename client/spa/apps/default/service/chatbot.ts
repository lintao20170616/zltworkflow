import http from '@spa/utils/http';

export interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  message: string;
  conversationId?: number;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  botMessage: ChatMessage;
  conversationId: number;
}

export const sendMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  return http.api.post('/chatbot/send', { data });
};

export const getConversations = async (): Promise<Conversation[]> => {
  return http.api.get('/chatbot/conversations');
};

export const getMessages = async (conversationId: number): Promise<ChatMessage[]> => {
  return http.api.get(`/chatbot/messages/${conversationId}`);
};

export interface CreateConversationRequest {
  title?: string;
}

export const createConversation = async (data?: CreateConversationRequest): Promise<Conversation> => {
  return http.api.post('/chatbot/conversations', { data });
};

export const deleteConversation = async (conversationId: number): Promise<void> => {
  return http.api.delete(`/chatbot/conversations/${conversationId}`);
};

export const testOllama = async (params: { message: string }): Promise<string> => {
  return http.api.get('/chatbot/test-ollama', { params });
};
