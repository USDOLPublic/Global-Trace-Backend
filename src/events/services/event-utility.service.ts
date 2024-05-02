import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { isEmpty, isNil } from 'lodash';
import { calculateTotalWeight } from '~events/helpers/convert-to-kg.helper';
import { AssignProductDto } from '~events/http/dto/assign-product.dto';
import { TransactionRepository } from '~events/repositories/transaction.repository';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { ProductService } from '../../products/services/product.service';

@Injectable()
export class EventUtilityService extends TransactionService {
    constructor(
        private productService: ProductService,
        private transactionRepo: TransactionRepository,
        private supplyChainService: SupplyChainService,
        private rolePermissionService: RolePermissionService
    ) {
        super();
    }

    async isValidFacilityType(fromFacility: FacilityEntity, toFacility: FacilityEntity): Promise<boolean> {
        const supplyChainNode = await this.supplyChainService.findSupplyChainNodeBy({
            fromRoleId: fromFacility.typeId,
            roleId: toFacility.typeId
        });

        return !!supplyChainNode;
    }

    async validatePurchasing(fromFacility: FacilityEntity, toFacility: FacilityEntity) {
        const isValidFacilityType = await this.isValidFacilityType(fromFacility, toFacility);
        if (isValidFacilityType) {
            return;
        }

        const canPurchaseFromIntermediaries = await this.canPurchaseFromIntermediaries(toFacility.typeId);
        if (fromFacility.typeName !== UserRoleEnum.BROKER || !canPurchaseFromIntermediaries) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_purchase_from_partner' });
        }
    }

    private async canPurchaseFromIntermediaries(roleId: string): Promise<boolean> {
        const roleHasAllowPurchaseIntermediaries = await this.rolePermissionService.findOne({
            where: {
                roleId,
                permission: {
                    action: PermissionEnum.ALLOW_PURCHASE_INTERMEDIARIES
                }
            }
        });

        return !!roleHasAllowPurchaseIntermediaries;
    }

    async isAllowedToPurchaseFromNoSeller(facility: FacilityEntity): Promise<boolean> {
        const isMassBalance = facility.type.chainOfCustody === ChainOfCustodyEnum.MASS_BALANCE;
        const doesBuyFromRawMaterialExtractor = await this.supplyChainService.doesBuyFromRawMaterialExtractor(
            facility.typeId
        );

        return doesBuyFromRawMaterialExtractor && isMassBalance;
    }

    async checkUniquePurchaseOrderNumber(toFacilityId: string, purchaseOrderNumber: string) {
        const isExists = await this.transactionRepo.exists({ toFacilityId, purchaseOrderNumber });
        if (isExists) {
            throw new BadRequestException({ translate: 'validation.purchase_order_number_already_taken' });
        }
    }

    async validateSale(fromFacility: FacilityEntity, toFacility: FacilityEntity) {
        const isValidFacilityType = await this.isValidFacilityType(fromFacility, toFacility);
        if (isValidFacilityType) {
            return;
        }

        const canSellToIntermediaries = await this.canSellToIntermediaries(fromFacility.typeId);
        if (toFacility.typeName !== UserRoleEnum.BROKER || !canSellToIntermediaries) {
            throw new BadRequestException({ translate: 'error.user_not_allowed_to_sell_to_partner' });
        }
    }

    private async canSellToIntermediaries(roleId: string): Promise<boolean> {
        const roleHasAllowSaleIntermediaries = await this.rolePermissionService.findOne({
            where: {
                roleId,
                permission: {
                    action: PermissionEnum.ALLOW_SALE_INTERMEDIARIES
                }
            }
        });

        return !!roleHasAllowSaleIntermediaries;
    }

    async checkUniqueInvoiceNumber(fromFacilityId: string, invoiceNumber: string) {
        const isExists = await this.transactionRepo.exists({ fromFacilityId, invoiceNumber });

        if (isExists) {
            throw new BadRequestException({ translate: 'validation.invoice_number_already_taken' });
        }
    }

    async checkUniquePackingListNumber(fromFacilityId: string, packingListNumber: string) {
        const isExists = await this.transactionRepo.exists({ fromFacilityId, packingListNumber });

        if (isExists) {
            throw new BadRequestException({ translate: 'validation.packing_list_number_already_taken' });
        }
    }

    async validWeightProductsLessInputWeight(productIds: string[], quantity: number, quantityUnit: string) {
        const products = await this.productService.findByIds(productIds);
        const totalWeightProducts = calculateTotalWeight(products);
        const totalWeightTransport = calculateTotalWeight([{ quantity, quantityUnit }]);

        if (totalWeightProducts > totalWeightTransport) {
            throw new BadRequestException({ translate: 'error.total_weight_product_less_total_weight_transport' });
        }
    }

    async authorizeSubPermissionsOfLogTransformation(currentUser: UserEntity, data: AssignProductDto) {
        if (data.outputProduct.outputProducts.some(({ qrCode }) => !isNil(qrCode))) {
            const permissionAssignQrCode = await this.rolePermissionService.findOne({
                where: {
                    roleId: currentUser.roleId,
                    permission: {
                        action: PermissionEnum.ASSIGN_QR_CODE
                    }
                }
            });

            if (!permissionAssignQrCode) {
                throw new ForbiddenException({ translate: 'error.forbidden' });
            }
        }

        if (data.outputProduct.outputProducts.some(({ dnaIdentifier }) => !isEmpty(dnaIdentifier))) {
            const permissionAssignDNA = await this.rolePermissionService.findOne({
                where: {
                    roleId: currentUser.roleId,
                    permission: {
                        action: PermissionEnum.ASSIGN_DNA
                    }
                }
            });

            if (!permissionAssignDNA) {
                throw new ForbiddenException({ translate: 'error.forbidden' });
            }
        }
    }
}
