import { BadRequestException, Injectable } from '@nestjs/common';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { LaborRiskRepository } from '~grievance-report/repositories/labor-risk.repository';
import { LaborRiskDto } from '~grievance-report/http/dto/labor-risk.dto';
import { LaborRiskEntity } from '~grievance-report/entities/labor-risk.entity';
import { GrievanceReportResponseEntity } from '~grievance-report/entities/grievance-report-response.entity';
import { In } from 'typeorm';

@Injectable()
export class LaborRiskService {
    constructor(private laborRiskRepo: LaborRiskRepository) {}

    async createReportRisk(
        entity: GrievanceReportEntity | GrievanceReportResponseEntity,
        laborRisks: LaborRiskDto[],
        creatorId?: string
    ): Promise<void> {
        this.checkDuplicateReportRisk(laborRisks);

        const data: Partial<LaborRiskEntity>[] = laborRisks.map(({ indicatorId, subIndicatorId, severity }) => ({
            indicatorId,
            creatorId,
            subIndicatorId,
            severity,
            entityId: entity.id,
            entityType: entity.constructor.name
        }));

        await this.laborRiskRepo.insert(data);
    }

    private checkDuplicateReportRisk(laborRisks: LaborRiskDto[]): void {
        const isDuplicate = laborRisks.some(({ indicatorId, subIndicatorId }) => {
            const items = laborRisks.filter(
                (laborRisk) => indicatorId === laborRisk.indicatorId && subIndicatorId === laborRisk.subIndicatorId
            );
            return items.length > 1;
        });

        if (isDuplicate) {
            throw new BadRequestException({ translate: 'validation.duplicate_labor_risk' });
        }
    }

    async updateReportRisk(
        grievanceReport: GrievanceReportEntity,
        laborRisks: LaborRiskDto[],
        creatorId: string
    ): Promise<void> {
        const existedLaborRisks = await this.laborRiskRepo.find({
            where: { entityType: grievanceReport.constructor.name, entityId: grievanceReport.id }
        });

        await this.deleteLaborRisks(existedLaborRisks, laborRisks);
        this.checkDuplicateReportRisk(laborRisks);
        const preparedLaborRisks = this.prepareLaborRisks(grievanceReport, existedLaborRisks, laborRisks, creatorId);

        await this.laborRiskRepo.insert(preparedLaborRisks);
    }

    private prepareLaborRisks(
        grievanceReport: GrievanceReportEntity,
        existedLaborRisks: LaborRiskEntity[],
        laborRisks: LaborRiskDto[],
        creatorId: string
    ): Partial<LaborRiskEntity>[] {
        return laborRisks.reduce((acc, laborRisk) => {
            const haveExistedLaborRisks = existedLaborRisks.filter(
                (existedLaborRisk) =>
                    laborRisk.indicatorId === existedLaborRisk.indicatorId &&
                    laborRisk.subIndicatorId === existedLaborRisk.subIndicatorId &&
                    laborRisk.severity === existedLaborRisk.severity
            );

            if (!haveExistedLaborRisks.length) {
                acc.push({
                    ...laborRisk,
                    entityId: grievanceReport.id,
                    entityType: grievanceReport.constructor.name,
                    creatorId
                });
            }

            return acc;
        }, []);
    }

    private async deleteLaborRisks(existedLaborRisks: LaborRiskEntity[], laborRisks: LaborRiskDto[]): Promise<void> {
        const laborRiskIdsMustDelete = this.getLaborRiskIdsMustDelete(existedLaborRisks, laborRisks);
        await this.laborRiskRepo.delete({ id: In(laborRiskIdsMustDelete) });
    }

    private getLaborRiskIdsMustDelete(existedLaborRisks: LaborRiskEntity[], laborRisks: LaborRiskDto[]): string[] {
        return existedLaborRisks.reduce((acc: string[], existedLaborRisk) => {
            const isDeleteLaborRisk = !laborRisks.some(
                (laborRisk) =>
                    laborRisk.indicatorId === existedLaborRisk.indicatorId &&
                    laborRisk.subIndicatorId === existedLaborRisk.subIndicatorId &&
                    laborRisk.severity === existedLaborRisk.severity
            );

            if (isDeleteLaborRisk) {
                acc.push(existedLaborRisk.id);
            }

            return acc;
        }, []);
    }
}
