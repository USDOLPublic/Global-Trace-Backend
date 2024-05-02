import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { Unique } from '~core/http/validators/unique.validator';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { SupplyChainNodeEntity } from '~supply-chains/entities/supply-chain-node.entity';
import { PositionDto } from './position.dto';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

export class AddSupplyChainNodeDto {
    @ApiProperty()
    @IsUUID('4')
    @Exists(RoleEntity, 'id', false, [{ column: 'type', exclude: false, value: RoleTypeEnum.PRODUCT }])
    @Unique(SupplyChainNodeEntity, 'roleId')
    roleId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID('4')
    @Exists(RoleEntity, 'id', false, [{ column: 'type', exclude: false, value: RoleTypeEnum.PRODUCT }])
    @Exists(SupplyChainNodeEntity, 'roleId')
    fromRoleId?: string;

    @ApiProperty()
    @IsUUID('4')
    @Exists(ProductDefinitionEntity, 'id')
    outputProductDefinitionId: string;

    @ApiProperty({ type: PositionDto })
    @IsObject()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => PositionDto)
    position: PositionDto;
}
