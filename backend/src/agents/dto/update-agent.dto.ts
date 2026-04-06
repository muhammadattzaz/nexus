import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAgentDto {
  @ApiProperty({ example: 'Updated Support Bot', description: 'Agent name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'An updated customer support agent', description: 'Agent description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'customer-support',
    enum: ['customer-support', 'research', 'code-review', 'content-writing', 'email-outreach', 'analytics', 'education', 'ecommerce'],
    description: 'Agent type',
    required: false,
  })
  @IsOptional()
  @IsEnum(['customer-support', 'research', 'code-review', 'content-writing', 'email-outreach', 'analytics', 'education', 'ecommerce'])
  type?: string;

  @ApiProperty({ example: 'You are a helpful support agent...', description: 'System prompt', required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({ example: ['web-search'], description: 'List of tools', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];

  @ApiProperty({ example: { 'web-search': { 'API Key': 'sk-...' } }, description: 'Tool configuration values', required: false })
  @IsOptional()
  @IsObject()
  toolConfigs?: Record<string, Record<string, string>>;

  @ApiProperty({ example: { shortTerm: true, longTerm: true }, description: 'Memory settings', required: false })
  @IsOptional()
  @IsObject()
  memory?: { shortTerm: boolean; longTerm: boolean };

  @ApiProperty({ example: 'gpt-4o', description: 'LLM model to use', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'professional', description: 'Agent tone', required: false })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiProperty({ example: 'enterprise customers', description: 'Target audience', required: false })
  @IsOptional()
  @IsString()
  audience?: string;

  @ApiProperty({ example: 'deployed', enum: ['draft', 'deployed'], description: 'Agent status', required: false })
  @IsOptional()
  @IsEnum(['draft', 'deployed'])
  status?: string;
}
