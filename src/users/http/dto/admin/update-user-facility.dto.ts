import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import faker from 'faker';
import { Exists } from '~core/http/validators/exists.validator';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export class UpdateUserFacilityDto {
    @ApiProperty({ example: faker.datatype.uuid() })
    @IsUUID()
    @Exists(RoleEntity, 'id', false, [], {
        message: 'invalid_role_id'
    })
    roleId: string;
}
