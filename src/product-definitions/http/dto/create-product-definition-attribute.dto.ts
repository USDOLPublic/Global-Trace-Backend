import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';

export class CreateProductDefinitionAttributeDto {
    @ApiProperty()
    @IsUUID('4')
    @Exists(AttributeEntity, 'id')
    id: string;

    @ApiPropertyOptional({ type: Boolean, example: false })
    @IsOptional()
    @IsBoolean()
    isOptional?: boolean;

    @ApiPropertyOptional({ type: Boolean, example: false })
    @IsOptional()
    @IsBoolean()
    isAddManuallyOnly?: boolean;
}
