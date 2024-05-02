import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';

export class ManualAddedAttributeDto {
    @ApiProperty()
    @IsUUID('4')
    @Exists(AttributeEntity, 'id')
    id: string;

    @ApiProperty({
        oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'date' },
            { type: 'uuid' },
            {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            {
                type: 'array',
                items: {
                    type: 'number'
                }
            }
        ]
    })
    @IsOptional()
    value: any;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    quantityUnit?: string;
}
