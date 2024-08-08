import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  Register(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async updateUser(email: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where:{email}
    });
    if (!existingUser) {
      throw new NotFoundException('User   with this email not found');
    }
    const updatedUser = await this.prisma.user.update({
      where:{email},
      data:{
        ...updateUserDto,
      }
    })
    return updatedUser; 
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
