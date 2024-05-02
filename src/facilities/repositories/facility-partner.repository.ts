import { CustomRepository } from '@diginexhk/typeorm-helper';
import { Brackets } from 'typeorm';
import { BaseRepository } from '~core/repositories/base.repository';
import { FacilityPartnerEntity } from '~facilities/entities/facility-partner.entity';

@CustomRepository(FacilityPartnerEntity)
export class FacilityPartnerRepository extends BaseRepository<FacilityPartnerEntity> {
    async updateFacilityType(partnerId: string, typeId: string) {
        await this.createQueryBuilder().update(FacilityPartnerEntity).set({ typeId }).where({ partnerId }).execute();
    }

    async deleteSupplierByBrand(ownerFacilityId: string, supplierId: string) {
        return this.createQueryBuilder()
            .delete()
            .where({ ownerFacilityId })
            .andWhere(
                new Brackets((qb) => {
                    qb.where({ facilityId: supplierId }).orWhere({ partnerId: supplierId });
                })
            )
            .execute();
    }
}
