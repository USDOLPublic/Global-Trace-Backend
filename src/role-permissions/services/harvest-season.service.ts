import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { TimeRangeType } from '~events/types/time-range.type';
import { DATE_FORMAT } from '~facilities/constants/farm-group-template.constants';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { SupplyChainService } from '~supply-chains/services/supply-chain.service';

@Injectable()
export class HarvestSeasonService {
    public constructor(private supplyChainService: SupplyChainService) {}

    async getReconciliationWindow(
        facility: FacilityEntity,
        role: RoleEntity,
        timing: Date
    ): Promise<TimeRangeType<Date>> {
        if (role.isRawMaterialExtractor) {
            return this.calculateHarvestSeasonTimeRange(
                moment(role.seasonStartDate, DATE_FORMAT).toDate(),
                role.seasonDuration,
                timing
            );
        }

        if (facility.chainOfCustody === ChainOfCustodyEnum.MASS_BALANCE) {
            return this.calculateReconciliationCycle(
                moment.unix(facility.reconciliationStartAt as number).toDate(),
                facility.reconciliationDuration,
                timing
            );
        }

        const rawMaterialExtractorRole = await this.supplyChainService.getRawMaterialExtractorRole(role.id);
        if (!rawMaterialExtractorRole) {
            return {};
        }
        return this.calculateHarvestSeasonTimeRange(
            moment(rawMaterialExtractorRole.seasonStartDate, DATE_FORMAT).toDate(),
            rawMaterialExtractorRole.seasonDuration,
            timing
        );
    }

    getCurrentReconciliationWindow(facility: FacilityEntity, role: RoleEntity): Promise<TimeRangeType<Date>> {
        const now = moment().toDate();
        return this.getReconciliationWindow(facility, role, now);
    }

    async isBetweenCurrentReconciliationWindow(
        facility: FacilityEntity,
        role: RoleEntity,
        time: Date
    ): Promise<boolean> {
        const timeRange = await this.getCurrentReconciliationWindow(facility, role);
        if (timeRange.from || timeRange.to) {
            return moment(time).isBetween(timeRange.from, timeRange.to);
        }

        if (timeRange.to) {
            return moment(time).isSameOrBefore(timeRange.to);
        }

        if (timeRange.from) {
            return moment(time).isSameOrAfter(timeRange.from);
        }

        return true;
    }

    async getHarvestSeasonOfRawMaterialExtractor(role: RoleEntity, timing: Date) {
        const rawMaterialExtractorRole = await this.supplyChainService.getRawMaterialExtractorRole(role.id);
        if (!rawMaterialExtractorRole) {
            return {};
        }

        return this.calculateHarvestSeasonTimeRange(
            moment(rawMaterialExtractorRole.seasonStartDate, DATE_FORMAT).toDate(),
            rawMaterialExtractorRole.seasonDuration,
            timing
        );
    }

    async getCurrentHarvestSeasonOfRawMaterialExtractor(role: RoleEntity) {
        const now = moment().toDate();
        return this.getHarvestSeasonOfRawMaterialExtractor(role, now);
    }

    private calculateHarvestSeasonTimeRange(startedAt: Date, duration: number, timing: Date): TimeRangeType<Date> {
        let from = startedAt;
        let to = moment(from).add(duration, 'months').toDate();

        while (true) {
            if (moment(timing).isBetween(from, to)) {
                return { from, to };
            }

            if (moment(timing).isBefore(from)) {
                to = from;
                from = moment(to).subtract(duration, 'months').toDate();
            } else {
                from = to;
                to = moment(from).add(duration, 'months').toDate();
            }
        }
    }

    private calculateReconciliationCycle(startedAt: Date, duration: string, timing: Date): TimeRangeType<Date> {
        const arr = duration.split(' ');
        const num = parseInt(arr[0]);
        const unit = arr[1];

        let from = startedAt;
        let to = moment(from)
            .add(num, unit as moment.DurationInputArg2)
            .toDate();

        while (true) {
            if (moment(timing).isBetween(from, to)) {
                return { from, to };
            }

            if (moment(timing).isBefore(from)) {
                to = from;
                from = moment(to)
                    .subtract(num, unit as moment.DurationInputArg2)
                    .toDate();
            } else {
                from = to;
                to = moment(from)
                    .add(num, unit as moment.DurationInputArg2)
                    .toDate();
            }
        }
    }
}
