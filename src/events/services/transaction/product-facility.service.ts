import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductService } from '../../../products/services/product.service';

@Injectable()
export class ProductFacilityService {
    constructor(protected productService: ProductService) {}

    findFacilityItems(facility: FacilityEntity, productIds: string[]): Promise<ProductEntity[]> {
        return this.productService.findFacilityProductsById(facility, productIds);
    }

    findFacilityItemsForTransaction(
        facility: FacilityEntity,
        productIds: string[],
        type: TransactionTypeEnum
    ): Promise<ProductEntity[]> {
        let errorCallback: () => void;
        if (type === TransactionTypeEnum.PURCHASE) {
            errorCallback = () => {
                throw new BadRequestException({ translate: 'error.invalid_purchase' });
            };
        } else if (type === TransactionTypeEnum.SELL) {
            errorCallback = () => {
                throw new BadRequestException({ translate: 'error.invalid_sale' });
            };
        }

        return this.productService.findFacilityProductsById(facility, productIds, errorCallback);
    }
}
