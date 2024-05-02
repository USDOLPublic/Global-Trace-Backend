import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { FACILITY_RISK_CALCULATION } from '~facilities/constants/queue.constant';

@Injectable()
export class FacilityQueueService {
    constructor(@InjectQueue(FACILITY_RISK_CALCULATION) private facilityRiskCalculationQueue: Queue) {}

    async addFacilityRiskCalculation(facilityId: string) {
        await this.facilityRiskCalculationQueue.add({ facilityId });
    }
}
