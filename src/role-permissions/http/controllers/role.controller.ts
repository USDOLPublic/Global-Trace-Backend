import { EnumQuery, Id, QueryBoolean, SortMultipleParams, Sorts } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { BaseController } from '~core/http/controllers/base.controller';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { ValidateRoleDto } from '../dto/validate-role.dto';
import { GetAllRolesResponse } from '../response/get-all-roles.response';
import { RoleWithPermissionsResponse } from '../response/role-with-permissions.response';
import { RoleResponse } from '../response/role.response';
import { UserEntity } from '~users/entities/user.entity';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';

@Controller('roles')
@ApiTags('Role')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RoleController extends BaseController {
    constructor(private connection: Connection, private roleService: RoleService) {
        super();
    }

    @Post()
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ResponseModel(RoleWithPermissionsResponse)
    @ApiOperation({ description: 'Create a new role' })
    createRole(@Body() dto: CreateRoleDto): Promise<RoleWithPermissionsResponse> {
        return this.connection.transaction((manager) => this.roleService.withTransaction(manager).createRole(dto));
    }

    @Get('administrator-completes-profile')
    @UseGuards(PermissionGuard(PermissionEnum.USER_MANAGEMENT))
    @ResponseModel(RoleResponse, true)
    @ApiOperation({ description: 'Get roles has permission administrator completes SAQ' })
    getRolesHasPermissionCompletesProfile(): Promise<RoleResponse[]> {
        return this.roleService.getRolesHasPermissionCompletesProfile();
    }

    @Get(':id')
    @ResponseModel(RoleWithPermissionsResponse)
    @ApiOperation({ description: 'Get a role by ID' })
    @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
    getRoleById(@Id() id: string): Promise<RoleWithPermissionsResponse> {
        return this.roleService.getRole(id);
    }

    @Get()
    @ResponseModel(GetAllRolesResponse, true)
    @ApiOperation({ description: 'Get the list of roles' })
    @ApiQuery({ name: 'type', required: false, enum: RoleTypeEnum, type: String })
    @ApiQuery({
        name: 'key',
        description: 'Search by name',
        type: String,
        required: false,
        schema: {
            maxLength: 255
        }
    })
    getAllRoles(
        @CurrentUser() user: UserEntity,
        @Sorts({
            allowedFields: ['name', 'type', 'lastUpdate'],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sort: SortMultipleParams[],
        @QueryBoolean('canInvite') canInvite: boolean,
        @EnumQuery({ enum: RoleTypeEnum, key: 'type', nullable: true }) type?: RoleTypeEnum,
        @Query('key') key?: string
    ): Promise<GetAllRolesResponse[]> {
        return this.roleService.getAllRoles(user, sort, canInvite, type, key);
    }

    @Put(':id')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Update a role' })
    @AddRequestToBody()
    @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
    @HttpCode(HttpStatus.NO_CONTENT)
    updateRole(@Id() id: string, @Body() dto: UpdateRoleDto) {
        return this.connection.transaction((manager) => this.roleService.withTransaction(manager).updateRole(id, dto));
    }

    @Delete(':id')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Delete a role' })
    @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteRole(@Id() id: string) {
        return this.roleService.deleteRole(id);
    }

    @Post('validate-roles')
    @UseGuards(RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Validate a role' })
    @HttpCode(HttpStatus.OK)
    async validateRole(@Body() dto: ValidateRoleDto): Promise<void> {
        await this.roleService.validateRole(dto);
    }
}
