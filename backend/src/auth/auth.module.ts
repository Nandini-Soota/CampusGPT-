import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtService } from './jwt/jwt.service.js';
import { JwtStrategy } from './jwt.strategy/jwt.strategy.service.js';
@Module({
  imports: [
    JwtModule.register({
      secret: 'campusgpt-secret-key',
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}