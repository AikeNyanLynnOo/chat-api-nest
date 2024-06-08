import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class SignInDto {
  @ApiProperty({
    required: true,
    description: 'The email address of the user',
    example: 'name@domain.com',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true,
    description: 'The password of the user',
    example: 'Abc1234!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
