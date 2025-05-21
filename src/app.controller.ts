import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ChatCompletionRequestSchema } from './dto/chat.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('chat')
  async postMessage(@Body() request: unknown): Promise<string> {
    const result = ChatCompletionRequestSchema.safeParse(request);
    if (!result.success) {
      throw new BadRequestException(result.error.errors);
    }
    return await this.appService.postMessage(result.data);
  }
}
