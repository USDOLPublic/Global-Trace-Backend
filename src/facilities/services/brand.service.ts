import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { map, pick } from 'lodash';
import { Not } from 'typeorm';
import { TemplateInterface } from '~export-templates/interfaces/template.interface';
import { FacilityPartnerEntity } from '~facilities/entities/facility-partner.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { AddSupplierDto } from '~facilities/http/dto/add-supplier.dto';
import { EditSupplierDto } from '~facilities/http/dto/edit-supplier.dto';
import { FacilityPartnerRepository } from '~facilities/repositories/facility-partner.repository';
import { CreateSupplierContactorType } from '~facilities/types/create-suppplier-contactor.type';
import { CreateSupplierFacilityType } from '~facilities/types/create-suppplier-facility.type';
import { ExtractSupplierDataType } from '~facilities/types/extract-supplier-data.type';
import { FileService } from '~files/services/file.service';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { RoleService } from '~role-permissions/services/role.service';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';
import { UserEntity } from '~users/entities/user.entity';
import { UserService } from '~users/services/user.service';
import { FacilityPartnerService } from './facility-partner.service';
import { FacilityService } from './facility.service';

@Injectable()
export class BrandService extends TransactionService {
    constructor(
        private facilityPartnerRepo: FacilityPartnerRepository,
        private facilityService: FacilityService,
        private roleRepo: RoleRepository,
        private roleService: RoleService,
        private userService: UserService,
        private fileService: FileService,
        private supplyChainService: SupplyChainService,
        private facilityPartnerService: FacilityPartnerService
    ) {
        super();
    }

    private async canAddFacilitySupplier(typeId: string) {
        const listRoles = await this.getSupplierRoles();
        if (!listRoles.some(({ id }) => id === typeId)) {
            throw new BadRequestException({ translate: 'validation.can_not_add_this_supplier' });
        }
    }

    async createFacilityContactor(
        requester: UserEntity,
        { email, firstName, lastName, roleId }: CreateSupplierContactorType,
        facility: FacilityEntity
    ): Promise<UserEntity> {
        return this.userService.createOne({
            email,
            firstName,
            lastName,
            roleId,
            facilities: [facility],
            permissions: []
        });
    }

    async createSupplier(
        requester: UserEntity,
        facilityData: CreateSupplierFacilityType,
        contactorData: CreateSupplierContactorType
    ): Promise<FacilityEntity> {
        let supplier: FacilityEntity;

        if (facilityData.facilityId) {
            supplier = await this.facilityService.findById(facilityData.facilityId, {
                relations: ['users', 'users.role', 'users.permissions', 'type']
            });
            await this.canAddFacilitySupplier(supplier.type.id);
        } else {
            const type = await this.roleRepo.findOneOrFail({
                where: { id: facilityData.typeId, type: RoleTypeEnum.PRODUCT }
            });
            await this.canAddFacilitySupplier(type.id);

            const { name, businessRegisterNumber, oarId } = facilityData;
            supplier = await this.facilityService.createOne({
                name,
                businessRegisterNumber,
                oarId,
                typeId: type.id,
                chainOfCustody: type.chainOfCustody
            });

            const contactor = await this.createFacilityContactor(
                requester,
                { ...contactorData, roleId: type.id },
                supplier
            );
            const canLogin = await this.roleService.canRoleLogin(type);

            if (canLogin) {
                await this.userService.sendInvitationMail(requester, contactor);
            }

            supplier.type = type;
        }

        return supplier;
    }

    private async removeFacilityPartnerRelationships(ownerFacilityId: string, supplierId: string) {
        return Promise.all([
            this.facilityPartnerRepo.delete({
                ownerFacilityId,
                facilityId: supplierId
            }),
            this.facilityPartnerRepo.delete({
                ownerFacilityId,
                facilityId: Not(ownerFacilityId),
                partnerId: supplierId
            })
        ]);
    }

    async editSupplierById(
        requester: UserEntity,
        supplierId: string,
        supplierData: EditSupplierDto
    ): Promise<FacilityEntity> {
        const supplier = await this.facilityService.getSupplierById(requester.currentFacility, supplierId);

        let {
            facilityData: { name, businessRegisterNumber, oarId, typeId },
            contactorData
        } = this.extractFacilityAndSupplierData(supplierData);
        await this.canAddFacilitySupplier(typeId);

        Object.assign(supplier, { name, businessRegisterNumber, oarId, typeId });
        delete supplier.type;
        await supplier.save();

        if (contactorData.email) {
            await this.userService.validateUniqueEmail(supplier.users[0].id, contactorData.email);
        }

        const role = await this.roleRepo.findById(typeId);
        await this.userService.update(supplier.users[0].id, { role });

        if (!supplierData.businessPartnerIds) {
            return;
        }

        await this.removeFacilityPartnerRelationships(requester.currentFacility.id, supplierId);

        if (!supplierData.businessPartnerIds?.length) {
            return;
        }

        const businessPartners = await Promise.all(
            supplierData.businessPartnerIds.map((facilityId) => this.facilityService.findById(facilityId))
        );
        await this.checkValidBusinessPartner(requester, supplier, businessPartners);
        await this.addBusinessPartnersForSupplier(requester, supplier, businessPartners);
    }

    private async checkValidBusinessPartner(
        requester: UserEntity,
        supplier: FacilityEntity,
        businessPartners: FacilityEntity[]
    ): Promise<void> {
        const roleIds = await this.supplyChainService.getPartnerRoleIds(supplier.typeId);
        const isInvalidPartners = businessPartners.some(({ typeId }) => !roleIds.includes(typeId));

        const supplierIdsOfCurrentUser = map(
            await this.facilityPartnerRepo.findBy({
                ownerFacilityId: requester.currentFacility.id,
                facilityId: requester.currentFacility.id
            }),
            'partnerId'
        );
        const isNotSupplierOfRequester = businessPartners.some(({ id }) => !supplierIdsOfCurrentUser.includes(id));

        if (isInvalidPartners || isNotSupplierOfRequester) {
            throw new UnprocessableEntityException({ translate: 'validation.invalid_business_partner_type' });
        }
    }

    private addBusinessPartnersForSupplier(
        requester: UserEntity,
        supplier: FacilityEntity,
        businessPartners: FacilityEntity[]
    ): Promise<FacilityPartnerEntity[]> {
        return Promise.all(
            businessPartners.map((businessPartner) =>
                this.facilityPartnerService.addFacilityPartner({
                    baseFacility: supplier,
                    facilityPartner: businessPartner,
                    creatorId: requester.id,
                    ownerFacility: requester.currentFacility,
                    isBrandSupplierPartner: true
                })
            )
        );
    }

    private addPartnerForCurrentUser(requester: UserEntity, supplier: FacilityEntity): Promise<FacilityPartnerEntity> {
        return this.facilityPartnerService.addFacilityPartner({
            ownerFacility: requester.currentFacility,
            baseFacility: requester.currentFacility,
            facilityPartner: supplier,
            creatorId: requester.id
        });
    }

    private extractFacilityAndSupplierData(data: AddSupplierDto | EditSupplierDto): ExtractSupplierDataType {
        const facilityData = pick(data, ['facilityId', 'name', 'typeId', 'businessRegisterNumber', 'oarId']);
        const contactorData = pick(data, ['email', 'firstName', 'lastName']);

        return { facilityData, contactorData };
    }

    private extractFacilityAndSupplierDataFromTemplate(data: TemplateInterface<string>): ExtractSupplierDataType {
        const facilityData = {
            ...pick(data, ['facilityId', 'businessRegisterNumber', 'oarId', 'typeId']),
            name: data.businessName
        };
        const contactorData = pick(data, ['email', 'firstName', 'lastName']);

        return { facilityData, contactorData };
    }

    async addSupplier(requester: UserEntity, data: AddSupplierDto): Promise<FacilityEntity> {
        const { facilityData, contactorData } = this.extractFacilityAndSupplierData(data);
        const supplier = await this.createSupplier(requester, facilityData, contactorData);

        await this.addPartnerForCurrentUser(requester, supplier);
        const businessPartners = await Promise.all(
            data.businessPartnerIds.map((facilityId) => this.facilityService.findById(facilityId))
        );
        await this.checkValidBusinessPartner(requester, supplier, businessPartners);
        await this.addBusinessPartnersForSupplier(requester, supplier, businessPartners);

        return supplier;
    }

    async deleteSupplier(requester: UserEntity, supplierId: string) {
        await this.facilityPartnerRepo.deleteSupplierByBrand(requester.currentFacility.id, supplierId);
    }

    async listAndSearchSupplierBusinessPartners(
        requester: UserEntity,
        roleId: string,
        key?: string
    ): Promise<FacilityEntity[]> {
        const roleIds = await this.supplyChainService.getPartnerRoleIds(roleId);
        if (!roleIds.length) {
            return [];
        }

        return this.facilityPartnerService.getAndSearchSupplierBusinessPartners({ requester, key, roleIds });
    }

    async importSuppliersByTemplate(fileId: string, requester: UserEntity) {
        const { worksheet } = await this.fileService.readFileById(fileId);

        const suppliers = this.fileService.extractFileData(worksheet, true) as TemplateInterface<string>[];
        const mappedRoles = await this.roleService.getRolesAndMapByNames(suppliers.map(({ type }) => type));
        const supplierFacilities: FacilityEntity[] = [];

        for (const supplier of suppliers) {
            let supplierFacility = await this.facilityService.findExistedSupplierFacility(
                supplier.businessName,
                supplier.email,
                supplier.oarId
            );
            supplier.typeId = mappedRoles[supplier.type]?.id;

            if (!supplierFacility) {
                const { facilityData, contactorData } = this.extractFacilityAndSupplierDataFromTemplate(supplier);
                supplierFacility = await this.createSupplier(requester, facilityData, contactorData);
            }
            await this.addPartnerForCurrentUser(requester, supplierFacility);

            supplierFacilities.push(supplierFacility);
        }

        return supplierFacilities;
    }

    getSupplierRoles(canInviteOnly: boolean = false): Promise<RoleEntity[]> {
        return this.roleService.getSupplierRoles(canInviteOnly);
    }
}
