import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './auth.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    emailVerified?: Date;
}
