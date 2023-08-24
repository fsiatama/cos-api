import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import configuration from '../config/configuration';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    PermissionsModule,
    JwtModule.registerAsync({
      inject: [configuration.KEY],
      useFactory: (configService: ConfigType<typeof configuration>) => {
        return {
          secret: configService.jwtSecret,
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
