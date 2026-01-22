import { Injectable, Logger } from '@nestjs/common';

import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import type { ChatResponse } from './types/chat.types';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly aiService: AiService) {}

  async processMessage(dto: ChatMessageDto): Promise<ChatResponse> {
    const history = (dto.history || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      return await this.aiService.chat(dto.message, history);
    } catch (error) {
      this.logger.error('Chat processing failed:', error);
      return {
        message:
          'Sorry, I\'m having trouble right now. Please try again in a moment.',
        products: [],
      };
    }
  }
}
