import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  fullName!: string;

  @ApiProperty({ required: false, example: 'ivan_7a' })
  @IsOptional()
  @IsString()
  username?: string;
}
