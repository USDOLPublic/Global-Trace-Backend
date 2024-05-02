import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DEFAULT_DATE_FORMAT_REGEX } from '~core/constants/default-date-format-regex.constant';
import { CustomMatch } from '~core/decorators/custom-match.decorator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

export class RoleResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsEnum(RoleTypeEnum)
    type: RoleTypeEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isRawMaterialExtractor: boolean | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(ChainOfCustodyEnum)
    chainOfCustody: ChainOfCustodyEnum | null;

    @ApiPropertyOptional({ example: '31/07/2023' })
    @IsOptional()
    @CustomMatch('startDateOfSeason', DEFAULT_DATE_FORMAT_REGEX, {
        message: '$property_invalid_date_format_of_DD/MM/YYYY'
    })
    seasonStartDate: Date | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    seasonDuration: number | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    uploadedSAQ: boolean | null;
}
