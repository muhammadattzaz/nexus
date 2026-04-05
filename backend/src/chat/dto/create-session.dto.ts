import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ example: 'New Chat Session', description: 'Session title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'gpt-4o', description: 'Model identifier' })
  @IsString()
  @IsNotEmpty()
  modelId: string;

  @ApiProperty({ example: 'GPT-4o', description: 'Model display name' })
  @IsString()
  @IsNotEmpty()
  modelName: string;
}
