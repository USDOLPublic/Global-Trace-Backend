import { StorageService } from '@diginexhk/nestjs-storage';
import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { Response } from 'express';
import { FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { setHeaderDownloadZipFile } from '~core/helpers/zip-file.helper';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { FacilityItemService } from '~events/services/facility-item.service';
import { ManualAddedProductType } from '~events/types/manual-added-product.type';
import { TimeRangeType } from '~events/types/time-range.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { getFileName } from '~history/helpers/download-file-name.helper';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { ProductDefinitionService } from '~product-definitions/services/product-definition.service';
import { ProductEntity } from '~products/entities/product.entity';
import { formatProductData } from '~products/helpers/format-product-data.helper';
import { ProductRepository } from '~products/repositories/product.repository';
import { GetPurchasedProductByCode } from '~products/types/get-purchased-product-by-code.type';
import { QrCodeService } from '~qr-codes/services/qr-code.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class ProductService {
    constructor(
        private storageService: StorageService,
        private productRepo: ProductRepository,
        private facilityItemService: FacilityItemService,
        private qrCodeService: QrCodeService,
        private rolePermissionService: RolePermissionService,
        private productDefinitionService: ProductDefinitionService
    ) {}

    async createProduct(
        facility: FacilityEntity,
        manualAddedProduct: ManualAddedProductType,
        isManualAdded: boolean = false
    ) {
        const {
            productDefinitionId,
            code,
            quantity,
            quantityUnit,
            additionalAttributes,
            dnaIdentifier,
            certifications,
            verifiedRatio: { verifiedPercentage, notVerifiedPercentage }
        } = manualAddedProduct;

        const product = await this.productRepo.createOne({
            productDefinitionId,
            code,
            quantity,
            quantityUnit,
            verifiedPercentage,
            notVerifiedPercentage,
            isManualAdded,
            additionalAttributes,
            createdFacilityId: facility.id,
            certifications,
            dnaIdentifier
        });
        await this.facilityItemService.createOne(facility, product);

        return product;
    }

    async findFacilityProductByCode(facility: FacilityEntity, code: string) {
        return this.productRepo.findFacilityProductByCode(facility, code);
    }

    async findFacilityProductsById(facility: FacilityEntity, productIds: string[], errorCallback?: () => void) {
        const [products, count] = await this.productRepo.findFacilityProductsById(facility, productIds);

        if (count !== productIds.length) {
            if (errorCallback) {
                errorCallback();
            }
            throw new NotFoundException({ translate: 'error.invalid_product_id' });
        }

        return products;
    }

    async getPurchasedProductByCode(option: GetPurchasedProductByCode) {
        let product: ProductEntity;
        const { currentUser, code, checkOwnFacility = false, transactionType } = option;
        const productDefinition = await this.productDefinitionService.getPurchasedProductDefinition(currentUser);
        const canPurchaseByQrCode = await this.rolePermissionService.hasPermission(
            currentUser,
            PermissionEnum.SCAN_QR_CODE_IN_PURCHASE
        );

        if (canPurchaseByQrCode) {
            product = await this.findProductByQrCode(code, productDefinition);
        }

        if (!product) {
            const permissions = [PermissionEnum.INPUT_PRODUCT_ID_IN_PURCHASE];
            if (transactionType == TransactionTypeEnum.ASSIGN) {
                permissions.push(PermissionEnum.MANUALLY_DEFINE_NEW_PRODUCT);
            }
            const canPurchaseByProductId = await this.rolePermissionService.hasAnyPermissions(currentUser, permissions);

            if (canPurchaseByProductId) {
                product = await this.findProductByCode(
                    code,
                    productDefinition,
                    transactionType == TransactionTypeEnum.ASSIGN
                );
            }
        }

        if (product) {
            return this.checkAndReturnData({
                facility: currentUser.currentFacility,
                product,
                checkOwnFacility,
                transactionType
            });
        }

        throw new NotFoundException({ translate: 'error.product_id_invalid' });
    }

    private async findProductByQrCode(qrCode: string, productDefinition: ProductDefinitionEntity) {
        const qrCodeEntity = await this.qrCodeService.getAssignedQrCode(qrCode);

        if (qrCodeEntity) {
            return this.findProductById(qrCodeEntity.productId, productDefinition);
        }
    }

    private async findProductByCode(
        code: string,
        productDefinition: ProductDefinitionEntity,
        isInputProduct: boolean = false
    ) {
        const where: FindOptionsWhere<ProductEntity> = { code };
        if (!isInputProduct) {
            where.isManualAdded = false;
        }

        const product = await this.productRepo.findOne({
            where,
            relations: [
                'qrCode',
                'productDefinition',
                'productDefinition.productDefinitionAttributes',
                'productDefinition.productDefinitionAttributes.attribute'
            ]
        });

        if (product && product.productDefinitionId === productDefinition.id) {
            return product;
        }
    }

    private async findProductById(id: string, productDefinition: ProductDefinitionEntity) {
        const product = await this.productRepo.findById(id, {
            relations: [
                'qrCode',
                'productDefinition',
                'productDefinition.productDefinitionAttributes',
                'productDefinition.productDefinitionAttributes.attribute'
            ]
        });

        if (product && product.productDefinitionId === productDefinition.id) {
            return product;
        }
    }

    private async checkAndReturnData(option: {
        facility: FacilityEntity;
        product: ProductEntity;
        checkOwnFacility: boolean;
        transactionType: TransactionTypeEnum;
    }) {
        const { facility, product, checkOwnFacility, transactionType } = option;

        if (checkOwnFacility) {
            await this.doesProductBelongToFacility(facility, product);
        }

        if (transactionType === TransactionTypeEnum.PURCHASE && product.isPurchased) {
            throw new BadRequestException({ translate: 'validation.product_is_purchased' });
        }

        if (transactionType === TransactionTypeEnum.ASSIGN && product.isTransformed) {
            throw new BadRequestException({ translate: 'validation.product_is_assigned' });
        }

        return formatProductData(product);
    }

    async getFacilitySoldProductByCode(currentUser: UserEntity, code: string) {
        let product: ProductEntity;
        const productDefinition = await this.productDefinitionService.getSoldProductDefinition(currentUser);
        const canSellByQrCode = await this.rolePermissionService.hasPermission(
            currentUser,
            PermissionEnum.SCAN_QR_CODE_IN_SALE
        );
        if (canSellByQrCode) {
            const qrCodeEntity = await this.qrCodeService.getAssignedQrCode(code);
            if (qrCodeEntity) {
                product = await this.findProductById(qrCodeEntity.productId, productDefinition);

                if (product) {
                    await this.doesProductBelongToFacility(currentUser.currentFacility, product);
                    return formatProductData(product);
                }
            }
        }

        const canSellByProductId = await this.rolePermissionService.hasPermission(
            currentUser,
            PermissionEnum.INPUT_PRODUCT_ID_IN_SALE
        );
        if (canSellByProductId) {
            product = await this.findProductByCode(code, productDefinition);
            if (product) {
                await this.doesProductBelongToFacility(currentUser.currentFacility, product);
                return formatProductData(product);
            }
        }

        throw new NotFoundException({ translate: 'error.product_id_invalid' });
    }

    async getTransportedProductByCode(currentUser: UserEntity, code: string) {
        let product: ProductEntity;
        const productDefinition = await this.productDefinitionService.getSoldProductDefinition(currentUser);
        const canSellByQrCode = await this.rolePermissionService.hasPermission(
            currentUser,
            PermissionEnum.SCAN_QR_CODE_IN_TRANSPORT
        );
        if (canSellByQrCode) {
            const qrCodeEntity = await this.qrCodeService.getAssignedQrCode(code);
            if (qrCodeEntity) {
                product = await this.findProductById(qrCodeEntity.productId, productDefinition);

                if (product) {
                    await this.doesProductBelongToFacility(currentUser.currentFacility, product);
                    return formatProductData(product);
                }
            }
        }

        const canSellByProductId = await this.rolePermissionService.hasPermission(
            currentUser,
            PermissionEnum.INPUT_PRODUCT_ID_IN_TRANSPORT
        );
        if (canSellByProductId) {
            product = await this.findProductByCode(code, productDefinition);
            if (product) {
                await this.doesProductBelongToFacility(currentUser.currentFacility, product);
                return formatProductData(product);
            }
        }

        throw new NotFoundException({ translate: 'error.product_id_invalid' });
    }

    private async doesProductBelongToFacility(facility: FacilityEntity, product: ProductEntity) {
        const doesBelong = await this.facilityItemService.isProductBelongToFacility(facility, product);

        if (!doesBelong) {
            throw new NotFoundException({ translate: 'error.product_id_invalid' });
        }
    }

    getPurchaseCottonNotTransformed(
        facility: FacilityEntity,
        productDefinitionId: string,
        timeRange: TimeRangeType<Date>
    ): Promise<ProductEntity[]> {
        return this.productRepo.getPurchaseCottonNotTransformed(facility, productDefinitionId, timeRange);
    }

    exist(options: FindManyOptions<ProductEntity>): Promise<boolean> {
        return this.productRepo.exist(options);
    }

    async findByIds(productIds: string[]) {
        return this.productRepo.findByIds(productIds);
    }

    find(options: FindManyOptions<ProductEntity>): Promise<ProductEntity[]> {
        return this.productRepo.find(options);
    }

    findOne(options: FindOneOptions<ProductEntity>): Promise<ProductEntity> {
        return this.productRepo.findOne(options);
    }

    findOneByCode(code: string): Promise<ProductEntity> {
        return this.productRepo.findOneBy({ code });
    }

    async update(options: FindOptionsWhere<ProductEntity>, data: Partial<ProductEntity>): Promise<void> {
        await this.productRepo.update(options, data);
    }

    async downloadCertifications(id: string, res: Response) {
        const { certifications } = await this.productRepo.findOneOrFail({ select: ['certifications'], where: { id } });
        if (!certifications.length) {
            throw new BadRequestException({ translate: 'error.product_certification_empty' });
        }

        const existingFiles: string[] = [];

        const zip = new AdmZip();
        for (const certification of certifications) {
            const fileName = getFileName(existingFiles, certification.fileName);
            const buffer = await this.storageService.getFileBuffer(certification.blobName);
            zip.addFile(`certifications/${fileName}`, buffer);
        }

        setHeaderDownloadZipFile(res, 'certifications');
        return new StreamableFile(zip.toBuffer()).getStream().pipe(res);
    }

    findPurchaseTransactionsByProductIds(ids: string[]) {
        return this.productRepo.findPurchaseTransactionsByProductIds(ids);
    }
}
