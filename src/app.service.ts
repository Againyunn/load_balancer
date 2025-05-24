import {
  ChatCompletionResponse,
  handleRateLimitExceeded,
  sendAzureOpenAIGetChatCompletions,
  sendChatCompletionRequest,
} from './loadbalance/loadbalance.core';
import { Injectable, Logger } from '@nestjs/common';

import { ChatCompletionRequest } from './dto/chat.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly endpointList =
    process.env.AZURE_OPENAI_ENDPOINTS?.split(',') || [];
  private readonly openaiKeyList =
    process.env.AZURE_OPENAI_KEYS?.split(',') || [];
  private readonly deploymentName =
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'test';
  private readonly apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

  constructor() {
    if (!this.endpointList.length || !this.openaiKeyList.length) {
      throw new Error('Azure OpenAI endpoints and keys must be configured');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async postMessage(request: ChatCompletionRequest): Promise<string> {
    const context = {
      endpointList: this.endpointList,
      openaiKeyList: this.openaiKeyList,
      logger: this.logger,
      sendChatCompletionRequest,
      handleRateLimitExceeded,
    };

    console.log(context, request);

    try {
      const response = (await sendAzureOpenAIGetChatCompletions.call(
        context,
        this.deploymentName,
        'completions',
        this.apiVersion,
        request,
      )) as ChatCompletionResponse;

      console.log(response);

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Azure OpenAI');
      }

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error in postMessage:', error);
      throw error;
    }
  }
}
