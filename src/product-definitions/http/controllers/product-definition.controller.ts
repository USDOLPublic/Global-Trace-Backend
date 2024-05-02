import { Id, Sort, SortParams } from '@diginexhk/nestjs-base-decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '~users/http/guards/role.guard';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { ProductDefinitionService } from '~product-definitions/services/product-definition.service';
import { CreateProductDefinitionDto } from '../dto/create-product-definition.dto';
import { ProductDefinitionResponse } from '../response/product-definition.response';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Connection, EntityManager } from 'typeorm';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { UserEntity } from '~users/entities/user.entity';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';

@Controller('product-definitions')
@ApiTags('Product Definition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProductDefinitionController extends BaseController {
    constructor(private connection: Connection, private productDefinitionService: ProductDefinitionService) {
        super();
    }

    @Get('purchased-product-definitions')
    @ApiOperation({ description: 'Get purchased product definition of user' })
    @ResponseModel(ProductDefinitionResponse, false, true)
    getPurchasedProductDefinition(@CurrentUser() user: UserEntity) {
        return this.productDefinitionService.getPurchasedProductDefinition(user);
    }

    @Get('sold-product-definitions')
    @ApiOperation({ description: 'Get sold product definition of user' })
    @ResponseModel(ProductDefinitionResponse, false, true)
    getSoldProductDefinition(@CurrentUser() user: UserEntity) {
        return this.productDefinitionService.getSoldProductDefinition(user);
    }

    @Get()
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Get all product definitions' })
    @ResponseModel(ProductDefinitionResponse, true)
    all(
        @Sort({
            allowedFields: ['name', 'updatedAt'],
            default: { sortField: 'updatedAt', sortDirection: 'DESC' }
        })
        sort: SortParams
    ): Promise<ProductDefinitionEntity[]> {
        return this.productDefinitionService.all(sort);
    }

    @Get(':id')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
    @ApiOperation({ description: 'Get detail of product definition' })
    @ResponseModel(ProductDefinitionResponse)
    show(@Id() id: string) {
        return this.productDefinitionService.findById(id);
    }

    @Post()
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Create a product definition' })
    @ResponseModel(ProductDefinitionResponse)
    @HttpCode(HttpStatus.CREATED)
    @AddRequestToBody()
    create(@Body() dto: CreateProductDefinitionDto) {
        return this.connection.transaction((manager: EntityManager) =>
            this.productDefinitionService.withTransaction(manager).create(dto)
        );
    }

    @Put(':id')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
    @ApiOperation({ description: 'Update a product definition' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @AddRequestToBody()
    update(@Body() dto: CreateProductDefinitionDto, @Id() id: string) {
        return this.connection.transaction((manager: EntityManager) =>
            this.productDefinitionService.withTransaction(manager).update(id, dto)
        );
    }

    @Delete(':id')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
    @ApiOperation({ description: 'Destroy a product definition' })
    @HttpCode(HttpStatus.NO_CONTENT)
    destroy(@Id() id: string) {
        return this.productDefinitionService.destroy(id);
    }
}
