import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../../services/category.service';
import { CategoryFilterDto } from '../dto/category-filter.dto';
import { CategoryEntity } from '~categories/entities/category.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { CategoryResponse } from '../response/category.response';

@Controller('categories')
@ApiTags('Category')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CategoryController extends BaseController {
    constructor(private categoryService: CategoryService) {
        super();
    }

    @Get('all')
    @ResponseModel(CategoryResponse, true)
    @ApiOperation({ description: 'Get all categories' })
    all(@Query() query: CategoryFilterDto): Promise<CategoryEntity[]> {
        return this.categoryService.all(query);
    }
}
