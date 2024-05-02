import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { BaseEntityResponse } from '~core/http/response/base-entity.response';
import { AnswerResponse } from './answer.response';
import { Type } from 'class-transformer';

export class SelfAssessmentAnswerResponse extends BaseEntityResponse {
    @ApiProperty()
    @IsUUID()
    selfAssessmentId: string;

    @ApiProperty()
    @IsUUID()
    groupId: string;

    @ApiProperty()
    @IsUUID()
    selfAssessmentQuestionId: string;

    @ApiProperty()
    @IsBoolean()
    isDraft: boolean;

    @ApiPropertyOptional({
        type: Number,
        example: 1662704035
    })
    @IsOptional()
    @IsInt()
    deletedAt: number | Date | null;

    @ApiProperty({ type: AnswerResponse, isArray: true })
    @Type(() => AnswerResponse)
    @IsArray()
    @ValidateNested({ each: true })
    answers: AnswerResponse[];
}
