import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InviteTransporterPartnerDto } from '~business-partners/http/dto/invite-transporter-partner.dto';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerService } from '~facilities/services/facility-partner.service';
import { FacilityService } from '~facilities/services/facility.service';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { UserEntity } from '~users/entities/user.entity';
import { ActorService } from '~users/services/actor.service';
import { FacilityPartnerCreatedResultType } from '~users/types/facility-partner-created-result.type';

@Injectable()
export class TransporterPartnerService extends TransactionService {
    public constructor(
        private facilityService: FacilityService,
        private actorService: ActorService,
        private roleService: RoleService,
        private facilityPartnerService: FacilityPartnerService
    ) {
        super();
    }

    async inviteTransporterPartner(requester: UserEntity, data: InviteTransporterPartnerDto): Promise<UserEntity> {
        const { facilityPartner, contactor } = await this.createTransporterFacility(requester, data);
        await this.facilityPartnerService.addFacilityPartner({
            ownerFacility: requester.currentFacility,
            baseFacility: requester.currentFacility,
            facilityPartner,
            creatorId: requester.id
        });
        await this.actorService.saveUserLastAddedPartnerAt(requester);

        return contactor;
    }

    async searchExitingTransporters(user: UserEntity, key: string): Promise<FacilityEntity[]> {
        const roleEntity = await this.roleService.findRoleByName(UserRoleEnum.TRANSPORTER);
        return this.facilityService.searchExitingFacilities({
            partnerRoleIds: [roleEntity.id],
            ownerFacility: user.currentFacility,
            key,
            isExcludeAddedPartners: true
        });
    }

    private async createTransporterFacility(
        requester: UserEntity,
        dto: InviteTransporterPartnerDto
    ): Promise<FacilityPartnerCreatedResultType> {
        const { facilityId, userInformation, transporterInformation } = dto;

        let facilityPartner: FacilityEntity | undefined;
        let contactor: UserEntity | undefined;

        if (facilityId) {
            facilityPartner = await this.facilityService.findById(facilityId, {
                relations: ['users', 'users.role', 'users.permissions', 'type']
            });
            this.checkRoleTransporter(facilityPartner.type.name);
            contactor = facilityPartner.users[0];
        } else {
            const roleEntity = await this.roleService.findRoleByName(UserRoleEnum.TRANSPORTER);

            facilityPartner = await this.facilityService.createOne({
                ...transporterInformation,
                typeId: roleEntity.id
            });
            contactor = await this.actorService.createFacilityContactor(
                requester,
                roleEntity,
                userInformation,
                facilityPartner
            );
        }

        return { facilityPartner, contactor };
    }

    private checkRoleTransporter(roleName: string) {
        if (roleName !== UserRoleEnum.TRANSPORTER) {
            throw new BadRequestException({ translate: 'validation.can_not_invite_this_role' });
        }
    }
}
