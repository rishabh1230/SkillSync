import { IsString, IsOptional, IsArray, IsEnum, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  tagline?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsUrl()
  @IsOptional()
  youtubeUrl?: string;

  @IsArray()
  @IsOptional()
  driveLinks?: CreateDriveLinkDto[];

  @IsUrl()
  @IsOptional()
  demoUrl?: string;

  @IsUrl()
  @IsOptional()
  githubUrl?: string;
}

export class CreateDriveLinkDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  fileType?: string;
}