import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailVerificationInDto, SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { RtGuard } from 'src/guards';
// import { AtGuard } from 'src/guards';
import { Public, GetCurrentUserId, GetCurrentUser } from 'src/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @Post('generate-token')
  @HttpCode(HttpStatus.OK)
  generateVerificationToken(@Body() { email }: { email: string }) {
    return this.authService.generateVerificationToken(email);
  }
  @Public()
  @Get('new-verification')
  @HttpCode(HttpStatus.OK)
  VerifyToken(@Query('token') token: string) {
    return this.authService.verifyToken(token);
  }

  @Public()
  @Post('send-email-verification')
  @HttpCode(HttpStatus.OK)
  sendVerificationEmail(
    @Body() emailVerificationInDto: EmailVerificationInDto,
  ) {
    return this.authService.sendVerificationEmail(emailVerificationInDto);
  }

  @Public()
  @Post('send-email-reset-password')
  @HttpCode(HttpStatus.OK)
  sendEmailResetPassword(@Body() { email }: { email: string }) {
    return this.authService.sendEmailResetPassword(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  ResetPassword(
    @Query('token') token: string,
    @Body() { password }: { password: string },
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Public()
  @Get('get-twoFactor-confirmation-by-user-id')
  @HttpCode(HttpStatus.OK)
  getTwoFactorConfirmationByUserId(
    @Query('userId') userId: string,
  ) {
    return this.authService.getTwoFactorConfirmationByUserId(userId);
  }
  @Public()
  @Delete('delete-twoFactor-confirmation-by-id')
  @HttpCode(HttpStatus.OK)
  deleteTwoFactorConfirmationById(
    @Query('userId') userId: string,
  ) {
    return this.authService.deleteTwoFactorConfirmationById(userId);
  }
}
