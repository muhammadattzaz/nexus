import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';
import { Paper, PaperSchema } from './schemas/paper.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Paper.name, schema: PaperSchema }])],
  controllers: [DiscoverController],
  providers: [DiscoverService],
  exports: [DiscoverService],
})
export class DiscoverModule {}
