import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductEntity } from '~products/entities/product.entity';

export type NotLoggedSaleTransactionType = {
    toFacility: FacilityEntity;
    products: ProductEntity[];
    transactedAt: number | Date;
};
