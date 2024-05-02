import { Injectable } from '@nestjs/common';
import { isNumber } from 'lodash';
import moment from 'moment';
import { Between } from 'typeorm';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { GetHistoryTransactionQuery } from '~events/queries/get-history-transaction.query';
import { RecordProductRepository } from '~events/repositories/record-product.repository';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { GetTransactionParamType } from '~events/types/get-transaction-param.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { EventTypeEnum } from '~history/enums/event-type.enum';
import { formatProductData } from '~products/helpers/format-product-data.helper';
import { HarvestSeasonService } from '~role-permissions/services/harvest-season.service';

@Injectable()
export class TransactionHistoryService {
    constructor(
        private transactionRepo: TransactionRepository,
        private recordProductRepo: RecordProductRepository,
        private harvestSeasonService: HarvestSeasonService
    ) {}

    findTransactionByPurchaseOrderNumber(facility: FacilityEntity, purchaseOrderNumber: string) {
        return this.transactionRepo.findOne({
            where: { type: TransactionTypeEnum.PURCHASE, facilityId: facility.id, purchaseOrderNumber },
            relations: ['fromFacility', 'transactionItems', 'fromFacility.type'],
            withDeleted: true
        });
    }

    findTransactionByInvoiceNumber(facility: FacilityEntity, invoiceNumber: string) {
        return this.transactionRepo.findOne({
            where: { type: TransactionTypeEnum.SELL, facilityId: facility.id, invoiceNumber },
            relations: ['transactionItems'],
            withDeleted: true
        });
    }

    findTransactionByPackingListNumber(facility: FacilityEntity, packingListNumber: string) {
        return this.transactionRepo.findOne({
            where: { type: TransactionTypeEnum.SELL, facilityId: facility.id, packingListNumber },
            relations: ['transactionItems'],
            withDeleted: true
        });
    }

    findTransactionWithinTimeRange(facility: FacilityEntity, from: number | Date, to: number | Date) {
        const fromDate = isNumber(from) ? new Date(from * 1000) : from;
        const toDate = isNumber(to) ? new Date(to * 1000) : to;
        return this.transactionRepo.findTransactionWithinTimeRange(facility, fromDate, toDate);
    }

    async findManuallyPurchasedProductFromStartDateOfSeason(
        facility: FacilityEntity,
        to: number | Date
    ): Promise<TransactionEntity[]> {
        const toDate = isNumber(to) ? moment.unix(to) : moment(to);
        const timeRange = await this.harvestSeasonService.getHarvestSeasonOfRawMaterialExtractor(
            facility.type,
            toDate.toDate()
        );

        return this.transactionRepo.find({
            where: {
                facilityId: facility.id,
                type: TransactionTypeEnum.PURCHASE,
                transactedAt: Between(timeRange.from, toDate.toDate())
            },
            relations: ['fromFacility', 'fromFacility.type']
        });
    }

    findTransactionsTransactProducts(facility: FacilityEntity, entityIds: string[]) {
        const transactionTypes = [TransactionTypeEnum.PURCHASE, TransactionTypeEnum.SELL];

        return this.transactionRepo.findTransactionsTransactProducts(facility, entityIds, transactionTypes);
    }

    findSellTransactionsByProducts(facility: FacilityEntity, entityIds: string[]) {
        return this.transactionRepo.findTransactionsSaleProducts(facility, entityIds);
    }

    getTransactionById(params: GetTransactionParamType) {
        return this.transactionRepo.getTransactionById(params);
    }

    async getHistoryTransactionByIds(ids: string[]): Promise<TransactionEntity[]> {
        const transactions = await this.transactionRepo.find(new GetHistoryTransactionQuery(ids));
        for (const { transactionItems } of transactions) {
            for (const transactionItem of transactionItems) {
                transactionItem.product = formatProductData(transactionItem.product);
            }
        }
        return transactions;
    }

    getRawTransactionsByIds(ids: string[]) {
        return this.transactionRepo.getRawTransactionsByIds(ids);
    }

    getDocumentTransactionsById(id: string, type: number) {
        if (type == EventTypeEnum.RECORD_PRODUCT) {
            return this.recordProductRepo.getRecordProductById(id);
        }
        return this.transactionRepo.getDocumentTransactionsById(id);
    }
}
