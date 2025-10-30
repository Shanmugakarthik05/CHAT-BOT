export type ChatRole = 'user' | 'model' | 'system';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export type Persona = 'friendly' | 'formal' | 'concise';
