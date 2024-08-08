import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards, } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AtGuard } from 'src/guards';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  Register(@Body() createUserDto: CreateUserDto) {
    return this.userService.Register(createUserDto);
  }

  @UseGuards(AtGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
