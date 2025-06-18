import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma.service';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import {
  ReceiptStatus
} from './dto/update-purchase-receipt.dto';
import { PurchaseReceiptService } from './purchase-receipt.service';

@Controller()
export class PurchaseReceiptController {
  constructor(
    private readonly purchaseReceiptService: PurchaseReceiptService,
    private prisma: PrismaService
  ) {}

  @MessagePattern('create.purchase.receipt')
  create(@Payload() createPurchaseReceiptDto: CreatePurchaseReceiptDto) {
    return this.purchaseReceiptService.create(createPurchaseReceiptDto);
  }

  @MessagePattern('update.purchase.receipt.status')
  updateStatus(@Payload() data: { id: string; status: ReceiptStatus }) {
    return this.purchaseReceiptService.updateStatus(data.id, data.status);
  }

  @MessagePattern('list.purchase.receipts')
  listReceipts(@Payload() query: any) {
    return this.purchaseReceiptService.list(query);
  }

  @MessagePattern('query.purchase.receipts.ai')
  async queryAI(@Payload() body: { question: string }) {
    const allReceipts = await this.prisma.purchaseReceipt.findMany();
    return await this.purchaseReceiptService.queryOpenAI(body.question, allReceipts);
  }
}
