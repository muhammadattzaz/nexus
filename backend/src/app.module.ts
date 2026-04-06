import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { AgentsModule } from './agents/agents.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { DiscoverModule } from './discover/discover.module';
import { ModelsModule } from './models/models.module';
import { SuggestionsModule } from './suggestions/suggestions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    AuthModule,
    UsersModule,
    ChatModule,
    AgentsModule,
    MarketplaceModule,
    DiscoverModule,
    ModelsModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
