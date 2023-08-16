import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { PayloadTokenDto } from '../models';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const { password, ...rta } = user;
        return rta;
      }
    }

    return null;
  }

  generateJWT(user: User) {
    const payload: PayloadTokenDto = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      status: 'ok',
      user,
    };
  }
}
