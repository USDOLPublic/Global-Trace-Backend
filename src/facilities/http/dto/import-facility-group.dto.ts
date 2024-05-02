import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Exists } from '~core/http/validators/exists.validator';
import { FileEntity } from '~files/entities/file.entity';
import faker from 'faker';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export class ImportFacilityGroupDto {
    @ApiProperty()
    @IsUUID('4')
    @Exists(FileEntity, 'id')
    fileId: string;

    @ApiProperty({ example: faker.datatype.uuid(), required: true })
    @IsUUID()
    @IsNotEmpty()
    @Exists(RoleEntity, 'id', false, [], {
        message: 'invalid_role_id'
    })
    roleId: string;
}
