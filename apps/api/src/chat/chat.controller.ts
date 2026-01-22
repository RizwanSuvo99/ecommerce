import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    const response = await this.chatService.processMessage(chatMessageDto);
    return { data: response };
  }
}
