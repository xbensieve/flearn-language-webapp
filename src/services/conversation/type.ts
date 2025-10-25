export interface ConversationPrompt {
  id?: string;
  promptName: string;
  description: string;
  masterPromptTemplate: string;
  scenarioGuidelines: string;
  roleplayInstructions: string;
  evaluationCriteria: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface CreateConversationPromptPayload {
  promptName: string;
  description: string;
  masterPromptTemplate: string;
  scenarioGuidelines: string;
  roleplayInstructions: string;
  evaluationCriteria: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface UpdateConversationPromptPayload {
  promptName: string;
  description: string;
  masterPromptTemplate: string;
  scenarioGuidelines: string;
  roleplayInstructions: string;
  evaluationCriteria: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface IConversationPrompt {
  globalPromptID: string;
  promptName: string;
  description: string;
  masterPromptTemplate: string;
  scenarioGuidelines: string;
  roleplayInstructions: string;
  evaluationCriteria: string;
  status: number;
  isActive: boolean;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalPrompts: number;
  activePrompts: number;
  defaultPrompt: string;
  totalUsage: number;
}
