import { ValidateException } from '@diginexhk/nestjs-exception';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { InviteBrokerPartnerDto } from '~business-partners/http/dto/invite-broker-partner.dto';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerService } from '~facilities/services/facility-partner.service';
import { FacilityService } from '~facilities/services/facility.service';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { ActorService } from '~users/services/actor.service';
import { UserService } from '~users/services/user.service';
import { FacilityPartnerCreatedResultType } from '~users/types/facility-partner-created-result.type';

@Injectable()
export class BrokerPartnerService extends TransactionService {
    public constructor(
        private facilityService: FacilityService,
        private actorService: ActorService,
        private userService: UserService,
        private roleService: RoleService,
        private supplyChainService: SupplyChainService,
        private facilityPartnerService: FacilityPartnerService
    ) {
        super();
    }

    async searchBrokerFacilities(user: UserEntity, key: string): Promise<FacilityEntity[]> {
        const roleEntity = await this.roleService.findRoleByName(UserRoleEnum.BROKER);
        return this.facilityService.searchExitingFacilities({
            partnerRoleIds: [roleEntity.id],
            ownerFacility: user.currentFacility,
            key,
            isExcludeAddedPartners: true
        });
    }

    async searchBrokerPartners(user: UserEntity, key: string): Promise<FacilityEntity[]> {
        const partnerRoleIds = await this.supplyChainService.getPartnerRoleIds(user.roleId);
        return this.facilityService.searchExitingFacilities({
            partnerRoleIds,
            ownerFacility: user.currentFacility,
            key,
            isExcludeAddedPartners: false
        });
    }

    async inviteBrokerPartner(requester: UserEntity, dto: InviteBrokerPartnerDto) {
        await this.checkInviteBrokerPartner(requester, dto);
        this.checkValidateUniqueEmailAndPhoneNumber(dto);

        const { facilityPartner: broker, contactor } = await this.createBrokerFacility(requester, dto);

        await this.facilityPartnerService.addFacilityPartner({
            ownerFacility: requester.currentFacility,
            baseFacility: requester.currentFacility,
            facilityPartner: broker,
            creatorId: requester.id
        });

        await this.addBrokerPartners(requester, dto, broker);

        await this.actorService.saveUserLastAddedPartnerAt(requester);

        return contactor;
    }

    private async addBrokerPartners(
        requester: UserEntity,
        dto: InviteBrokerPartnerDto,
        brokerFacility: FacilityEntity
    ) {
        if (!dto.partners?.length) {
            return;
        }

        const result = await Promise.all(
            dto.partners.map(async (partner) => {
                let facility: FacilityEntity;
                let contactor: UserEntity;
                let isAddNew = false;

                if (partner.facilityId) {
                    facility = await this.facilityService.findById(partner.facilityId, {
                        relations: ['users', 'users.role', 'users.permissions', 'type']
                    });
                    contactor = facility.users[0];
                } else {
                    isAddNew = true;
                    const role = await this.roleService.findRoleById(partner.partnerInformation.roleId);
                    facility = await this.facilityService.createOne({
                        ...partner.partnerInformation,
                        typeId: partner.partnerInformation.roleId,
                        chainOfCustody: role.chainOfCustody
                    });
                    contactor = await this.actorService.createFacilityContactor(
                        requester,
                        role,
                        partner.userInformation,
                        facility
                    );
                }

                await this.facilityPartnerService.addFacilityPartner({
                    ownerFacility: brokerFacility,
                    baseFacility: brokerFacility,
                    facilityPartner: facility,
                    creatorId: requester.id
                });
                return { facility, contactor, isAddNew };
            })
        );

        const newItems = result.filter((item) => item.isAddNew);
        await Promise.all(newItems.map(({ contactor }) => this.userService.sendInvitationMail(requester, contactor)));
    }

    private async createBrokerFacility(
        requester: UserEntity,
        dto: InviteBrokerPartnerDto
    ): Promise<FacilityPartnerCreatedResultType> {
        const { facilityId, userInformation, brokerInformation } = dto;

        let broker: FacilityEntity | undefined;
        let contactor: UserEntity | undefined;

        if (facilityId) {
            broker = await this.facilityService.findById(facilityId, {
                relations: ['users', 'users.role', 'users.permissions', 'type']
            });
            contactor = broker.users[0];
        } else {
            const roleEntity = await this.roleService.findRoleByName(UserRoleEnum.BROKER);

            broker = await this.facilityService.createOne({
                ...brokerInformation,
                typeId: roleEntity.id,
                chainOfCustody: roleEntity.chainOfCustody
            });
            contactor = await this.actorService.createFacilityContactor(requester, roleEntity, userInformation, broker);
        }

        return { facilityPartner: broker, contactor };
    }

    private async checkInviteBrokerPartner(requester: UserEntity, dto: InviteBrokerPartnerDto): Promise<void> {
        const allowedPartnerRoleIds = await this.supplyChainService.getPartnerRoleIds(requester.roleId);

        let canInvite = false;
        if (dto.facilityId) {
            const broker = await this.facilityService.findById(dto.facilityId, { relations: ['type'] });
            if (broker.typeName !== UserRoleEnum.BROKER) {
                throw new BadRequestException({ translate: 'validation.can_not_invite_this_role' });
            }

            canInvite = await this.canInviteExistingBroker(broker, allowedPartnerRoleIds, dto);
        } else if (dto.partners?.length) {
            canInvite = await this.hasAllValidAddingPartner(dto, allowedPartnerRoleIds);
        }

        if (!canInvite) {
            throw new BadRequestException({ translate: 'validation.can_not_invite_this_role' });
        }
    }

    private async canInviteExistingBroker(
        broker: FacilityEntity,
        allowedPartnerRoleIds: string[],
        dto: InviteBrokerPartnerDto
    ): Promise<boolean> {
        if (dto.partners?.length) {
            return this.hasAllValidAddingPartner(dto, allowedPartnerRoleIds);
        }

        const validPartners = await this.facilityPartnerService.getFacilityPartnersByTypeIds(
            broker,
            allowedPartnerRoleIds
        );
        return validPartners.length > 0;
    }

    private async hasAllValidAddingPartner(
        dto: InviteBrokerPartnerDto,
        allowedPartnerRoleIds: string[]
    ): Promise<boolean> {
        const existingPartnerIds = (dto.partners || [])
            .filter((partner) => partner.facilityId)
            .map(({ facilityId }) => facilityId);
        if (existingPartnerIds.length) {
            const facilities = await this.facilityService.findByIds(existingPartnerIds, { relations: ['type'] });

            const partnerRoleIds = facilities.map((facility) => facility.typeId);
            const canInvite = await this.hasAllValidRoleId(partnerRoleIds, allowedPartnerRoleIds);
            if (!canInvite) {
                return false;
            }
        }

        const newPartnerRoleIds = dto.partners
            .filter((partner) => !partner.facilityId)
            .map((facility) => facility.partnerInformation.roleId);
        return this.hasAllValidRoleId(newPartnerRoleIds, allowedPartnerRoleIds);
    }

    private hasAllValidRoleId(partnerRoleIds: string[], allowedPartnerRoleIds: string[]): boolean {
        for (const partnerRoleId of partnerRoleIds) {
            if (!allowedPartnerRoleIds.includes(partnerRoleId)) {
                return false;
            }
        }
        return true;
    }

    private checkValidateUniqueEmailAndPhoneNumber(dto: InviteBrokerPartnerDto) {
        if (isEmpty(dto.partners)) {
            return;
        }
        for (const partner of dto.partners) {
            if (dto.facilityId || partner.facilityId) {
                continue;
            }

            if (dto.userInformation.email === partner.userInformation.email) {
                throw new ValidateException([
                    {
                        property: 'email',
                        constraints: {
                            invalidField: {
                                message: 'The Email of broker is duplicated with the brokers partner.',
                                detail: {}
                            } as any
                        }
                    }
                ]);
            }

            if (
                dto.userInformation.phoneNumber &&
                dto.userInformation.phoneNumber === partner.userInformation.phoneNumber
            ) {
                throw new ValidateException([
                    {
                        property: 'phoneNumber',
                        constraints: {
                            invalidField: {
                                message: 'The phone number of broker is duplicated with the brokers partner.',
                                detail: {}
                            } as any
                        }
                    }
                ]);
            }
        }
    }
}
