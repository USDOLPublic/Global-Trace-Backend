import { ResponseModel } from '@diginexhk/nestjs-response';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseController } from '~core/http/controllers/base.controller';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { PermissionService } from '~role-permissions/services/permission.service';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { PermissionWithSubPermissionsResponse } from '../response/permission-with-sub-permissions.response';

@Controller('permissions')
@ApiTags('Permission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
export class PermissionController extends BaseController {
    constructor(private permissionService: PermissionService) {
        super();
    }

    @Get()
    @ResponseModel(PermissionWithSubPermissionsResponse, true)
    @ApiOperation({ description: 'Get the all permissions' })
    @ApiQuery({
        name: 'roleType',
        description: 'Search by role type',
        enum: RoleTypeEnum,
        required: false,
        schema: {
            maxLength: 255
        }
    })
    getAllPermissions(@Query('roleType') roleType?: string): Promise<PermissionWithSubPermissionsResponse[]> {
        return this.permissionService.getAllPermissions(roleType);
    }
}
