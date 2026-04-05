import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full name', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.jpg', description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'en', description: 'Preferred language', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'pro', enum: ['free', 'pro', 'enterprise'], description: 'Subscription plan', required: false })
  @IsOptional()
  @IsEnum(['free', 'pro', 'enterprise'])
  plan?: string;
}
