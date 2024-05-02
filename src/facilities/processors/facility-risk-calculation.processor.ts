import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueError,
    OnQueueFailed,
    OnQueueWaiting,
    Process,
    Processor
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { FACILITY_RISK_CALCULATION } from '~facilities/constants/queue.constant';
import { FacilityService } from '~facilities/services/facility.service';
import { GetSupplierDetailQuery } from '~facilities/queries/get-supplier-detail.query';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { loadRelations } from '@diginexhk/typeorm-helper';
import { LOCATION_RELATIONS } from '~locations/constants/location-relations.constant';

@Processor(FACILITY_RISK_CALCULATION)
export class FacilityRiskCalculationProcessor {
    private logger = new Logger(this.constructor.name);

    constructor(private facilityService: FacilityService, private facilityRepo: FacilityRepository) {}

    @Process()
    async handle(job: Job<{ facilityId: string }>) {
        const facility = await this.facilityRepo.findOne(new GetSupplierDetailQuery(job.data.facilityId));
        await this.facilityService.updateRiskDataForFacility(facility);

        if (facility.additionalRole === AdditionalRoleEnum.FARM_GROUP) {
            await facility.loadRelation('farms');
            await loadRelations(facility.farms, LOCATION_RELATIONS);
            await this.facilityService.updateRiskDataForFacility(facility.farms);
        }

        if (facility.farmGroupId) {
            const facilityGroup = await this.facilityRepo.findOne(new GetSupplierDetailQuery(facility.farmGroupId));
            await this.facilityService.updateRiskDataForFacility(facilityGroup);
        }
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.debug(`Processing trigger queue job ${job.id}.`);
    }

    @OnQueueCompleted()
    onComplete(job: Job) {
        this.logger.debug(`Completed trigger queue job ${job.id}.`);
    }

    @OnQueueFailed()
    onError(job: Job, error: any) {
        this.logger.error(`Failed trigger queue job ${job.id}: ${error.message}`, error.stack);
    }

    @OnQueueError()
    onA(error: Error) {
        this.logger.error(`Failed trigger queue job`, error.stack);
    }

    @OnQueueWaiting()
    onWaiting(jobId: number | string) {
        this.logger.debug(`Completed trigger queue job ${jobId}.`);
    }
}
