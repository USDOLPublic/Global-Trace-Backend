import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import moment from 'moment';
import { Not } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { UserEntity } from '~users/entities/user.entity';
import { UserRepository } from '~users/repositories/user.repository';
import { UserInformationType } from '~users/types/user-information.type';
import { RoleEntity } from '~role-permissions/entities/role.entity';

@Injectable()
export class ActorService extends TransactionService {
    public constructor(private userRepo: UserRepository) {
        super();
    }

    private isExistedPhoneNumber(currentUser: UserEntity, phoneNumber: string) {
        return this.userRepo.exists({ id: Not(currentUser.id), phoneNumber });
    }

    async createFacilityContactor(
        requester: UserEntity,
        role: RoleEntity,
        userInformation: UserInformationType,
        facility: FacilityEntity | undefined
    ): Promise<UserEntity> {
        const { email, firstName, lastName, phoneNumber } = userInformation;

        if (phoneNumber && (await this.isExistedPhoneNumber(requester, phoneNumber))) {
            throw new UnprocessableEntityException({ translate: 'error.phone_number_already_used' });
        }

        return this.userRepo.save({
            email,
            firstName,
            lastName,
            phoneNumber,
            role,
            facilities: facility ? [facility] : [],
            permissions: []
        });
    }

    saveUserLastAddedPartnerAt(user: UserEntity) {
        return this.userRepo.update(user.id, {
            addedPartnerAt: moment().toDate()
        });
    }
}
