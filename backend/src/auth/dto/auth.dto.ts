import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsObject,
  IsNumber,
} from 'class-validator';

class Address {
  @IsString()
  name: string;

  @IsEmail()
  address: string;
}

class placeholderReplacement {
  @IsString()
  name: string;
  @IsString()
  appName: string;
  @IsString()
  verificationLink: string;
}
enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  WORKER = 'WORKER',
}
export class SignUpDto {
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
  storeWebsite?: string;

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

  @IsOptional()
  @IsString()
  code: string;
}

export class EmailVerificationInDto {
  @IsOptional()
  from?: Address;

  @ValidateNested({ each: true })
  @Type(() => Address)
  recipients: Address[];

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  text?: string;

  @IsOptional()
  @IsObject()
  placeholderReplacement?: Record<string, string>;
}
