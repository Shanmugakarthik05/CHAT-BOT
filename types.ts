export type ChatRole = 'user' | 'model' | 'system';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export type Persona = 'friendly' | 'formal' | 'concise';

export type AspectRatio = '16:9' | '9:16';
