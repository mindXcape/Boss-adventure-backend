import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { totp } from 'otplib';
import { MailService } from 'src/mailer/mailer.service';
import { AuthDto } from './dto';
import { AdminsService } from 'src/admins/admins.service';
import { CreateAdminDto } from 'src/admins/dto/create-admin.dto';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger('Auth Service');
  constructor(
    private jwtService: JwtService,
    private adminService: AdminsService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, otp: string): Promise<CreateAdminDto> {
    const user = await this.adminService.findOneByEmail(email);
    // Todos: Incomplete if-condition checks (If otp is invalid, then what? send proper message)
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }
    if (!totp.verify({ token: otp, secret: process.env.OTP_SECRET })) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return user;
  }

  async register(createUserDto: CreateAdminDto) {
    const user = await this.adminService.create(createUserDto);
    if (user) {
      this.mailService.welcome({ email: user?.email, name: user?.name });
      return { success: true, msg: 'User created successfully' };
    }
    throw new BadRequestException('Bad Request');
  }

  async sendOtp(AuthDto: Omit<AuthDto, 'otp'>) {
    this._logger.log(`Sending Login OTP to ${AuthDto?.email}`);
    const { email } = AuthDto;

    const admin = await this.adminService.findOneByEmail(email);

    if (admin && admin?.isActive) {
      this._logger.log(`Generating Login OTP to ${AuthDto?.email}`);

      const token = totp.generate(process.env.OTP_SECRET);

      if (token) {
        this.mailService.sendOTP({ email: admin?.email, otp: token });

        return { success: true, msg: 'OTP sent successfully' };
      }
    }
    throw new NotFoundException('Admin not found');
  }

  async login(admin: any) {
    this._logger.log(`Sending tokens to ${admin?.email}`);
    const payload = {
      id: admin.id,
      sub: {
        email: admin.email,
        name: admin.name,
        roles: admin.roles,
        phone: admin.phone,
      },
    };
    return {
      ...admin,
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: +process.env.JWT_EXPIRATION_LONG_TIME,
      }),
    };
  }

  async refreshToken(admin: any) {
    this._logger.log(`Generating access token to ${admin?.email}`);
    const payload = {
      id: admin.id,
      sub: {
        email: admin.email,
        name: admin.name,
        roles: admin.roles,
      },
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
