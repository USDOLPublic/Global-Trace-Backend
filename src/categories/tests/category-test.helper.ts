import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { CategoryEntity } from '~categories/entities/category.entity';
import { CategoryRepository } from '~categories/repositories/category.repository';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';

export class CategoryTestHelper {
    constructor(private testHelper: TestHelper) {}

    createIndicator(options: Partial<CategoryEntity> = {}): Promise<CategoryEntity> {
        return this.createCategory(CategoryTypeEnum.INDICATOR, options);
    }

    createSubIndicator(options: Partial<CategoryEntity> = {}): Promise<CategoryEntity> {
        return this.createCategory(CategoryTypeEnum.SUB_INDICATOR, options);
    }

    private createCategory(type: CategoryTypeEnum, options: Partial<CategoryEntity>): Promise<CategoryEntity> {
        return CategoryRepository.make().createOne({
            name: faker.random.words(5),
            ...options,
            type
        });
    }
}
