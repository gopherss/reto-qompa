import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { PurchaseReceiptModule } from './purchase-receipt/purchase-receipt.module';

@Module({
  imports: [CatsModule, PurchaseReceiptModule],
})
export class AppModule {}
