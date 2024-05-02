import { PaginationParams } from '@diginexhk/nestjs-base-decorator';
import { StorageService } from '@diginexhk/nestjs-storage';
import { forwardRef, Inject, Injectable, InternalServerErrorException, StreamableFile } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { Response } from 'express';
import { Dictionary, keyBy } from 'lodash';
import moment from 'moment';
import { DeepPartial } from 'typeorm';
import { setHeaderDownloadZipFile } from '~core/helpers/zip-file.helper';
import { FileUploadType } from '~core/types/file-upload.type';
import { RecordProductEntity } from '~events/entities/record-product.entity';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransformationEntity } from '~events/entities/transformation.entity';
import { RecordProductService } from '~events/services/record-product.service';
import { TransactionHistoryService } from '~events/services/transaction/transaction-history.service';
import { TransformationHistoryService } from '~events/services/transformation/transformation-history.service';
import { TimeRangeType } from '~events/types/time-range.type';
import { DATE_FORMAT } from '~facilities/constants/farm-group-template.constants';
import { TRANSACTION_TYPE } from '~history/constants/transaction-type.const';
import { EventEntity } from '~history/entities/event.entity';
import { EventTypeEnum } from '~history/enums/event-type.enum';
import { getFileName } from '~history/helpers/download-file-name.helper';
import { GetEventsQuery } from '~history/queries/get-events.query';
import { EventRepository } from '~history/repositories/event.repository';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class HistoryService {
    constructor(
        private storageService: StorageService,
        private eventRepo: EventRepository,
        private transactionHistoryService: TransactionHistoryService,
        private transformationHistoryService: TransformationHistoryService,
        @Inject(forwardRef(() => RecordProductService)) private recordProductService: RecordProductService,
        private supplyChainService: SupplyChainService
    ) {}

    async list(
        user: UserEntity,
        paginationParams: PaginationParams,
        timeRange: TimeRangeType<number>,
        types: EventTypeEnum[] = []
    ) {
        const data = await this.eventRepo.pagination(
            new GetEventsQuery(user.currentFacility.id, timeRange, types),
            paginationParams
        );

        const transactions: Dictionary<TransactionEntity> = keyBy(await this.getTransactionHistories(data.items), 'id');
        const transformations: Dictionary<TransformationEntity> = keyBy(
            await this.getHistoryTransformationsByIds(data.items),
            'id'
        );
        const recordProducts: Dictionary<RecordProductEntity> = keyBy(await this.getRecordProducts(data.items), 'id');

        for (const event of data.items) {
            if (TRANSACTION_TYPE.includes(event.type)) {
                event.transaction = transactions[event.entityId];
            } else if (event.type === EventTypeEnum.TRANSFORM) {
                event.transformation = transformations[event.entityId];
            } else if (event.type === EventTypeEnum.RECORD_PRODUCT) {
                event.recordProduct = recordProducts[event.entityId];
            }
        }
        return data;
    }

    private getHistoryTransformationsByIds(events: EventEntity[]): Promise<TransformationEntity[]> {
        const transformationIds = this.getMorphEntityIds(events, EventTypeEnum.TRANSFORM);
        return this.transformationHistoryService.getHistoryTransformationsByIds(transformationIds);
    }

    private getTransactionHistories(events: EventEntity[]): Promise<TransactionEntity[]> {
        const transactionIds = events.reduce((acc: string[], { type, entityId }) => {
            if (TRANSACTION_TYPE.includes(type)) {
                acc.push(entityId);
            }

            return acc;
        }, []);

        return this.transactionHistoryService.getHistoryTransactionByIds(transactionIds);
    }

    private getRecordProducts(events: EventEntity[]): Promise<RecordProductEntity[]> {
        const recordProductIds = this.getMorphEntityIds(events, EventTypeEnum.RECORD_PRODUCT);
        return this.recordProductService.getRecordProductsByIds(recordProductIds);
    }

    private getMorphEntityIds(events: EventEntity[], eventType: EventTypeEnum) {
        return events.filter(({ type }) => type === eventType).map(({ entityId }) => entityId);
    }

    createEvent(data: DeepPartial<EventEntity>) {
        return this.eventRepo.createOne(data);
    }

    createTransformationEvent(transformation: TransformationEntity) {
        return this.createEvent({
            facilityId: transformation.facilityId || transformation.facility.id,
            type: EventTypeEnum.TRANSFORM,
            recordedAt: transformation.createdAt,
            entityId: transformation.id,
            entityType: TransformationEntity.name
        });
    }

    createTransactionEvent(transaction: TransactionEntity) {
        return this.createEvent({
            facilityId: transaction.facilityId || transaction.facility.id,
            type: transaction.type as unknown as EventTypeEnum,
            recordedAt: transaction.transactedAt,
            entityId: transaction.id,
            entityType: TransactionEntity.name
        });
    }

    createRecordProductEvent(record: RecordProductEntity) {
        return this.createEvent({
            facilityId: record.facilityId || record.facility.id,
            type: EventTypeEnum.RECORD_PRODUCT,
            recordedAt: record.recordedAt,
            entityId: record.id,
            entityType: RecordProductEntity.name
        });
    }

    async downloadDocuments(transactionId: string, res: Response, type: EventTypeEnum) {
        const transaction = await this.transactionHistoryService.getDocumentTransactionsById(transactionId, type);
        const zip = new AdmZip();

        const existingFiles: string[] = [];

        await this.addDocumentToZip(zip, transaction, 'uploadProofs', type, existingFiles);
        await this.addDocumentToZip(zip, transaction, 'uploadInvoices', type, existingFiles);
        await this.addDocumentToZip(zip, transaction, 'uploadPackingLists', type, existingFiles);

        const directory = this.getDirectory(type);
        setHeaderDownloadZipFile(res, directory);
        return new StreamableFile(zip.toBuffer()).getStream().pipe(res);
    }

    private async addDocumentToZip(
        zip: AdmZip,
        transaction: TransactionEntity | RecordProductEntity,
        field: string,
        type: EventTypeEnum,
        existingFiles: string[]
    ): Promise<void> {
        let fileUploads: FileUploadType[];
        if (type == EventTypeEnum.RECORD_PRODUCT) {
            fileUploads = transaction['uploadProofs'];
        } else {
            fileUploads = transaction[field];
        }
        if (!fileUploads.length) {
            return;
        }

        const directory = this.getDirectory(type);

        for (const fileUpload of fileUploads) {
            const fileName = getFileName(existingFiles, `${directory}/${fileUpload.fileName}`);
            const buffer = await this.storageService.getFileBuffer(fileUpload.blobName);
            zip.addFile(fileName, buffer);
        }
    }

    private getDirectory(type: EventTypeEnum) {
        const currentDate = moment().format('DD-MM-YYYY');
        switch (type) {
            case EventTypeEnum.PURCHASE:
                return 'Purchase_Order_' + currentDate;
            case EventTypeEnum.SELL:
                return 'Sale_Order_' + currentDate;
            case EventTypeEnum.TRANSPORT:
                return 'Shipping_Doc_' + currentDate;
            case EventTypeEnum.RECORD_PRODUCT:
                return 'By_Product_' + currentDate;
        }
    }

    async getSeasonStartTime(user: UserEntity): Promise<{ seasonStartTime: number; seasonDuration: number }> {
        const rawMaterialExtractorRole = await this.supplyChainService.getRawMaterialExtractorRole(user.role.id);
        if (!rawMaterialExtractorRole) {
            throw new InternalServerErrorException({
                translate: 'error.there_is_no_raw_material_extractor_in_supply_chain_yet'
            });
        }

        return {
            seasonStartTime: moment(rawMaterialExtractorRole.seasonStartDate, DATE_FORMAT).unix(),
            seasonDuration: rawMaterialExtractorRole.seasonDuration
        };
    }
}
