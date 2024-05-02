import { Injectable } from '@nestjs/common';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GeographicalRiskLevelRepository } from '~self-assessments/repositories/geographical-risk-level.repository';

@Injectable()
export class GeographicalRiskLevelService {
    public constructor(private geographicalRiskLevelRepo: GeographicalRiskLevelRepository) {}

    async getCountryRiskScore(facility: FacilityEntity): Promise<number> {
        if (facility.countryId) {
            const geographicalRisk = await this.geographicalRiskLevelRepo.findOne({
                where: { countryId: facility.countryId }
            });
            return geographicalRisk?.risk;
        }
    }
}
