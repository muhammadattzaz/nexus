import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant'], description: 'Message role' })
  @IsIn(['user', 'assistant'])
  role: string;

  @ApiProperty({ example: 'Hello, how are you?', description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Optional attachments',
    required: false,
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
}
