import { z } from 'zod';

export const ResponseFormatSchema = z.object({
  type: z.string(),
});

export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

export const ChatCompletionRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  seed: z.number().optional(),
  max_tokens: z.number().optional(),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  response_format: ResponseFormatSchema.optional(),
  frequency_penalty: z.number().optional(),
  presence_penalty: z.number().optional(),
});

export type ResponseFormat = z.infer<typeof ResponseFormatSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;
