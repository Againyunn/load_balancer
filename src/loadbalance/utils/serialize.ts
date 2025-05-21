export type ChatRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

export interface ChatMessage {
  role: ChatRole;
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

export interface SerializedChatMessage {
  role: ChatRole;
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

/**
 * LLM 채팅 메시지를 직렬화하는 함수
 * @param message 직렬화할 채팅 메시지
 * @returns 직렬화된 채팅 메시지
 */
export function serializeChatRequestMessage(
  message: ChatMessage,
): SerializedChatMessage {
  // 필수 필드 검증
  if (
    !message.role ||
    !['system', 'user', 'assistant', 'function', 'tool'].includes(message.role)
  ) {
    throw new Error('Invalid message role');
  }

  // content가 null이 아닌 경우 문자열인지 검증
  if (message.content !== null && typeof message.content !== 'string') {
    throw new Error('Message content must be a string or null');
  }

  // function_call이 있는 경우 검증
  if (message.function_call) {
    if (
      !message.function_call.name ||
      typeof message.function_call.name !== 'string'
    ) {
      throw new Error('Function call name must be a string');
    }
    if (
      !message.function_call.arguments ||
      typeof message.function_call.arguments !== 'string'
    ) {
      throw new Error('Function call arguments must be a string');
    }
  }

  // tool_calls가 있는 경우 검증
  if (message.tool_calls) {
    if (!Array.isArray(message.tool_calls)) {
      throw new Error('Tool calls must be an array');
    }

    message.tool_calls.forEach((toolCall, index) => {
      if (!toolCall.id || typeof toolCall.id !== 'string') {
        throw new Error(`Tool call ${index} must have a valid id`);
      }
      if (toolCall.type !== 'function') {
        throw new Error(`Tool call ${index} must have type 'function'`);
      }
      if (
        !toolCall.function?.name ||
        typeof toolCall.function.name !== 'string'
      ) {
        throw new Error(`Tool call ${index} must have a valid function name`);
      }
      if (
        !toolCall.function?.arguments ||
        typeof toolCall.function.arguments !== 'string'
      ) {
        throw new Error(
          `Tool call ${index} must have valid function arguments`,
        );
      }
    });
  }

  // tool_call_id가 있는 경우 검증
  if (message.tool_call_id && typeof message.tool_call_id !== 'string') {
    throw new Error('Tool call ID must be a string');
  }

  // name이 있는 경우 검증
  if (message.name && typeof message.name !== 'string') {
    throw new Error('Name must be a string');
  }

  // 직렬화된 메시지 반환
  return {
    role: message.role,
    content: message.content,
    ...(message.name && { name: message.name }),
    ...(message.function_call && { function_call: message.function_call }),
    ...(message.tool_calls && { tool_calls: message.tool_calls }),
    ...(message.tool_call_id && { tool_call_id: message.tool_call_id }),
  };
}
