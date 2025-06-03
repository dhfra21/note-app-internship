import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1000)
  content?: string;
}
