import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class RiskAssessmentPropertiesResponse {
    @ApiProperty()
    @IsBoolean()
    hasDNA: boolean;

    @ApiProperty()
    @IsBoolean()
    hasSAQ: boolean;

    @ApiProperty()
    @IsBoolean()
    hasHotline: boolean;
}
