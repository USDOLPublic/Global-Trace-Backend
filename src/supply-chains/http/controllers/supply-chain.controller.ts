import { Controller, Get, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupplyChainService } from '../../services/supply-chain.service';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainMapping } from '~supply-chains/types/supply-chain-mapping.type';

@Controller('supply-chain')
@ApiTags('SupplyChain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
export class SupplyChainController extends BaseController {
    constructor(private supplyChainService: SupplyChainService) {
        super();
    }

    @Get()
    @ApiOperation({ description: 'Get list supplyChain' })
    getSupplyChain(): Promise<SupplyChainMapping> {
        return this.supplyChainService.getSupplyChain();
    }
}
