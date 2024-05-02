import { PaginationParams, SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { FindOptions } from '@nestjs/schematics';
import { isArray } from 'lodash';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';
import { I18nHelper } from '~core/helpers/i18n.helper';
import { UploadProofService } from '~events/services/upload-proof.service';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { AddFacilityOarIdDto } from '~facilities/http/dto/add-facility-oar-id.dto';
import { GetAndSearchFacilityQuery } from '~facilities/queries/get-and-search-facility.query';
import { GetBusinessPartnersByFacilityIdQuery } from '~facilities/queries/get-business-partner-by-facilityId.query';
import { GetFacilitiesByIdQuery } from '~facilities/queries/get-facilities-by-id.query';
import { GetListOfAllSuppliersQuery } from '~facilities/queries/get-list-of-all-suppliers.query';
import { GetSupplierDetailQuery } from '~facilities/queries/get-supplier-detail.query';
import { SearchExistingFacilitiesQuery } from '~facilities/queries/search-existing-facilities.query';
import { SearchFacilitiesByNameQuery } from '~facilities/queries/search-facilities-by-name.query';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { SearchFacilitiesQueryParamType } from '~facilities/types/search-facilities-query-param.type';
import { SearchingFacilityParamType } from '~facilities/types/searching-facility-param.type';
import { SearchingFacilityQueryParamType } from '~facilities/types/searching-facility-query-param.type';
import { FacilityRiskFilterDto } from '~risk-assessments/http/dto/facility-risk-filter.dto';
import { FacilityRiskService } from '~risk-assessments/services/facility-risk.service';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { BusinessDetailService } from '~site-details/services/business-detail.service';
import { UserEntity } from '~users/entities/user.entity';
import { UpdateUserFacilityDto } from '~users/http/dto/admin/update-user-facility.dto';
import { UserService } from '~users/services/user.service';
import { FacilityRiskFilerService } from './facility-risk-filter.service';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';

@Injectable()
export class FacilityService extends TransactionService {
    constructor(
        private facilityRepo: FacilityRepository,
        private uploadProofService: UploadProofService,
        @Inject(forwardRef(() => UserService)) private userService: UserService,
        private businessDetailService: BusinessDetailService,
        private facilityRiskService: FacilityRiskService,
        private roleService: RoleService,
        private rolePermissionService: RolePermissionService,
        private facilityRiskFilerService: FacilityRiskFilerService
    ) {
        super();
    }

    createOne(data: Partial<FacilityEntity>): Promise<FacilityEntity> {
        return this.facilityRepo.createOne(data);
    }

    findById(id: string, options?: FindOneOptions<FacilityEntity>): Promise<FacilityEntity> {
        return this.facilityRepo.findById(id, options);
    }

    findByIds(ids: string[], options?: FindManyOptions<FacilityEntity>): Promise<FacilityEntity[]> {
        return this.facilityRepo.findByIds(ids, options);
    }

    findByTypes(types: UserRoleEnum[], options?: FindOptions): Promise<FacilityEntity[]> {
        return this.facilityRepo.find({
            where: {
                type: {
                    name: In(types)
                },
                ...options
            }
        });
    }

    findOne(options: FindOneOptions<FacilityEntity>): Promise<FacilityEntity> {
        return this.facilityRepo.findOne(options);
    }

    findFacilityOfUser(user: UserEntity): Promise<FacilityEntity> {
        return this.facilityRepo.findFacilityOfUser(user.id);
    }

    async searchFacilities(
        { key, types = [], isFilledAddress = false, isExcludeAddedPartners = true }: SearchingFacilityParamType,
        requester: UserEntity
    ): Promise<FacilityEntity[]> {
        const searchParam: SearchingFacilityQueryParamType = {
            key,
            types,
            isFilledAddress,
            isExcludeAddedPartners,
            ownerFacility: requester.currentFacility
        };

        return this.facilityRepo.find(new GetAndSearchFacilityQuery(searchParam));
    }

    async updateFacilityInformation(user: UserEntity, facilityData: Partial<FacilityEntity>): Promise<void> {
        if (user.role.type === RoleTypeEnum.ADMINISTRATOR) {
            return;
        }

        const selectedCommodities = await this.businessDetailService.getSelectedCommodities();
        for (const goods of facilityData.goods || []) {
            if (!selectedCommodities.includes(goods)) {
                throw new BadRequestException({
                    translate: 'validation.property_must_be_a_valid_goods_value'
                });
            }
        }

        await this.facilityRepo.updateOrFail({ id: user.currentFacility.id }, facilityData);
        await this.updateRiskDataForFacility(user.currentFacility);
    }

    async updateFacilityByAdmin(userId: string, dto: UpdateUserFacilityDto): Promise<void> {
        const facility = await this.facilityRepo.findFacilityOfUser(userId);
        await this.facilityRepo.update(facility.id, { typeId: dto.roleId });
    }

    checkValidFacilityType(facility: FacilityEntity, types: string[]): void {
        if (!types.includes(facility.typeName)) {
            throw new BadRequestException({ translate: 'error.transact_partner_invalid' });
        }
    }

    async deleteFacilityById(id: string): Promise<void> {
        await this.facilityRepo.softDelete({ id });
    }

    searchExitingFacilities(param: SearchFacilitiesQueryParamType): Promise<FacilityEntity[]> {
        return this.facilityRepo.find(new SearchExistingFacilitiesQuery(param));
    }

    async updateProfileBrand(
        user: UserEntity,
        data: Partial<FacilityEntity>,
        logo?: Express.Multer.File
    ): Promise<void> {
        if (logo) {
            data.logo = (await this.uploadProofService.uploadProofs([logo]))[0]?.blobName;
        }

        await this.facilityRepo.updateOrFail({ id: user.currentFacility.id }, data);
        await this.userService.updateUserInformation(user.id);
    }

    getSupplierById(facility: FacilityEntity, supplierId: string): Promise<FacilityEntity> {
        return this.facilityRepo.findFacilityPartner(facility, supplierId);
    }

    async searchByName(user: UserEntity, key: string): Promise<FacilityEntity[]> {
        const supplierRoleIds = await this.roleService.getSupplierRoleIds();
        return this.facilityRepo.find(new SearchFacilitiesByNameQuery(user.currentFacility.id, supplierRoleIds, key));
    }

    getListSuppliers(
        user: UserEntity,
        paginationParams: PaginationParams,
        sortParams: SortMultipleParams[]
    ): Promise<PaginationCollection<FacilityEntity>> {
        return this.facilityRepo.pagination(
            new GetListOfAllSuppliersQuery(user.currentFacility.id, sortParams),
            paginationParams
        );
    }

    async findInformationSupplierById(supplierId: string, filters: FacilityRiskFilterDto): Promise<FacilityEntity> {
        const facility = await this.facilityRepo.findOne(new GetSupplierDetailQuery(supplierId));

        await this.updateFacilityRiskData(facility);

        I18nHelper.translateFacilityLocation(facility);

        facility.riskData = this.facilityRiskFilerService.filterRiskData(facility.riskData, filters);

        return facility;
    }

    findExistedSupplierFacility(businessName: string, email: string, oarId?: string): Promise<FacilityEntity> {
        return this.facilityRepo.findExistedSupplierFacility(businessName, email, oarId);
    }

    findSupplierFacilityByContactorEmail(businessName: string, email: string): Promise<FacilityEntity> {
        return this.facilityRepo.findSupplierFacilityByContactorEmail(businessName, email);
    }

    findSupplierFacilityByContactorOarId(businessName: string, oarId: string): Promise<FacilityEntity> {
        return this.facilityRepo.findSupplierFacilityByContactorOarId(businessName, oarId);
    }

    async addOarId(user: UserEntity, dto: AddFacilityOarIdDto): Promise<void> {
        await this.facilityRepo.updateOrFail({ id: user.currentFacility.id }, dto);
    }

    findBusinessPartnerByFacilityId(facilityId: string): Promise<FacilityEntity[]> {
        return this.facilityRepo.find(new GetBusinessPartnersByFacilityIdQuery(facilityId));
    }

    async findFacilityWithRelations(facilityId: string): Promise<FacilityEntity> {
        const facilities = await this.facilityRepo.find(new GetFacilitiesByIdQuery([facilityId]));
        return facilities[0];
    }

    async getRequestingFacilityForDna(): Promise<FacilityEntity[]> {
        const roles = await this.rolePermissionService.findRolesByPermission(PermissionEnum.COMPLETE_OWN_PROFILE, [
            RoleTypeEnum.PRODUCT
        ]);
        const roleIds = roles.map(({ id }) => id);
        return this.facilityRepo.findByRoles(roleIds);
    }

    async getProductSupplierForDna(): Promise<FacilityEntity[]> {
        const roles = await this.rolePermissionService.findRolesByPermission(PermissionEnum.ASSIGN_DNA, [
            RoleTypeEnum.PRODUCT
        ]);
        const roleIds = roles.map(({ id }) => id);
        return this.facilityRepo.findByRoles(roleIds);
    }

    async updateRiskDataForFacility(data: FacilityEntity | FacilityEntity[]): Promise<void> {
        if (isArray(data)) {
            await Promise.all(data.map((facility) => this.updateFacilityRiskData(facility)));
        } else {
            await this.updateFacilityRiskData(data);
        }
    }

    private async updateFacilityRiskData(facility: FacilityEntity): Promise<void> {
        const riskData = await this.facilityRiskService.getFacilityRisk(facility);
        facility.riskData = riskData;
        facility.overallRiskScore = riskData.overallRisk.score;
        facility.overallRiskLevel = riskData.overallRisk.level;

        await this.facilityRepo.update(facility.id, {
            riskData,
            overallRiskScore: riskData.overallRisk.score,
            overallRiskLevel: riskData.overallRisk.level
        });
    }
}
