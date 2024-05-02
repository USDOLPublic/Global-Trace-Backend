import { PaginationParams } from '@diginexhk/nestjs-base-decorator';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { Injectable } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { FacilityPartnerEntity } from '~facilities/entities/facility-partner.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GetAndSearchSupplierBusinessPartnerQuery } from '~facilities/queries/get-and-search-supplier-business-partner.query';
import { GetBusinessPartnersByFacilityIdQuery } from '~facilities/queries/get-business-partner-by-facilityId.query';
import { GetFacilityBusinessBrokerPartnerQuery } from '~facilities/queries/get-facility-business-broker-partner-query';
import { FacilityPartnerRepository } from '~facilities/repositories/facility-partner.repository';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { SearchingSupplierBusinessPartnerParamType } from '~facilities/types/searching-supplier-business-partner-param.type';
import { UserEntity } from '~users/entities/user.entity';
import { FacilityPartnerCreatingType } from '~users/types/facility-partner-creating.type';

@Injectable()
export class FacilityPartnerService extends TransactionService {
    constructor(private facilityRepo: FacilityRepository, private facilityPartnerRepo: FacilityPartnerRepository) {
        super();
    }

    private checkExistedFacilityPartner(
        ownerFacilityId: string,
        baseFacilityId: string,
        facilityPartnerId: string
    ): Promise<boolean> {
        return this.facilityPartnerRepo.exists({
            ownerFacilityId: ownerFacilityId,
            facilityId: baseFacilityId,
            partnerId: facilityPartnerId
        });
    }

    async addFacilityPartner({
        baseFacility,
        facilityPartner,
        creatorId,
        ownerFacility,
        isBrandSupplierPartner = false
    }: FacilityPartnerCreatingType) {
        let facilityPartnerRelationship: FacilityPartnerEntity;
        if (baseFacility && facilityPartner) {
            const isExistedFacilityPartner = await this.checkExistedFacilityPartner(
                ownerFacility.id,
                baseFacility.id,
                facilityPartner.id
            );

            if (!isExistedFacilityPartner) {
                facilityPartnerRelationship = await this.facilityPartnerRepo.save({
                    facility: baseFacility,
                    partner: facilityPartner,
                    creatorId,
                    typeId: facilityPartner.typeId,
                    ownerFacility: ownerFacility || baseFacility
                });
            }

            if (isBrandSupplierPartner) {
                return this.addFacilityPartner({
                    baseFacility: facilityPartner,
                    facilityPartner: baseFacility,
                    creatorId,
                    ownerFacility,
                    isBrandSupplierPartner: false // make it false to prevent infinite loop
                });
            }
        }

        return facilityPartnerRelationship;
    }

    findFacilityPartner(facility: FacilityEntity, partnerId: string): Promise<FacilityEntity> {
        return this.facilityRepo.findFacilityPartner(facility, partnerId);
    }

    getFacilityPartnersByTypeIds(facility: FacilityEntity, typeIds: string[], key?: string): Promise<FacilityEntity[]> {
        return this.facilityRepo.getFacilityPartnersByTypeIds(facility, typeIds, key);
    }

    paginateBusinessPartners(
        facility: FacilityEntity,
        types: string[],
        pagination: PaginationParams
    ): Promise<PaginationCollection<FacilityEntity>> {
        return this.facilityRepo.paginateBusinessPartners(facility, pagination, types);
    }

    findBrokerPartnerByTypeIds(brokerIds: string[], typeIds?: string[]) {
        return this.facilityPartnerRepo.find(new GetFacilityBusinessBrokerPartnerQuery(brokerIds, typeIds));
    }

    async deleteBusinessPartner(currentUser: UserEntity, partnerId: string): Promise<DeleteResult> {
        return this.facilityPartnerRepo.deleteOrFail({
            ownerFacilityId: currentUser.currentFacility.id,
            facilityId: currentUser.currentFacility.id,
            partnerId
        });
    }

    getAndSearchSupplierBusinessPartners(params: SearchingSupplierBusinessPartnerParamType): Promise<FacilityEntity[]> {
        return this.facilityRepo.find(new GetAndSearchSupplierBusinessPartnerQuery(params));
    }

    findBusinessPartnerByFacilityId(facilityId: string): Promise<FacilityEntity[]> {
        return this.facilityRepo.find(new GetBusinessPartnersByFacilityIdQuery(facilityId));
    }
}
