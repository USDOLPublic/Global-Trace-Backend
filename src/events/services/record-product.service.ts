import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import moment from 'moment';
import { CONVERSION_RATIO_LBS_TO_KG } from '~events/constants/convert-weight.constant';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { convertToKg } from '~events/helpers/convert-to-kg.helper';
import { RecordProductDto } from '~events/http/dto/record-product.dto';
import { RecordProductRepository } from '~events/repositories/record-product.repository';
import { UploadProofService } from '~events/services/upload-proof.service';
import { HistoryService } from '~history/services/history.service';
import { HarvestSeasonService } from '~role-permissions/services/harvest-season.service';
import { UserEntity } from '~users/entities/user.entity';
import { ProductActivityService } from './product-activity.service';

@Injectable()
export class RecordProductService extends TransactionService {
    constructor(
        private recordProductRepo: RecordProductRepository,
        private uploadProofService: UploadProofService,
        @Inject(forwardRef(() => HistoryService)) private historyService: HistoryService,
        private harvestSeasonService: HarvestSeasonService,
        private productActivityService: ProductActivityService
    ) {
        super();
    }

    async createRecordByProduct(user: UserEntity, data: RecordProductDto, uploadProofs: Array<Express.Multer.File>) {
        await this.checkStockInHand(user, data);
        const record = await this.recordProductRepo.createOne({
            totalWeight: data.totalWeight,
            weightUnit: data.weightUnit,
            facilityId: user.currentFacility.id,
            recordedAt: data.recordedAt,
            uploadProofs: await this.uploadProofService.uploadProofs(uploadProofs)
        });

        await this.historyService.createRecordProductEvent(record);

        return record;
    }

    getRecordProductsByIds(ids: string[]) {
        return this.recordProductRepo.findByIds(ids);
    }

    private async checkStockInHand(user: UserEntity, data: RecordProductDto) {
        const timeRange = await this.harvestSeasonService.getReconciliationWindow(
            user.currentFacility,
            user.role,
            moment.unix(data.recordedAt).toDate()
        );

        const totalPurchases = await this.productActivityService.getTotalPurchases(user.currentFacility, timeRange);
        const totalByProducts = await this.productActivityService.getTotalByProducts(user.currentFacility, timeRange);
        const totalOutputs = await this.productActivityService.getTotalOutputs(user.currentFacility, timeRange);

        const totalWeightInput = convertToKg(data.totalWeight, data.weightUnit);

        if (totalPurchases < totalOutputs + totalByProducts + totalWeightInput) {
            if (Math.floor(totalPurchases - totalOutputs - totalByProducts) <= 0) {
                throw new BadRequestException({
                    translate: 'validation.register_all_purchases_to_record_by_product'
                });
            }

            let unit = WeightUnitEnum.KG;
            let maxQuantity = totalPurchases - totalOutputs - totalByProducts;
            if (data.weightUnit === WeightUnitEnum.LBS) {
                unit = WeightUnitEnum.LBS;
                maxQuantity = maxQuantity / CONVERSION_RATIO_LBS_TO_KG;
            }
            throw new BadRequestException({
                translate: 'validation.product_weight_must_be_lower_or_equal_total_purchase_weight',
                args: { property: Math.floor(maxQuantity), unit }
            });
        }
    }
}
