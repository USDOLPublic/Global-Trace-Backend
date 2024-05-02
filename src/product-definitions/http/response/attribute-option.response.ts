import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { I18nField } from '~self-assessments/types/i18n-field.type';

export class AttributeOptionResponse {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    value: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsObject()
    translation: I18nField;
}
