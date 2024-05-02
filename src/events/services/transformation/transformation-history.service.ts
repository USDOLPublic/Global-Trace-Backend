import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { GetHistoryTransformationQuery } from '~events/queries/get-history-transformation.query';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { TransformationRepository } from '~events/repositories/transformation.repository';
import { TransformationItemRepository } from '~events/repositories/transformation-item.repository';
import { formatProductData } from '~products/helpers/format-product-data.helper';

@Injectable()
export class TransformationHistoryService {
    constructor(
        private transformationRepo: TransformationRepository,
        private transformationItemRepo: TransformationItemRepository
    ) {}

    async getHistoryTransformationsByIds(ids: string[]) {
        const transformations = await this.transformationRepo.find(new GetHistoryTransformationQuery(ids));
        for (const { transformationItems } of transformations) {
            for (const transformationItem of transformationItems) {
                transformationItem.product = formatProductData(transformationItem.product);
            }
        }
        return transformations;
    }

    getTransformationFromOutput(facility: FacilityEntity, entityIds: string[]) {
        return this.transformationRepo.getTransformationFromOutput(facility, entityIds);
    }

    getInputProducts(transformationIds: string[]) {
        return this.transformationItemRepo.findBy({ transformationId: In(transformationIds), isInput: true });
    }
}
