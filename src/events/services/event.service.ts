import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import moment from 'moment';
import { In } from 'typeorm';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { AssignProductDto } from '~events/http/dto/assign-product.dto';
import { NewTransportDto } from '~events/http/dto/new-transport.dto';
import { PurchasedProductDto } from '~events/http/dto/purchased-product.dto';
import { RecordProductDto } from '~events/http/dto/record-product.dto';
import { SoldProductDto } from '~events/http/dto/sold-product.dto';
import { RequiredSellerResponse } from '~events/http/response/required-seller.response';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { TransactionItemService } from '~events/services/transaction/transaction-item.service';
import { RecordProductProofUploadType } from '~events/types/record-product-proof-upload.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerService } from '~facilities/services/facility-partner.service';
import { HistoryService } from '~history/services/history.service';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { QrCodeService } from '~qr-codes/services/qr-code.service';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { HarvestSeasonService } from '~role-permissions/services/harvest-season.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { ProductService } from '../../products/services/product.service';
import { EventUtilityService } from './event-utility.service';
import { ProductAttributeService } from './product/product-attribute.service';
import { RecordProductService } from './record-product.service';
import { ProductTransactionService } from './transaction/product-transaction.service';
import { ProductTransformationService } from './transformation/product-transformation.service';
import { VerifyRatioService } from './verify-ratio.service';
import { RoleEntity } from '~role-permissions/entities/role.entity';

@Injectable()
export class EventService extends TransactionService {
    constructor(
        private historyService: HistoryService,
        private productTransactionService: ProductTransactionService,
        private productService: ProductService,
        private transactionItemService: TransactionItemService,
        private productAttributeService: ProductAttributeService,
        private transactionRepo: TransactionRepository,
        private productDefinitionRepo: ProductDefinitionRepository,
        private supplyChainService: SupplyChainService,
        private recordProductService: RecordProductService,
        private qrCodeService: QrCodeService,
        private productTransformationService: ProductTransformationService,
        private eventUtilityService: EventUtilityService,
        private facilityPartnerService: FacilityPartnerService,
        private verifyRatioService: VerifyRatioService,
        private harvestSeasonService: HarvestSeasonService
    ) {
        super();
    }

    async isSellerRequired(currentUser: UserEntity): Promise<RequiredSellerResponse> {
        const isAllowedToPurchaseFromNoSeller = await this.eventUtilityService.isAllowedToPurchaseFromNoSeller(
            currentUser.currentFacility
        );
        let nonParticipatingRoleName;

        if (isAllowedToPurchaseFromNoSeller) {
            const supplyChainNode = await this.supplyChainService.findSupplyChainNode({
                where: {
                    roleId: currentUser.currentFacility.typeId
                },
                relations: ['fromRole']
            });

            nonParticipatingRoleName = supplyChainNode.fromRole?.name;
        }

        return {
            isSellerRequired: !isAllowedToPurchaseFromNoSeller,
            nonParticipatingRoleName
        };
    }

    async purchase(currentUser: UserEntity, data: PurchasedProductDto) {
        const toFacility = currentUser.currentFacility;
        let fromFacility: FacilityEntity;

        if (data?.fromFacilityId) {
            fromFacility = await this.facilityPartnerService.findFacilityPartner(toFacility, data.fromFacilityId);
            await this.eventUtilityService.validatePurchasing(fromFacility, toFacility);
        } else if (!(await this.eventUtilityService.isAllowedToPurchaseFromNoSeller(currentUser.currentFacility))) {
            throw new BadRequestException({ translate: 'error.required_seller' });
        }

        await this.checkPurchaseFromRawMaterialExtractor(currentUser.role, data.transactedAt);
        await this.eventUtilityService.checkUniquePurchaseOrderNumber(toFacility.id, data.purchaseOrderNumber);

        const transactionData: Partial<TransactionEntity> = {
            ...pick(data, ['price', 'currency', 'transactedAt', 'purchaseOrderNumber', 'uploadProofs']),
            facilityId: currentUser.currentFacility.id,
            type: TransactionTypeEnum.PURCHASE
        };

        if (data.productIds?.length && fromFacility) {
            const products = await this.productService.findByIds(data.productIds);

            await this.productAttributeService.validatePurchasedProducts(products, currentUser.currentFacility);
            await this.productService.update({ id: In(products.map(({ id }) => id)) }, { isPurchased: true });

            return this.productTransactionService.transactProducts({
                fromFacility,
                toFacility,
                entityIds: products.map(({ id }) => id),
                user: currentUser,
                transactionData
            });
        }

        const transaction = await this.transactionRepo.createOne({
            ...transactionData,
            totalWeight: 0,
            weightUnit: WeightUnitEnum.KG,
            fromFacilityId: fromFacility?.id,
            toFacilityId: toFacility.id,
            creatorId: currentUser.id
        });
        await this.historyService.createTransactionEvent(transaction);

        return transaction;
    }

    private async checkPurchaseFromRawMaterialExtractor(role: RoleEntity, transactedAt: number) {
        const doesBuyFromRawMaterialExtractor = await this.supplyChainService.doesBuyFromRawMaterialExtractor(role.id);
        if (!doesBuyFromRawMaterialExtractor) {
            return;
        }

        const timeRange = await this.harvestSeasonService.getCurrentHarvestSeasonOfRawMaterialExtractor(role);
        if (timeRange.from && timeRange.to && !moment.unix(transactedAt).isBetween(timeRange.from, timeRange.to)) {
            throw new BadRequestException({ translate: 'error.invalid_harvest_season' });
        }
    }

    private async checkActivityInCurrentReconciliationWindow(facility: FacilityEntity, role: RoleEntity, time: Date) {
        const isValid = await this.harvestSeasonService.isBetweenCurrentReconciliationWindow(facility, role, time);
        if (!isValid) {
            throw new BadRequestException({ translate: 'error.invalid_reconciliation_window' });
        }
    }

    getPurchasedProduct(currentUser: UserEntity, code: string) {
        return this.productService.getPurchasedProductByCode({
            currentUser,
            code,
            transactionType: TransactionTypeEnum.PURCHASE
        });
    }

    getInputProduct(currentUser: UserEntity, code: string) {
        return this.productService.getPurchasedProductByCode({
            currentUser,
            code,
            checkOwnFacility: true,
            transactionType: TransactionTypeEnum.ASSIGN
        });
    }

    getTransportedProduct(currentUser: UserEntity, code: string) {
        return this.productService.getTransportedProductByCode(currentUser, code);
    }

    getSoldProduct(currentUser: UserEntity, code: string) {
        return this.productService.getFacilitySoldProductByCode(currentUser, code);
    }

    async sell(currentUser: UserEntity, data: SoldProductDto) {
        const fromFacility = currentUser.currentFacility;
        const toFacility = await this.facilityPartnerService.findFacilityPartner(fromFacility, data.toFacilityId);
        await this.checkActivityInCurrentReconciliationWindow(
            fromFacility,
            currentUser.role,
            moment.unix(data.transactedAt).toDate()
        );
        await this.eventUtilityService.validateSale(fromFacility, toFacility);

        const products = await this.productService.findByIds(data.productIds);
        await this.productAttributeService.validateSoldProducts(products, fromFacility);
        await this.eventUtilityService.checkUniqueInvoiceNumber(fromFacility.id, data.invoiceNumber);
        await this.eventUtilityService.checkUniquePackingListNumber(fromFacility.id, data.packingListNumber);

        const transactionData: Partial<TransactionEntity> = pick(data, [
            'price',
            'currency',
            'transactedAt',
            'invoiceNumber',
            'packingListNumber'
        ]);
        transactionData.facilityId = currentUser.currentFacility.id;
        transactionData.type = TransactionTypeEnum.SELL;
        transactionData.uploadInvoices = data.uploadInvoices;
        transactionData.uploadPackingLists = data.uploadPackingLists;

        await this.productService.update({ id: In(products.map(({ id }) => id)) }, { isSold: true });

        return this.productTransactionService.transactProducts({
            fromFacility,
            toFacility,
            entityIds: products.map(({ id }) => id),
            user: currentUser,
            transactionData
        });
    }

    async transport(user: UserEntity, data: NewTransportDto) {
        const fromFacility = user.currentFacility;
        const toFacility = await this.facilityPartnerService.findFacilityPartner(fromFacility, data.toFacilityId);

        if (toFacility.typeName !== UserRoleEnum.TRANSPORTER) {
            throw new BadRequestException({ translate: 'error.transact_partner_invalid' });
        }

        await this.checkActivityInCurrentReconciliationWindow(
            fromFacility,
            user.role,
            moment.unix(data.transactedAt).toDate()
        );

        await this.eventUtilityService.validWeightProductsLessInputWeight(
            data.productIds,
            data.totalWeight,
            data.weightUnit
        );

        const transactionData: Partial<TransactionEntity> = pick(data, [
            'totalWeight',
            'weightUnit',
            'transactedAt',
            'packingListNumber',
            'uploadPackingLists'
        ]);
        transactionData.facilityId = user.currentFacility.id;
        transactionData.type = TransactionTypeEnum.TRANSPORT;

        await this.productService.update({ id: In(data.productIds) }, { isTransported: true });

        return this.productTransactionService.transactProducts({
            fromFacility,
            toFacility,
            user,
            transactionData,
            entityIds: data.productIds
        });
    }

    async createRecordByProduct(user: UserEntity, data: RecordProductDto, files: RecordProductProofUploadType) {
        await this.checkActivityInCurrentReconciliationWindow(
            user.currentFacility,
            user.role,
            moment.unix(data.recordedAt).toDate()
        );
        return this.recordProductService.createRecordByProduct(user, data, files.uploadProofs);
    }

    async assignProducts(user: UserEntity, data: AssignProductDto) {
        const transformation = await this.productTransformationService.assignProducts(user, data);

        if (data.inputProductIds?.length) {
            await this.qrCodeService.dispenseQrCode(data.inputProductIds);
        }

        return transformation;
    }

    async addManualProducts(
        currentUser: UserEntity,
        transaction: TransactionEntity,
        { fromFacilityId, manualAddedData }: PurchasedProductDto
    ): Promise<void> {
        if (!manualAddedData.manualAddedProducts.length) return;

        const { currentFacility } = currentUser;
        const { productDefinitionId, manualAddedProducts } = manualAddedData;
        const productDefinition = await this.productDefinitionRepo.findOneOrFail({
            where: { id: productDefinitionId },
            relations: ['productDefinitionAttributes', 'productDefinitionAttributes.attribute']
        });
        await this.productAttributeService.validateManualAddedProducts(
            productDefinition,
            manualAddedProducts,
            currentFacility,
            TransactionTypeEnum.PURCHASE
        );
        const doesBuyFromRawMaterialExtractor = await this.supplyChainService.doesBuyFromRawMaterialExtractor(
            currentFacility.typeId
        );
        for (const { attributes } of manualAddedProducts) {
            const code = await this.productAttributeService.getCode(attributes);
            const { quantity, quantityUnit } = await this.productAttributeService.getQuantityAndUnit(attributes);
            const certifications = this.productAttributeService.getCertifications(attributes, productDefinition);
            const extra = attributes.map(({ id: attributeId, value }) => ({ attributeId, value, quantityUnit }));
            const product = await this.productService.createProduct(
                currentFacility,
                {
                    code,
                    quantity,
                    quantityUnit,
                    productDefinitionId,
                    additionalAttributes: extra,
                    certifications,
                    verifiedRatio: {
                        verifiedPercentage: doesBuyFromRawMaterialExtractor && fromFacilityId ? 100 : 0,
                        notVerifiedPercentage: doesBuyFromRawMaterialExtractor && fromFacilityId ? 0 : 100
                    }
                },
                true
            );
            await this.transactionItemService.createOne(transaction, product);
        }
        if (doesBuyFromRawMaterialExtractor) {
            await this.verifyRatioService.correctVerifyRatio(currentFacility, transaction.transactedAt as number);
        }
    }
}
