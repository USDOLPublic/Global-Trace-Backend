import { PaginationParams } from '@diginexhk/nestjs-base-decorator';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DeleteResult, FindOneOptions, In } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GetListFarmGroupQuery } from '~facilities/queries/get-list-farm-group.query';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { LOCATION_RELATIONS } from '~locations/constants/location-relations.constant';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleService } from '~role-permissions/services/role.service';

@Injectable()
export class FacilityGroupService extends TransactionService {
    constructor(private facilityRepo: FacilityRepository, private roleService: RoleService) {
        super();
    }

    async getListFacilityGroup(
        roleId: string,
        paginationParams: PaginationParams
    ): Promise<PaginationCollection<FacilityEntity>> {
        await this.validRoleCompleteProfile(roleId);

        return this.facilityRepo.pagination(new GetListFarmGroupQuery(roleId), paginationParams);
    }

    getFacilityGroupById(id: string): Promise<FacilityEntity> {
        return this.facilityRepo.findOneOrFail({
            where: { id },
            relations: ['farms', 'selfAssessment', 'facilityGroupFile', 'farms.selfAssessment', ...LOCATION_RELATIONS]
        });
    }

    async deleteFacilityGroup(id: string): Promise<DeleteResult> {
        const facilityChildGroups = await this.facilityRepo.find({ where: { farmGroupId: id } });
        if (facilityChildGroups.length) {
            const facilityChildGroupIds = facilityChildGroups.map(({ id }) => id);
            await this.facilityRepo.softDeleteOrFail({ id: In(facilityChildGroupIds) });
        }
        return this.facilityRepo.softDeleteOrFail({ id });
    }

    async validRoleCompleteProfile(roleId: string): Promise<void> {
        const hasPermission = await this.roleService.checkRoleHasPermission(
            PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE,
            roleId
        );
        if (!hasPermission) {
            throw new BadRequestException({ translate: 'error.role_id_invalid' });
        }
    }

    findOne(options: FindOneOptions<FacilityEntity>): Promise<FacilityEntity> {
        return this.facilityRepo.findOne(options);
    }
}
