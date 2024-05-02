import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { CategoryService } from '~categories/services/category.service';
import { StatusDnaTestingEnum } from '~dna-testing/enums/status-dna-testing.enum';
import { DnaTestingRepository } from '~dna-testing/repositories/dna-testing.repository';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';
import { RiskSourceEnum } from '~risk-assessments/enums/risk-source.enum';
import { RiskItemType } from '~risk-assessments/types/risk-item.type';

@Injectable()
export class DnaRiskService {
    constructor(private dnaTestingRepo: DnaTestingRepository, private categoryService: CategoryService) {}

    async getDnaRiskItems(facilityIds: string[]): Promise<RiskItemType[]> {
        const { indicator, subIndicator } = await this.categoryService.getDnaRiskIndicator();
        if (!indicator || !subIndicator) {
            return [];
        }

        const tests = await this.dnaTestingRepo.findBy({ productSupplierId: In(facilityIds) });
        return tests.map(({ status, createdAt }) => ({
            indicator,
            subIndicator,
            severity: status === StatusDnaTestingEnum.PASSED ? SeverityEnum.LOW : SeverityEnum.HIGH,
            source: RiskSourceEnum.DNA_TEST_RESULTS,
            createdAt
        }));
    }
}
