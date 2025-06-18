import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreatePurchaseReceiptDto {
  @IsString()
  companyId!: string;

  @IsString()
  supplierRuc!: string;

  @IsString()
  invoiceNumber!: string;

  @IsNumber()
  amount!: number;

  @IsDateString()
  issueDate!: string;

  @IsString()
  documentType!: string;
}
