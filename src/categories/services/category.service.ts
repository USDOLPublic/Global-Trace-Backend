import { Injectable } from '@nestjs/common';
import { CategoryEntity } from '~categories/entities/category.entity';
import { CategoryFilterDto } from '~categories/http/dto/category-filter.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { ILike } from 'typeorm';
import { DNA_RISK_INDICATOR, DNA_RISK_SUB_INDICATOR } from '~risk-assessments/constants/dna-risk.constant';

@Injectable()
export class CategoryService {
    public constructor(private categoryRepo: CategoryRepository) {}

    all(filter: CategoryFilterDto): Promise<CategoryEntity[]> {
        return this.categoryRepo.find({ where: filter, order: { name: 'ASC' } });
    }

    findOneBy(options: FindOptionsWhere<CategoryEntity>): Promise<CategoryEntity> {
        return this.categoryRepo.findOneBy(options);
    }

    findByIds(ids: string[]): Promise<CategoryEntity[]> {
        return this.categoryRepo.findByIds(ids);
    }

    async update(id: string, data: Partial<CategoryEntity>): Promise<void> {
        await this.categoryRepo.update(id, data);
    }

    async updateBy(options: FindOptionsWhere<CategoryEntity>, data: Partial<CategoryEntity>): Promise<void> {
        await this.categoryRepo.update(options, data);
    }

    createOne(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
        return this.categoryRepo.createOne(data);
    }

    getDnaRiskIndicator(): Promise<{ indicator: CategoryEntity; subIndicator: CategoryEntity }> {
        return this.getComboIndicatorAndSubIndicator(DNA_RISK_INDICATOR, DNA_RISK_SUB_INDICATOR);
    }

    async getComboIndicatorAndSubIndicator(
        indicatorName: string,
        subIndicatorName: string
    ): Promise<{ indicator: CategoryEntity; subIndicator: CategoryEntity }> {
        const indicator = await this.categoryRepo.findOne({
            where: {
                name: ILike(indicatorName),
                type: CategoryTypeEnum.INDICATOR
            },
            relations: ['category']
        });
        let subIndicator: CategoryEntity;

        if (indicator) {
            subIndicator = await this.categoryRepo.findOneBy({
                name: ILike(subIndicatorName),
                type: CategoryTypeEnum.SUB_INDICATOR,
                parentId: indicator.id
            });
        }
        return { indicator, subIndicator };
    }
}
