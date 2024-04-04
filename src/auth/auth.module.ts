import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTStrategy, RefreshJWTStrategy, LocalStrategy } from './strategies';
import { MailModule } from 'src/mailer/mailer.module';
import { AdminsService } from 'src/admins/admins.service';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: +process.env.JWT_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AwsService,
    AdminsService,
    LocalStrategy,
    JWTStrategy,
    RefreshJWTStrategy,
  ],
})
export class AuthModule {}
