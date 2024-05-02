import { StorageService } from '@diginexhk/nestjs-storage';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { FileUploadType } from '~core/types/file-upload.type';
import Commodities from '~site-details/constants/goods.json';
import { BusinessDetailEntity } from '~site-details/entities/business-detail.entity';
import { UpdateBusinessDetailDto } from '~site-details/http/dto/update-business-detail.dto';
import { BusinessDetailRepository } from '../repositories/business-detail.repository';

@Injectable()
export class BusinessDetailService extends TransactionService {
    public constructor(private businessDetailRepo: BusinessDetailRepository, private storageService: StorageService) {
        super();
    }

    async getBusinessDetail(): Promise<BusinessDetailEntity> {
        const businessDetail = await this.businessDetailRepo.findOne({ where: {} });

        if (!businessDetail) {
            return this.businessDetailRepo.createOne({ sector: 'Cotton' });
        }

        return businessDetail;
    }

    async updateBusinessDetail(dto: UpdateBusinessDetailDto, logo?: Express.Multer.File): Promise<void> {
        const data: Partial<BusinessDetailEntity> = {
            name: dto.name,
            countryIds: dto.countryIds,
            commodities: dto.commodities
        };

        if (logo) {
            const { blobName } = await this.storageService.uploadFile({ file: logo });
            data.logo = {
                fileName: logo.originalname,
                blobName: blobName
            };
        }

        const businessDetail = await this.getBusinessDetail();
        if (!businessDetail) {
            await this.businessDetailRepo.createOne(data);
        } else {
            await this.businessDetailRepo.update(businessDetail.id, data);
        }
    }

    getCommodities() {
        return Commodities;
    }

    async getSelectedCommodities(): Promise<string[]> {
        const businessDetail = await this.getBusinessDetail();
        return businessDetail.commodities;
    }

    async completeConfiguringSystem(): Promise<void> {
        const businessDetail = await this.getBusinessDetail();

        if (businessDetail.completedConfiguringSystemAt) {
            throw new BadRequestException({ translate: 'validation.system_configuration_already_completed' });
        }

        await this.businessDetailRepo.update(
            { id: businessDetail.id },
            { completedConfiguringSystemAt: moment().unix() }
        );
    }

    async getAppLogo(): Promise<FileUploadType> {
        const businessDetail = await this.getBusinessDetail();

        return businessDetail.logo;
    }
}
