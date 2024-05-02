import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import faker from 'faker';
import { Exists } from '~core/http/validators/exists.validator';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export class FacilityInformationDto {
    @ApiProperty({ example: faker.datatype.uuid() })
    @IsNotEmpty()
    @IsUUID()
    @Exists(RoleEntity, 'id')
    roleId: string;

    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;
}
