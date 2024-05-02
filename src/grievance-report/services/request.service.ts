import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Injectable } from '@nestjs/common';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { CreateCommunityRiskScanReportDto } from '~grievance-report/http/dto/create-community-risk-scan-report.dto';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { UserEntity } from '~users/entities/user.entity';
import { LaborRiskService } from './labor-risk.service';

@Injectable()
export class RequestService extends TransactionService {
    constructor(private grievanceReportRepo: GrievanceReportRepository, private laborRiskService: LaborRiskService) {
        super();
    }

    async createReport(user: UserEntity, dto: CreateCommunityRiskScanReportDto): Promise<GrievanceReportEntity> {
        const report = await this.grievanceReportRepo.createOne({
            ...dto,
            creatorId: user.id,
            latestActivityAt: null
        });

        await this.laborRiskService.createReportRisk(report, dto.laborRisks, user.id);

        return report;
    }
}
