import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mailer/mailer.module';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { AwsModule } from './aws/aws.module';
import { FilesModule } from './files/files.module';
import { BanksModule } from './banks/banks.module';
import { HotelsModule } from './hotels/hotels.module';
import { LodgesModule } from './lodges/lodges.module';
import { PackagesModule } from './packages/packages.module';
import { FranchisesModule } from './franchises/franchises.module';
import { GroupsModule } from './groups/groups.module';
import { PmsModule } from './pms/pms.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: +configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PrismaModule,
    MailModule,
    UsersModule,
    AdminsModule,
    AwsModule,
    FilesModule,
    BanksModule,
    HotelsModule,
    LodgesModule,
    PackagesModule,
    FranchisesModule,
    GroupsModule,
    PmsModule,
    VehiclesModule,
    DashboardModule,
  ],
})
export class AppModule {}
