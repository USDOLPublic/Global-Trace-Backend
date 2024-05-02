import { Injectable } from '@nestjs/common';
import { FarmLevelRiskExcelData } from '~facilities/types/facility-groups/xlsx-farm-level-risk-data.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { omit } from 'lodash';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { LocationService } from '~locations/services/location.service';
import { InstructionExcelType } from '~facilities/types/facility-groups/instruction-excel.type';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { ImportFacilityGroupDto } from '~facilities/http/dto/import-facility-group.dto';
import { convertDateToTimestamp } from '~core/helpers/time.helper';

@Injectable()
export class FacilityOperationService {
    constructor(private locationService: LocationService) {}

    async getDataFacility(dto: ImportFacilityGroupDto, data: InstructionExcelType): Promise<Partial<FacilityEntity>> {
        const country = await this.locationService.findCountry({ country: data.country });
        const province = await this.locationService.findProvince({ province: data.province, countryId: country.id });
        const district = await this.locationService.findDistrict({ district: data.district, provinceId: province.id });

        return {
            typeId: dto.roleId,
            name: data.farmGroupName,
            districtId: district.id,
            provinceId: province.id,
            countryId: country.id,
            additionalRole: AdditionalRoleEnum.FARM_GROUP,
            facilityGroupFileId: dto.fileId,
            farmId: data.farmGroupId,
            additionalInformation: { areas: data.areas }
        };
    }

    async mapDataFarmItems(
        dataArray: FarmLevelRiskExcelData[],
        facility: FacilityEntity
    ): Promise<Partial<FacilityEntity>[]> {
        const chunkSize = 20;
        const farms = [];

        for (let i = 0; i < dataArray.length; i += chunkSize) {
            const chunkData = dataArray.slice(i, i + chunkSize);
            const farmItems: Partial<FacilityEntity>[] = await Promise.all(
                chunkData.map((data: FarmLevelRiskExcelData) => this.prepareFarmItem(facility, data))
            );

            farms.push(...farmItems);
        }
        return farms;
    }

    private async prepareFarmItem(
        facility: FacilityEntity,
        data: FarmLevelRiskExcelData
    ): Promise<Partial<FacilityEntity>> {
        const {
            id,
            certification,
            farmName,
            businessRegisterNumber,
            certificationExpiredDate,
            tehsil,
            firstNameContactor,
            lastNameContactor,
            contactPhoneNumber
        } = data;

        return omit(
            {
                farmGroupId: facility.id,
                name: farmName,
                businessRegisterNumber,
                typeId: facility.typeId,
                countryId: facility.countryId,
                provinceId: facility.provinceId,
                districtId: facility.districtId,
                certification: (certification ? certification : null) as FarmCertificationEnum,
                facilityGroupFileId: facility.facilityGroupFileId,
                farmId: `${facility.farmId}-${id}`,
                certificationExpiredDate: certificationExpiredDate
                    ? convertDateToTimestamp(certificationExpiredDate)
                    : null,
                additionalInformation: {
                    tehsil,
                    firstNameContactor,
                    lastNameContactor,
                    contactPhoneNumber
                }
            },
            id ? [] : ['id']
        );
    }
}
