import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailVerificationInDto, SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import { Tokens } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

import { v4 as uuidv4 } from 'uuid';
import sendEmail from 'src/utils/sendEmail';
import sendPasswordResetEmail from 'src/utils/sendPasswordResetEmail';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    const existingUser = await this.userService.getUserByEmail(signUpDto.email);

    if (existingUser) {
      throw new NotFoundException(
        'The provided email address or combination of first and last name is already in use. Please choose a different combination.',
      );
    }
    const hash = await this.hashData(signUpDto.password);
    const {
      password,
      storeName,
      storeAddress,
      storeWebsite,
      ...dtoWithoutPassword
    } = signUpDto;

    const newUser = await this.prisma.user.create({
      data: {
        ...dtoWithoutPassword,
        password: hash,
        ownedStores: {
          create: {
            name: storeName,
            address: storeAddress,
            website: storeWebsite,
          },
        },
      },
    });

    const {
      id,
      firstName,
      familyName,
      email,
      phoneNumber,
      role,
      ...restOfNewUser
    } = newUser;
    const tokens = await this.getTokens(newUser.id, newUser.email);

    const user = { id, firstName, familyName, email, phoneNumber, role };
    await this.updateRtHash(newUser.id, tokens.refresh_token);

    const verificationToken = await this.generateVerificationToken(
      newUser.email,
    );
    await this.sendVerificationEmail({
      recipients: [
        {
          name: `${newUser.firstName} ${newUser.familyName}`,
          address: verificationToken.email,
        },
      ],
      placeholderReplacement: {
        token: verificationToken.token,
        name: `${newUser.firstName} ${newUser.familyName}`,
      },
    });

    // return tokens;
    return {
      // tokens,
      // user: { id, firstName, familyName, email, phoneNumber, role },
      message: 'Confirmation email has been sent',
    };
  }

  async signin(signInDto: SignInDto) {
    const existingUser = await this.userService.getUserByEmail(signInDto.email);

    // USER NOT FOUND
    if (!existingUser) {
      throw new NotFoundException('User not found!');
    }
    // NOT MATCHING PASSWORDS
    const passwordMatch = await bcrypt.compare(
      signInDto.password,
      existingUser.password,
    );

    if (!passwordMatch) {
      throw new HttpException('Access Denied !', HttpStatus.UNAUTHORIZED);
    }

    const {
      id,
      firstName,
      familyName,
      email,
      emailVerified,
      isTwoFactorEnabled,
      phoneNumber,
      role,
      ...restOfNewUser
    } = existingUser;

    const tokens = await this.getTokens(existingUser.id, existingUser.email);
    await this.updateRtHash(existingUser.id, tokens.refresh_token);
    const existingConfirmation = await this.getTwoFactorConfirmationByUserId(
      existingUser.id,
    );
    // EMAIL NOT VERIFIED
    if (!existingUser.emailVerified) {
      const verificationToken = await this.generateVerificationToken(
        existingUser.email,
      );
      await this.sendVerificationEmail({
        recipients: [
          {
            name: `${existingUser.firstName} ${existingUser.familyName}`,
            address: verificationToken.email,
          },
        ],
        placeholderReplacement: {
          token: verificationToken.token,
          name: `${existingUser.firstName} ${existingUser.familyName}`,
        },
      });
      return {
        tokens,
        user: {
          id,
          firstName,
          familyName,
          email,
          emailVerified,
          phoneNumber,
          isTwoFactorEnabled,
          role,
        },
        success:
          'A verification email has been successfully sent to your inbox.',
      };
    }
    // 2FA
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
      if (signInDto.code) {
        console.log('isTwoFactorEnabled and code ');

        // TO DO
        const twoFactorToken = await this.getTwoFactorTokenByEmail(
          existingUser.email,
        );
        if (!twoFactorToken) {
          throw new BadRequestException('Invalid code!');
        }
        if (twoFactorToken.token !== signInDto.code) {
          throw new BadRequestException('Invalid code!');
        }
        const hasExpired = new Date(twoFactorToken.expires) < new Date();
        if (hasExpired) {
          throw new BadRequestException('Code expired!');
        }

        await this.prisma.twoFactorToken.delete({
          where: {
            id: twoFactorToken.id,
          },
        });

        if (existingConfirmation) {
          await this.prisma.twoFactorConfirmation.delete({
            where: {
              id: existingConfirmation.id,
            },
          });
        }

        //  const createdTwoFactorConfirmation =  await this.prisma.twoFactorConfirmation.create({
        await this.prisma.twoFactorConfirmation.create({
          data: {
            userId: existingUser.id,
          },
        });
        // console.log({createdTwoFactorConfirmation});
      } else if (!existingConfirmation) {
        console.log('isTwoFactorEnabled and no existing Confirmation ');

        const twoFactorToken = await this.generateTwoFactorToken(
          existingUser.email,
        );
        await this.sendTwoFactorTokenEmail(
          twoFactorToken.email,
          twoFactorToken.token,
        );
        return {
          tokens,
          user: {
            id,
            firstName,
            familyName,
            email,
            emailVerified,
            phoneNumber,
            isTwoFactorEnabled,
            role,
          },
          success: ' 2FA code has been successfully sent to your email.',
          twoFactor: true,
        };
      }
    }

    return {
      tokens,
      user: {
        id,
        firstName,
        familyName,
        email,
        emailVerified,
        phoneNumber,
        isTwoFactorEnabled,
        role,
      },
      success: 'you are successfully logged in.',
    };
  }

  async sendEmailResetPassword(email: string) {
    const existingUser = await this.userService.getUserByEmail(email);
    if (!existingUser) {
      throw new NotFoundException(`No account found for this email.`);
    }

    // Generate Token & send email
    const passwordResetToken = await this.generatePasswordResetToken(email);
    await sendPasswordResetEmail({
      recipients: [
        {
          name: `${existingUser.firstName} ${existingUser.familyName}`,
          address: passwordResetToken.email,
        },
      ],
      placeholderReplacement: {
        token: passwordResetToken.token,
        name: `${existingUser.firstName} ${existingUser.familyName}`,
      },
    });

    return {
      success: 'A password reset link has been sent to your email address!',
    };
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefToken: { not: null },
      },
      data: {
        hashedRefToken: null,
      },
    });
  }
  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new ForbiddenException('Access denied');
    const rtMatch = await bcrypt.compare(rt, user.hashedRefToken);

    if (!rtMatch) throw new ForbiddenException('Access denied');
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async hashData(data: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        // { secret: process.env.AT_SECRET, expiresIn: 60 * 15 },
        { secret: process.env.AT_SECRET, expiresIn: 60 * 1 },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        { secret: process.env.RT_SECRET, expiresIn: 60 * 60 * 24 * 7 },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefToken: hash,
      },
    });
  }

  async getVerificationTokenByEmail(email: string) {
    const verificationToken = await this.prisma.verificationToken.findFirst({
      where: {
        email, // Directly reference the email property
      },
    });
    if (!verificationToken) return null;

    return verificationToken;
  }

  async getVerificationTokenByToken(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });
    if (!verificationToken) return null;

    return verificationToken;
  }

  async generateVerificationToken(email: string) {
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000 * 2);

    const existingToken = await this.getVerificationTokenByEmail(email);
    if (existingToken) {
      await this.prisma.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }
    const verificationToken = await this.prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });
    return verificationToken;
  }

  async sendVerificationEmail(emailVerificationInDto: EmailVerificationInDto) {
    try {
      await sendEmail(emailVerificationInDto);

      this.logger.log('Email sent successfully');
    } catch (error) {
      this.logger.error('Unexpected error sending email:', error);
    }
  }

  async verifyToken(token: string) {
    const existingToken = await this.getVerificationTokenByToken(token);
    if (!existingToken) {
      return { error: 'Token does not exist!' };
    }

    const hasExpired =
      new Date(existingToken.expires).getTime() < new Date().getTime();
    if (hasExpired) {
      return { error: 'Token has expired!' };
    }
    const existingUser = await this.userService.getUserByEmail(
      existingToken.email,
    );

    if (!existingUser) {
      return { error: 'Email does not exist!' };
    }

    await this.userService.updateUser(existingUser.email, {
      emailVerified: new Date(),
      email: existingUser.email,
    });

    await this.prisma.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return { success: 'Email Verified!' };
  }

  async getPasswordResetTokenByToken(token: string) {
    const PasswordResetToken = await this.prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });
    if (!PasswordResetToken) return null;

    return PasswordResetToken;
  }
  async getPasswordResetTokenByEmail(email: string) {
    const PasswordResetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        email,
      },
    });

    if (!PasswordResetToken) return null;

    return PasswordResetToken;
  }
  async generatePasswordResetToken(email: string) {
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000 * 2);

    const existingToken = await this.getPasswordResetTokenByEmail(email);
    if (existingToken) {
      await this.prisma.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }
    const passwordResetToken = await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });
    return passwordResetToken;
  }

  async sendPasswordRestEmail(emailVerificationInDto: EmailVerificationInDto) {
    try {
      await sendPasswordResetEmail(emailVerificationInDto);

      this.logger.log(
        'A password reset link has been sent to your email address',
      );
    } catch (error) {
      this.logger.error('Unexpected error sending email:', error);
    }
  }

  async resetPassword(token: string, password: string) {
    const existingToken = await this.getPasswordResetTokenByToken(token);
    if (!existingToken) {
      return { error: 'Token does not exist!' };
    }

    const hasExpired =
      new Date(existingToken.expires).getTime() < new Date().getTime();
    if (hasExpired) {
      return { error: 'Token has expired!' };
    }
    const existingUser = await this.userService.getUserByEmail(
      existingToken.email,
    );

    if (!existingUser) {
      return { error: 'Email does not exist!' };
    }
    const hash = await this.hashData(password);
    await this.userService.updateUser(existingUser.email, {
      password: hash,
    });

    await this.prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return { success: 'Password updated!' };
  }

  async getTwoFactorTokenByToken(token: string) {
    try {
      const twoFactorToken = await this.prisma.twoFactorToken.findUnique({
        where: {
          token,
        },
      });
      if (!twoFactorToken) return null;

      return twoFactorToken;
    } catch (error) {
      return null;
    }
  }
  async getTwoFactorTokenByEmail(email: string) {
    try {
      const twoFactorToken = await this.prisma.twoFactorToken.findFirst({
        where: {
          email,
        },
      });
      if (!twoFactorToken) return null;

      return twoFactorToken;
    } catch (error) {
      return null;
    }
  }

  async getTwoFactorConfirmationByUserId(userId: string) {
    try {
      const twoFactorConfirmation =
        await this.prisma.twoFactorConfirmation.findUnique({
          where: { userId },
        });
      return twoFactorConfirmation;
    } catch (error) {
      return null;
    }
  }
  async generateTwoFactorToken(email: string) {
    const token = crypto.randomInt(100_000, 1_000_000).toString();
    // const token = crypto.randomInt(100000, 1000000).toString();

    const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

    const existingToken = await this.getTwoFactorTokenByEmail(email);

    if (existingToken) {
      await this.prisma.twoFactorToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }
    const twoFactorToken = await this.prisma.twoFactorToken.create({
      data: {
        email,
        token,
        expires,
      },
    });
    return twoFactorToken;
  }

  async sendTwoFactorTokenEmail(email: string, token: string) {
    const existingUser = await this.userService.getUserByEmail(email);
    if (!existingUser) {
      throw new NotFoundException('No account found for this email.');
    }
    await sendEmail({
      recipients: [
        {
          name: `${existingUser.firstName} ${existingUser.familyName}`,
          address: email,
        },
      ],
      html: `<p>Your 2FA code :</p><h1>${token}</h1><p>The token will expire in 5 mins</p>`,
    });
  }
  async deleteTwoFactorConfirmationById(id: string) {
    try {
      const deleted2FAConfirmation =
        await this.prisma.twoFactorConfirmation.delete({
          where: { id },
        });
      if (deleted2FAConfirmation)
        return { success: 'The item has been successfully deleted!' };
    } catch (error) {
      return null;
    }
  }
}
