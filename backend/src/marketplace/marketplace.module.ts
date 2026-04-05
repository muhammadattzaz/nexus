import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import {
  MarketplaceItem,
  MarketplaceItemSchema,
} from './schemas/marketplace-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketplaceItem.name, schema: MarketplaceItemSchema },
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
