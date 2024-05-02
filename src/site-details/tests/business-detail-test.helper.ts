import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TestHelper } from '~core/tests/test.helper';
import { LocationTestHelper } from '~locations/tests/location-test.helper';
import { BusinessDetailEntity } from '~site-details/entities/business-detail.entity';
import { BusinessDetailRepository } from '~site-details/repositories/business-detail.repository';

export class BusinessDetailTestHelper {
    constructor(private testHelper: TestHelper) {}

    async createBusinessDetail(options: QueryDeepPartialEntity<BusinessDetailEntity> = {}) {
        return BusinessDetailRepository.make().createOne({
            name: 'Supply chain',
            sector: 'Cotton',
            countryIds: [LocationTestHelper.countryId],
            ...options
        });
    }
}
