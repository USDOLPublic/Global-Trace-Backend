import { PaginationParams } from '@diginexhk/nestjs-base-decorator';
import { CustomRepository } from '@diginexhk/typeorm-helper';
import { Brackets } from 'typeorm/query-builder/Brackets';
import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { getFacilityBusinessPartnerByTypeIdQueryHelper } from '~facilities/helpers/get-facility-business-partner-by-type-id-query.helper';
import { GetBrandSuppliersQuery } from '~facilities/queries/get-brand-suppliers.query';
import { FacilityEntity } from '../entities/facility.entity';

@CustomRepository(FacilityEntity)
export class FacilityRepository extends BaseRepository<FacilityEntity> {
    findFacilityPartner(facility: FacilityEntity, partnerId: string) {
        return this.createQueryBuilder('Facility')
            .leftJoinAndSelect('Facility.users', 'FacilityUser')
            .leftJoinAndSelect('Facility.type', 'Role')
            .innerJoin('Facility.partnerFacilities', 'PartnerFacility')
            .where({ id: partnerId })
            .andWhere('PartnerFacility.ownerFacilityId = :ownerFacilityId', { ownerFacilityId: facility.id })
            .andWhere('PartnerFacility.facilityId = :facilityId', { facilityId: facility.id })
            .getOneOrFail();
    }

    findFacilityOfUser(userId: string): Promise<FacilityEntity> {
        return this.createQueryBuilder('facility')
            .innerJoin('facility.users', 'user', 'user.id = :userId', { userId })
            .leftJoinAndSelect('facility.type', 'Role')
            .leftJoinAndSelect('facility.country', 'Country')
            .leftJoinAndSelect('facility.province', 'Province')
            .leftJoinAndSelect('facility.district', 'District')
            .getOne();
    }

    getSupplierPartnersByTypeIds(facility: FacilityEntity, typeIds: string[], key?: string) {
        const query = this.createQueryBuilder('Facility')
            .leftJoinAndSelect('Facility.type', 'Role')
            .innerJoin('Facility.partnerFacilities', 'PartnerFacility')
            .where('PartnerFacility.facilityId = :facilityId', { facilityId: facility.id })
            .andWhere('PartnerFacility.ownerFacilityId = :ownerFacilityId', { ownerFacilityId: facility.id })
            .andWhere('Role.id IN (:...typeIds)', { typeIds });

        if (key) {
            query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(key))
            });
        }

        return query.getMany();
    }

    getFacilityPartnersByTypeIds(facility: FacilityEntity, typeIds: string[], key?: string) {
        return getFacilityBusinessPartnerByTypeIdQueryHelper(
            this.createQueryBuilder('Facility'),
            facility,
            typeIds,
            key
        ).getMany();
    }

    paginateBusinessPartners(
        facility: FacilityEntity,
        paginationParams: PaginationParams,
        typeIds: string[],
        key?: string
    ) {
        return this.pagination(
            getFacilityBusinessPartnerByTypeIdQueryHelper(this.createQueryBuilder('Facility'), facility, typeIds, key),
            paginationParams
        );
    }

    findBrandSuppliers(facility: FacilityEntity) {
        return this.find(new GetBrandSuppliersQuery(facility.id));
    }

    findExistedSupplierFacility(businessName: string, email: string, oarId?: string) {
        return this.createQueryBuilder('facility')
            .innerJoin('facility.users', 'user')
            .where(
                new Brackets((subQuery) => {
                    subQuery.where('facility.name = :businessName AND user.email = :email', { businessName, email });
                    subQuery.orWhere(
                        `facility.name = :businessName AND facility.oarId IS NOT NULL AND facility.oarId <> '' AND facility.oarId = :oarId`,
                        {
                            businessName,
                            oarId
                        }
                    );
                })
            )
            .getOne();
    }

    findSupplierFacilityByContactorEmail(businessName: string, email: string) {
        return this.createQueryBuilder('facility')
            .innerJoin('facility.users', 'user')
            .where('facility.name <> :businessName AND user.email = :email', { businessName, email })
            .getOne();
    }

    findSupplierFacilityByContactorOarId(businessName: string, oarId: string) {
        return this.createQueryBuilder('facility')
            .where(
                `facility.name <> :businessName AND facility.oarId IS NOT NULL AND facility.oarId <> '' AND facility.oarId = :oarId`,
                {
                    businessName,
                    oarId
                }
            )
            .getOne();
    }

    findByRoles(roleIds: string[]): Promise<FacilityEntity[]> {
        return this.createQueryBuilder('facility')
            .innerJoinAndSelect(`facility.type`, 'role')
            .where('role.id IN (:...roleIds)', { roleIds })
            .orderBy('facility.name', 'ASC')
            .getMany();
    }
}
