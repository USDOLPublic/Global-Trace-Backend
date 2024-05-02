import { Module } from '@nestjs/common';
import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import { CategoryController } from './http/controllers/category.controller';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryEntity } from './entities/category.entity';
import { CategoryService } from './services/category.service';

@Module({
    providers: [CategoryService],
    controllers: [CategoryController],
    imports: [TypeOrmHelperModule.forCustomRepository([CategoryEntity, CategoryRepository])],
    exports: [CategoryService]
})
export class CategoryModule {}
