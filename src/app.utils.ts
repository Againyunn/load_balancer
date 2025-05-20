import axios from "axios";
import { HttpException } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODE } from "./utils/server";
import { serializeChatRequestMessage } from "./utils/serialize";

export async function sendAzureOpenAIGetChatCompletions(
    deploymentName: string,
    method: string,
    apiVersion: string,
    data: any
  ) {
    for (let i = 0; i < this.endpointList.length; i++) {
      try {
        this.logger.debug(`Retry ${i}th endpoint`);
        this.logger.debug(this.endpointList[i]);

        const result = await this.sendChatCompletionRequest(
          this.endpointList[i],
          this.openaiKeyList[i],
          deploymentName,
          method,
          apiVersion,
          data
        );

        if (result.data && result.status === 200) {
          return result.data;
        }
      } catch (error) {
        // 타임아웃 에러 처리: error.code가 'ECONNABORTED' 인 경우
        if (error.code === "ECONNABORTED") {
          this.logger.error("Request Timeout 발생");
          await this.handleRateLimitExceeded({
            response: {
              status: ERROR_CODE.NET_E_TOO_MANY_REQUESTS,
              data: { message: "Request Timeout" },
            },
          });
          continue;
        }

        if (error.response) {
          // Content Filter 에러 처리
          if (
            error.response.status === 400 &&
            error.response.data.error.code === "content_filter"
          ) {
            this.logger.error(
                ERROR_CODE.NET_E_CONTENT_FILTER_UNSAFE
            //   ERROR_MESSAGE(ERROR_CODE.NET_E_CONTENT_FILTER_UNSAFE)
            );
            this.logger.error(error.response.data);
            throw new HttpException(
              error.response.data,
              ERROR_CODE.NET_E_CONTENT_FILTER_UNSAFE
            );
          }

          // Rate Limit Exceeded(429) 에러 처리
          await this.handleRateLimitExceeded(error);
          continue;
        }

        // 기타 에러 처리
        this.logger.error(error.message);
        throw error;
      }
    }

    this.logger.error("All endpoints are failed");
    throw new HttpException(
      "i-Learning LoadBalancer: All endpoints are failed",
      ERROR_CODE.NET_E_TOO_MANY_REQUESTS
    );
  }

export   async function sendChatCompletionRequest(
    endpoint: string,
    openaiKey: string,
    deploymentName: string,
    method: string,
    apiVersion: string,
    data: any
  ) {
    return await axios.post(
      `${endpoint}/openai/deployments/${deploymentName}/chat/${method}?api-version=${apiVersion}`,
      {
        messages: data.messages.map((message) =>
          serializeChatRequestMessage(message)
        ), // OpenAI 공식 라이브러리처럼 동일하게 messages 직렬화
        seed: data.seed,
        max_tokens: data.max_tokens,
        temperature: data.temperature,
        top_p: data.top_p,
        response_format: data.response_format,
        frequency_penalty: data.frequency_penalty,
        presence_penalty: data.presence_penalty,
      },
      {
        headers: {
          "api-key": `${openaiKey}`,
        },
        timeout: 30000,
      }
    );
  }

export  async function handleRateLimitExceeded(error: any) {
    if (
      error.response.status === ERROR_CODE.NET_E_TOO_MANY_REQUESTS ||
      error.response.status === HttpStatus.SERVICE_UNAVAILABLE
    ) {
      this.logger.debug(
        "Rate Limit Exceeded or Service Unavailable, waiting for 1 second..."
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 지수 백오프로 변경 고려
    } else {
      this.logger.error(error.response.status);
      this.logger.error(error.response.data);
      throw new HttpException(
        error.response.data.message,
        error.response.status
      );
    }
  }