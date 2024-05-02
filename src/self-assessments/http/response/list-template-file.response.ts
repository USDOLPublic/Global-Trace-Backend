import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { TemplateFileStatusEnum } from '~self-assessments/enums/template-file-status.enum';
import { FileResponse } from './file.response';
import { Type } from 'class-transformer';

export class TranslationStatusResponse {
    @ApiProperty({ enum: TemplateFileStatusEnum })
    @IsNotEmpty()
    @IsEnum(TemplateFileStatusEnum)
    saqStatus: TemplateFileStatusEnum;

    @ApiProperty({ enum: TemplateFileStatusEnum })
    @IsNotEmpty()
    @IsEnum(TemplateFileStatusEnum)
    saqTranslationStatus: TemplateFileStatusEnum;
}
export class ListTemplateFileResponse {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: () => TranslationStatusResponse, required: false })
    @Type(() => TranslationStatusResponse)
    @IsOptional()
    @ValidateNested()
    status: TranslationStatusResponse | null;

    @ApiProperty({ type: () => FileResponse, required: false })
    @Type(() => FileResponse)
    @IsOptional()
    @ValidateNested()
    fileSaq: FileResponse | null;

    @ApiProperty({ type: () => FileResponse, required: false })
    @Type(() => FileResponse)
    @IsOptional()
    @ValidateNested()
    fileFacilityGroupTemplate: FileResponse | null;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    hasFacilityGroupTemplate: boolean;

    @ApiProperty({ type: () => FileResponse, required: false })
    @Type(() => FileResponse)
    @IsOptional()
    @ValidateNested()
    fileSaqTranslation: FileResponse | null;
}
