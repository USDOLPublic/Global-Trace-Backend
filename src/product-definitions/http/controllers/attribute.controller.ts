import { Id } from '@diginexhk/nestjs-base-decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AttributeService } from '~product-definitions/services/attribute.service';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { AttributeResponse } from '../response/attribute.response';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';

@Controller('attributes')
@ApiTags('Attribute')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
export class AttributeController extends BaseController {
    constructor(private attributeService: AttributeService) {
        super();
    }

    @Get()
    @ApiOperation({ description: 'Get all attributes' })
    @ResponseModel(AttributeResponse, true)
    all() {
        return this.attributeService.all();
    }

    @Get(':id')
    @ApiParam({ name: 'id', description: 'Attribute id', type: 'string' })
    @ApiOperation({ description: 'Get detail of an attribute' })
    @ResponseModel(AttributeResponse)
    show(@Id() id: string) {
        return this.attributeService.findById(id);
    }

    @Post()
    @ApiOperation({ description: 'Create an attribute' })
    @ResponseModel(AttributeResponse)
    @HttpCode(HttpStatus.CREATED)
    @AddRequestToBody()
    create(@Body() dto: CreateAttributeDto) {
        return this.attributeService.create(dto);
    }

    @Put(':id')
    @ApiParam({ name: 'id', description: 'Attribute id', type: 'string' })
    @ApiOperation({ description: 'Update an attribute' })
    @AddRequestToBody()
    update(@Body() dto: CreateAttributeDto, @Id() id: string) {
        return this.attributeService.update(id, dto);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', description: 'Attribute id', type: 'string' })
    @ApiOperation({ description: 'Delete an attribute' })
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Id() id: string) {
        return this.attributeService.delete(id);
    }
}
