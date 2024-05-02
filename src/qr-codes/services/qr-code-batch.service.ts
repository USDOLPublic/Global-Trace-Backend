import { BadRequestException, Injectable, StreamableFile } from '@nestjs/common';
import { QrCodeBatchRepository } from '~qr-codes/repositories/qr-code-batch.repository';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Buffer } from 'buffer';
import { QrCodeEntity } from '~qr-codes/entities/qr-code.entity';
import { createContent } from '~pdf-printer/helpers/export-qr-code-pdf.helper';
import { Response } from 'express';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';
import { setHeaderDownloadZipFile } from '~core/helpers/zip-file.helper';
import { promiseProps } from '~core/helpers/promise.helper';
import { ExportedPdfByQrCodeType } from '~qr-codes/types/exported-pdf-by-qr-code.type';
import { PdfService } from '~pdf-printer/services/pdf-printer.service';
import { PromisePropType } from '~core/types/promise-prop.type';
import { PaginationParams, SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { GetAndSearchQrCodeBatchQuery } from '~qr-codes/queries/get-and-search-qr-code-batch.query';
import { UserEntity } from '~users/entities/user.entity';
import { GenerateQrCodesDto } from '~qr-codes/http/dto/generate-qr-codes.dto';
import { QrCodeService } from '~qr-codes/services/qr-code.service';

@Injectable()
export class QrCodeBatchService extends TransactionService {
    constructor(
        private qrCodeBatchRepo: QrCodeBatchRepository,
        private qrCodeRepo: QrCodeRepository,
        private pdfService: PdfService,
        private qrCodeService: QrCodeService
    ) {
        super();
    }

    async deleteDispenseQrCodeBatch() {
        const listDispenseQrCodeBatch = await this.qrCodeBatchRepo.findBy({ completedAt: Not(IsNull()) });
        return Promise.all(listDispenseQrCodeBatch.map((item) => this.deleteQrCodeById(item.id)));
    }

    async deleteQrCodeById(qrCodeBatchId: string) {
        await this.checkDispenseQrCodeBatch(qrCodeBatchId);
        this.qrCodeRepo.softDelete({ qrCodeBatchId: qrCodeBatchId });
        return this.qrCodeBatchRepo.softDelete({ id: qrCodeBatchId });
    }

    async checkDispenseQrCodeBatch(qrCodeBatchId: string) {
        const qrCodeBatch = await this.qrCodeBatchRepo.findOneBy({ id: qrCodeBatchId, completedAt: Not(IsNull()) });

        if (!qrCodeBatch) {
            throw new BadRequestException({
                translate: 'validation.The qr code batch is not dispensed to be deleted'
            });
        }
    }

    private exportPdfs(qrCodes: QrCodeEntity[]): Promise<ExportedPdfByQrCodeType> {
        const pdfBufferByQrCode = qrCodes.reduce((acc: PromisePropType<Buffer>, { code }: QrCodeEntity) => {
            acc[code] = this.pdfService.createPdfBuffer(createContent(code));
            return acc;
        }, {});

        return promiseProps<Buffer>(pdfBufferByQrCode);
    }

    async downloadQrCodeBatch(qrCodeBatchId: string, isAssigned: boolean, res: Response) {
        const condition: FindOptionsWhere<QrCodeEntity>[] | FindOptionsWhere<QrCodeEntity> | ObjectLiteral | string = {
            qrCodeBatchId
        };
        if (isAssigned) {
            condition.productId = Not(IsNull());
        }

        const qrCodes = await this.qrCodeRepo.find({ where: condition });
        const exportedPdfsByQrCode = await this.exportPdfs(qrCodes);

        setHeaderDownloadZipFile(res, 'qr-codes-batch');
        return new StreamableFile(this.pdfService.zipFilePdfs(exportedPdfsByQrCode)).getStream().pipe(res);
    }

    listQrCodeBatchs(key: string, paginationParams: PaginationParams, sortParams: SortMultipleParams[]) {
        return this.qrCodeBatchRepo.pagination(
            new GetAndSearchQrCodeBatchQuery({ key, sortParams, isCompleted: false }),
            paginationParams
        );
    }

    viewHistory(paginationParams: PaginationParams, sortParams: SortMultipleParams[]) {
        return this.qrCodeBatchRepo.pagination(
            new GetAndSearchQrCodeBatchQuery({ sortParams, isCompleted: true }),
            paginationParams
        );
    }

    async generate(admin: UserEntity, dto: GenerateQrCodesDto) {
        const qrCodeBatch = await this.qrCodeBatchRepo.createOne({
            name: dto.name,
            quantity: dto.quantity,
            totalEncoded: dto.quantity,
            creator: admin
        });
        await this.qrCodeService.createQrCodesInBatch(qrCodeBatch, dto.quantity);

        return qrCodeBatch;
    }
}
