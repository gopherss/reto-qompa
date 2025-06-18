import { Module } from '@nestjs/common';
import { PurchaseReceiptService } from './purchase-receipt.service';
import { PurchaseReceiptController } from './purchase-receipt.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PurchaseReceiptController],
  providers: [PurchaseReceiptService, PrismaService],
})
export class PurchaseReceiptModule {}
