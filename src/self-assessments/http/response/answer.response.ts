import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuestionResponse } from './question.response';
import { Type } from 'class-transformer';

export class AnswerResponse {
    @ApiProperty()
    @IsOptional()
    @IsString()
    value?: string;

    @ApiPropertyOptional({ type: QuestionResponse })
    @Type(() => QuestionResponse)
    @IsNotEmpty()
    @ValidateNested()
    questionResponse: QuestionResponse;
}
