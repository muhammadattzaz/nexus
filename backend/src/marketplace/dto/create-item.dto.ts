import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'GPT-4o', description: 'Model name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'OpenAI', description: 'Provider name' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ example: 'Most capable GPT-4 model', description: 'Model description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['reasoning', 'vision'], description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: 'llm',
    enum: ['llm', 'image', 'audio', 'embedding', 'multimodal', 'code', 'vision', 'tool'],
    description: 'Model type',
  })
  @IsEnum(['llm', 'image', 'audio', 'embedding', 'multimodal', 'code', 'vision', 'tool'])
  type: string;

  @ApiProperty({ example: 'hot', enum: ['hot', 'new', 'open'], description: 'Badge', required: false })
  @IsOptional()
  @IsEnum(['hot', 'new', 'open'])
  badge?: string;

  @ApiProperty({
    example: { inputPer1M: 5, outputPer1M: 15, tier: 'paid' },
    description: 'Pricing info',
    required: false,
  })
  @IsOptional()
  @IsObject()
  pricing?: { inputPer1M: number; outputPer1M: number; tier: string };

  @ApiProperty({ example: 128000, description: 'Context window size in tokens', required: false })
  @IsOptional()
  @IsNumber()
  contextWindow?: number;

  @ApiProperty({ example: 4.8, description: 'Rating out of 5', required: false })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ example: 1200, description: 'Number of reviews', required: false })
  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @ApiProperty({ example: 'proprietary', description: 'License type', required: false })
  @IsOptional()
  @IsString()
  license?: string;

  @ApiProperty({ example: false, description: 'Whether item is featured', required: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
