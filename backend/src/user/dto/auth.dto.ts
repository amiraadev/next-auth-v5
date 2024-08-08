import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  WORKER = 'WORKER',
}
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  familyName: string;

  @IsOptional()
  @Matches(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g, {
    message: 'phone must be a valid phone number',
  })
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsOptional()
  storeAddress?: string;

  @IsString()
  @IsOptional()
  storeLink?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
