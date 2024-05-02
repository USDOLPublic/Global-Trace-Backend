import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { ReasonEnum } from '~grievance-report/enums/reason.enum';
import { UserEntity } from '~users/entities/user.entity';
import { ValidateIfOrExclude } from '~core/http/validators/validate-if-or-exclude.validator';
import { LaborRiskDto } from './labor-risk.dto';
import { Type } from 'class-transformer';

export class EditGrievanceReportDto {
    @ApiProperty({ type: LaborRiskDto, isArray: true })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LaborRiskDto)
    laborRisks: LaborRiskDto[];

    @ApiProperty()
    @IsNotEmpty()
    @ValidateIfOrExclude((obj) => obj.isNoFollowUp === false)
    @IsUUID('4')
    @Exists(UserEntity, 'id')
    assigneeId: string;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @IsNotEmpty()
    isNoFollowUp: boolean;

    @ApiProperty({ enum: ReasonEnum })
    @ValidateIfOrExclude((obj) => obj.isNoFollowUp === false)
    @IsEnum(ReasonEnum)
    @IsNotEmpty()
    reason: ReasonEnum;
}
