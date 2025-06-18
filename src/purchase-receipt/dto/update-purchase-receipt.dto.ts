import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseReceiptDto } from './create-purchase-receipt.dto';
import { IsEnum } from 'class-validator';

export enum ReceiptStatus {
  pending = 'pending',
  validated = 'validated',
  rejected = 'rejected',
  observed = 'observed',
}

export class UpdatePurchaseReceiptDto extends PartialType(
  CreatePurchaseReceiptDto,
) {
  @IsEnum(ReceiptStatus)
  status!: ReceiptStatus;
}
