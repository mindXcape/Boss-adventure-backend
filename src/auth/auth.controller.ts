import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { totp } from 'otplib';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshJWTGuard } from './guards/refresh.auth.guard';
import { ResponseMessage, Tokens } from './types';
import { CreateAdminDto } from 'src/admins/dto/create-admin.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {
    totp.options = {
      step: +process.env.OTP_DURATION_IN_SECS,
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<CreateAdminDto & Tokens> {
    return await this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register User' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  register(@Body() createAdminDto: CreateAdminDto): Promise<ResponseMessage | null> {
    return this.authService.register(createAdminDto);
  }

  @Public()
  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to user email' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async sendOtp(@Body() authDto: AuthDto): Promise<ResponseMessage | null> {
    return this.authService.sendOtp(authDto);
  }

  @Public()
  @UseGuards(RefreshJWTGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Get new access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  async refresh(@Request() req): Promise<Omit<Tokens, 'refresh_token'>> {
    return this.authService.refreshToken(req.user);
  }
}
