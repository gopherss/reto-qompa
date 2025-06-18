import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Parser } from 'json2csv';
import { PrismaService } from '../prisma.service';
import { CreatePurchaseReceiptDto } from './dto/create-purchase-receipt.dto';
import { ReceiptStatus } from './dto/update-purchase-receipt.dto';
import { Configuration, OpenAIApi } from 'openai';


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


@Injectable()
export class PurchaseReceiptService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPurchaseReceiptDto: CreatePurchaseReceiptDto,
  ): Promise<any> {
    let igv: number = parseFloat(
      (createPurchaseReceiptDto.amount * 0.18).toFixed(2),
    );
    let total: number = parseFloat(
      (createPurchaseReceiptDto.amount + igv).toFixed(2),
    );

    const isValid: boolean = await this.validateWithSunat(
      createPurchaseReceiptDto.supplierRuc,
    );

    const status: 'validated' | 'observed' = isValid ? 'validated' : 'observed';

    return this.prisma.purchaseReceipt.create({
      data: {
        ...createPurchaseReceiptDto,
        igv,
        total,
        status,
        issueDate: new Date(createPurchaseReceiptDto.issueDate),
      },
    });
  }

  async validateWithSunat(ruc: string): Promise<boolean> {
    const lastDigit = parseInt(ruc.slice(-1));
    return !isNaN(lastDigit) && lastDigit % 2 === 0;
  }

  async updateStatus(id: string, status: ReceiptStatus): Promise<any> {
    return this.prisma.PurchaseReceipt.update({
      where: { id },
      data: { status },
    });
  }

  async list(params: Partial<IParamsPagination>) {
    const {
      page = 1,
      pageSize = 10,
      documentType,
      status,
      startDate,
      endDate,
    } = params;

    const where: any = {};
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate);
      if (endDate) where.issueDate.lte = new Date(endDate);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseReceipt.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.purchaseReceipt.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    };
  }

  async exportToCsv(res: Response, filters: any) {
    const records = await this.list(filters);
    const parser = new Parser({
      fields: [
        'invoiceNumber',
        'supplierRuc',
        'amount',
        'igv',
        'total',
        'status',
      ],
    });
    const csv = parser.parse(records.data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=receipts.csv');
    res.send(csv);
  }

  async queryOpenAI(question: string, receipts: any[]) {
    const prompt = `
  Tengo estos comprobantes: ${JSON.stringify(receipts)}.
  Responde la pregunta: "${question}".
  `;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.data.choices[0].message?.content;
  }

}
