import bcrypt from 'bcrypt';
import faker from 'faker';
import { range } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { env } from '~config/env.config';
import { makeAToken } from '~core/helpers/string.helper';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { FacilityPartnerRepository } from '~facilities/repositories/facility-partner.repository';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { LocationTestHelper } from '~locations/tests/location-test.helper';
import { FacilityItemRepository } from '~events/repositories/facility-item.repository';
import { ProductEntity } from '~products/entities/product.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { DEFAULT_PASSWORD } from '~users/constants/default-password.constant';
import { UserEntity } from '~users/entities/user.entity';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import { UserRepository } from '~users/repositories/user.repository';

export class FacilityTestHelper {
    constructor(private testHelper: TestHelper) {}

    async create(user: UserEntity | undefined, facilityType: string | null, options: Partial<FacilityEntity> = {}) {
        const type = await RoleRepository.make().findOneBy({ name: facilityType });

        return FacilityRepository.make().save({
            name: faker.company.companyName(),
            typeId: type.id,
            address: faker.address.streetAddress(),
            districtId: LocationTestHelper.districtId,
            provinceId: LocationTestHelper.provinceId,
            countryId: LocationTestHelper.countryId,
            chainOfCustody: ChainOfCustodyEnum.PRODUCT_SEGREGATION,
            goods: ['Cotton'],
            ...options,
            users: user ? [user] : []
        });
    }

    addPartner(facility: FacilityEntity, partner: FacilityEntity, ownerFacility?: FacilityEntity) {
        return FacilityPartnerRepository.make().save({
            facility,
            partner,
            typeId: partner.typeId,
            creatorId: faker.datatype.uuid(),
            ownerFacility: ownerFacility || facility
        });
    }

    createFacilityItem(facility: FacilityEntity, item: ProductEntity) {
        return FacilityItemRepository.make().save({
            facilityId: facility.id,
            entityId: item.id
        });
    }

    async createUser(options: QueryDeepPartialEntity<UserEntity> = {}, roleName: string = UserRoleEnum.ADMIN) {
        const role = await RoleRepository.make().findOneBy({ name: roleName });

        return UserRepository.make().createOne({
            email: faker.internet.email(),
            firstName: this.testHelper.fakeFirstName(),
            lastName: this.testHelper.fakeLastName(),
            status: UserStatusEnum.ACTIVE,
            role,
            ...options,
            password: bcrypt.hashSync((options.password as string) || DEFAULT_PASSWORD, env.SALT_ROUND)
        });
    }

    async addSupplier(
        brandFacility: FacilityEntity,
        supplierType: string | null,
        options: Partial<FacilityEntity> = {}
    ) {
        let supplier;

        if (supplierType) {
            supplier = await this.createUser({}, supplierType);
        }

        const supplierFacility = await this.create(supplier, supplierType, options);
        await this.addPartner(brandFacility, supplierFacility);

        return supplierFacility;
    }

    generateFarmGroupAreas() {
        return range(3).map(() => ({ latitude: faker.address.latitude(), longitude: faker.address.longitude() }));
    }

    async createFarmGroup(farmGroupOptions: Partial<FacilityEntity> = {}) {
        const farmGroupType = await RoleRepository.make().findOneBy({ name: UserRoleEnum.FARM });

        const farmGroup = await FacilityRepository.make().save({
            name: faker.company.companyName(),
            typeId: farmGroupType.id,
            address: faker.address.streetAddress(),
            districtId: LocationTestHelper.districtId,
            provinceId: LocationTestHelper.provinceId,
            countryId: LocationTestHelper.countryId,
            additionalRole: AdditionalRoleEnum.FARM_GROUP,
            ...farmGroupOptions
        });

        return { ...farmGroup };
    }

    async createFarms(farmGroupId: string, farmSize: number, farmOptions: Partial<FacilityEntity> = {}) {
        const farmType = await RoleRepository.make().findOneBy({ name: UserRoleEnum.FARM });

        const farms = await Promise.all(
            range(farmSize).map(() =>
                FacilityRepository.make().save({
                    farmGroupId,
                    name: faker.company.companyName(),
                    typeId: farmType.id,
                    address: faker.address.streetAddress(),
                    districtId: LocationTestHelper.districtId,
                    provinceId: LocationTestHelper.provinceId,
                    countryId: LocationTestHelper.countryId,
                    farmId: makeAToken(),
                    ...farmOptions
                })
            )
        );

        await Promise.all(
            farms.map((farm, index) =>
                FacilityRepository.make().save({
                    farmId: farm.id,
                    tehsil: faker.address.city(),
                    latitude: faker.address.latitude(),
                    longitude: faker.address.longitude(),
                    firstNameContactor: this.testHelper.fakeFirstName(),
                    lastNameContactor: this.testHelper.fakeLastName(),
                    certification: FarmCertificationEnum.BASF_E3,
                    certificationExpiredDate: Date.now(),
                    farmSize: 10,
                    contactPhoneNumber: this.testHelper.fakePhoneNumber()
                })
            )
        );

        return farms;
    }
}
