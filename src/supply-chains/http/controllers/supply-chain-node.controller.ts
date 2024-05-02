import { Id } from '@diginexhk/nestjs-base-decorator';
import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SupplyChainService } from '../../services/supply-chain.service';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { AddSupplyChainNodeDto } from '../dto/add-supply-chain-node.dto';
import { UpdateSupplyChainNodeDto } from '../dto/update-supply-chain-node.dto';
import { AddRequestToBody } from '~core/decorators/add-request-to-body.decorator';
import { SupplyChainNodeMapping } from '~supply-chains/types/supply-chain-node-mapping.type';

@Controller('supply-chain-nodes')
@ApiTags('SupplyChain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
export class SupplyChainNodeController extends BaseController {
    constructor(private supplyChainService: SupplyChainService) {
        super();
    }

    @Post()
    @ApiOperation({
        description: 'Add a node'
    })
    @HttpCode(HttpStatus.CREATED)
    addSupplyChainNode(@Body() dto: AddSupplyChainNodeDto): Promise<SupplyChainNodeMapping> {
        return this.supplyChainService.addSupplyChainNode(dto);
    }

    @Put(':id')
    @ApiParam({ name: 'id', description: 'Supply chain node ID', type: 'string' })
    @ApiOperation({ description: 'Update a node in supply chain' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @AddRequestToBody()
    updateSupplyChainNode(@Body() dto: UpdateSupplyChainNodeDto, @Id() id: string) {
        return this.supplyChainService.updateSupplyChainNode(id, dto);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', description: 'Supply chain node ID', type: 'string' })
    @ApiOperation({ description: 'Delete a node in supply chain' })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteSupplyChainNode(@Id() id: string) {
        return this.supplyChainService.deleteSupplyChainNode(id);
    }
}
