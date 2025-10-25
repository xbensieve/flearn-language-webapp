import api from '../../config/axios';
import type {
  ConversationPrompt,
  CreateConversationPromptPayload,
  IConversationPrompt,
  UpdateConversationPromptPayload,
} from './type';

// ============ GET ALL PROMPTS ============
export const getConversationPrompts = async (): Promise<API.Response<IConversationPrompt[]>> => {
  const res = await api.get('/admin/conversation-prompts');
  return res.data;
};

// ============ GET SINGLE PROMPT ============
export const getConversationPromptById = async (id: string): Promise<ConversationPrompt> => {
  const res = await api.get(`/admin/conversation-prompts/${id}`);
  return res.data;
};

// ============ CREATE PROMPT ============
export const createConversationPrompt = async (
  payload: CreateConversationPromptPayload
): Promise<ConversationPrompt> => {
  const res = await api.post('/admin/conversation-prompts', payload);
  return res.data;
};

// ============ UPDATE PROMPT ============
export const updateConversationPrompt = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateConversationPromptPayload;
}): Promise<ConversationPrompt> => {
  const res = await api.put(`/admin/conversation-prompts/${id}`, payload);
  return res.data;
};

// ============ DELETE PROMPT ============
export const deleteConversationPrompt = async (id: string): Promise<void> => {
  await api.delete(`/admin/conversation-prompts/${id}`);
};
