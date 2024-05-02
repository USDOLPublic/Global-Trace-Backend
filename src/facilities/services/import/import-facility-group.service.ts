import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Injectable } from '@nestjs/common';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ImportFacilityGroupDto } from '~facilities/http/dto/import-facility-group.dto';
import { UpdateImportFacilityGroupDto } from '~facilities/http/dto/update-import-facility-group.dto';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { FacilityOperationService } from '~facilities/services/facility-operation.service';
import { FacilityGroupExcelService } from '~facilities/services/import/facility-group-excel.service';
import { ValidExcelQuestionData } from '~facilities/types/facility-groups/valid-excel-question-data.type';
import { FarmLevelRiskExcelData } from '~facilities/types/facility-groups/xlsx-farm-level-risk-data.type';
import { FileService } from '~files/services/file.service';
import { SelfAssessmentGroupService } from '~self-assessments/services/self-assessment-group.service';
import { SelfAssessmentService } from '~self-assessments/services/self-assessment.service';
import { FacilityGroupService } from '../facility-group.service';
import { FacilityImportDataService } from '../facility-import-data.service';
import { FacilityQueueService } from '../facility-queue.service';

@Injectable()
export class ImportFacilityGroupService extends TransactionService {
    constructor(
        private fileService: FileService,
        private facilityGroupExcelService: FacilityGroupExcelService,
        private facilityRepo: FacilityRepository,
        private facilityOperationService: FacilityOperationService,
        private facilityGroupService: FacilityGroupService,
        private facilityImportDataService: FacilityImportDataService,
        private selfAssessmentGroupService: SelfAssessmentGroupService,
        private selfAssessmentService: SelfAssessmentService,
        private facilityQueueService: FacilityQueueService
    ) {
        super();
    }

    async importFacilityGroup(dto: ImportFacilityGroupDto): Promise<void> {
        const groups = await this.selfAssessmentGroupService.getSelfAssessmentGroupByRoleId(dto.roleId);
        const fileStream = await this.fileService.getFileById(dto.fileId);
        let { instruction, communityRisk, farmLevelRisk } = await this.facilityGroupExcelService.parseXlsx({
            file: fileStream,
            groups
        });
        farmLevelRisk = (farmLevelRisk as FarmLevelRiskExcelData[]).filter(({ isBlankRow }) => !isBlankRow);

        const data = await this.facilityOperationService.getDataFacility(dto, instruction);
        const facility = await this.facilityRepo.createOne(data);

        const facilityChild = await this.createChildrenFacilities(facility, farmLevelRisk);

        await this.selfAssessmentService.createSelfAssessmentFarmGroupAndFarms(
            facility.id,
            facilityChild.map((farm: FacilityEntity, index: number) => ({
                farmId: farm.id,
                selfAssessments: { ...farmLevelRisk[index].selfAssessments, ...communityRisk } as ValidExcelQuestionData
            })),
            dto.roleId
        );

        await this.updateRiskDataForFacilityGroup(facility, facilityChild);
    }

    async updateFacilityGroup(id: string, dto: UpdateImportFacilityGroupDto): Promise<void> {
        const { roleId, fileId } = dto;
        const [groups, facilityGroup, fileStream] = await Promise.all([
            this.selfAssessmentGroupService.getSelfAssessmentGroupByRoleId(roleId),
            this.facilityGroupService.getFacilityGroupById(id),
            this.fileService.getFileById(fileId)
        ]);
        let { instruction, communityRisk, farmLevelRisk } = await this.facilityGroupExcelService.parseXlsx({
            file: fileStream,
            groups,
            isParsingForUpdate: true
        });
        const data = await this.facilityOperationService.getDataFacility(dto, instruction);
        const selfAssessmentIds = facilityGroup.farms.map(({ selfAssessment }) => selfAssessment.id);
        await Promise.all([
            this.facilityRepo.update(id, data),
            this.selfAssessmentService.deleteAnswerBySelfAssessment(selfAssessmentIds)
        ]);

        const facilityChild = await this.facilityImportDataService.updateFarms(
            data.farmId,
            facilityGroup,
            farmLevelRisk as FarmLevelRiskExcelData[]
        );
        await this.selfAssessmentService.createSelfAssessmentFarmGroupAndFarms(
            facilityGroup.id,
            facilityChild.map((farm: FacilityEntity, index: number) => ({
                farmId: farm.id,
                selfAssessments: { ...farmLevelRisk[index].selfAssessments, ...communityRisk } as ValidExcelQuestionData
            })),
            dto.roleId
        );
        await this.updateRiskDataForFacilityGroup(facilityGroup, facilityChild);
    }

    private async updateRiskDataForFacilityGroup(
        facilityGroup: FacilityEntity,
        facilities: FacilityEntity[]
    ): Promise<void> {
        await Promise.all(
            [facilityGroup, ...facilities].map(({ id }) => this.facilityQueueService.addFacilityRiskCalculation(id))
        );
    }

    async createChildrenFacilities(
        facility: FacilityEntity,
        farmLevelRisk: FarmLevelRiskExcelData[]
    ): Promise<FacilityEntity[]> {
        const farmItems = await this.facilityOperationService.mapDataFarmItems(farmLevelRisk, facility);
        return this.facilityRepo.save(farmItems);
    }
}
