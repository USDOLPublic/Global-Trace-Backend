import { ApiProperty } from '@nestjs/swagger';
import faker from 'faker';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export class ImportSelfAssessmentFileDto {
    @ApiProperty({ type: 'string', format: 'binary', required: true })
    fileSaq: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    fileFacilityGroupTemplate?: string;

    @ApiProperty({ example: faker.datatype.uuid(), required: true })
    @IsUUID()
    @IsNotEmpty()
    @Exists(RoleEntity, 'id', false, [], {
        message: 'invalid_role_id'
    })
    roleId: string;
}
