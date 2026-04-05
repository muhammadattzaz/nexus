import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.userModel.findOne({ email: dto.email }).lean();
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await this.hashData(dto.password);
    const user = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
    });

    const tokens = await this.generateTokens(user._id.toString(), user.email);
    await this.storeRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    const { passwordHash: _pw, refreshTokenHash: _rt, ...userObj } = user.toObject() as any;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userObj,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+passwordHash')
      .lean();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email);
    await this.storeRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    const { passwordHash, refreshTokenHash, ...userObj } = user as any;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userObj,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userModel
      .findById(userId)
      .select('+refreshTokenHash')
      .lean();

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(userId, user.email);
    await this.storeRefreshTokenHash(userId, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessOpts: JwtSignOptions = {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpires') as any,
    };
    const refreshOpts: JwtSignOptions = {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpires') as any,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, accessOpts),
      this.jwtService.signAsync(payload, refreshOpts),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
