import { Exists } from '@diginexhk/nestjs-base-decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import faker from 'faker';
import { UploadFileDto } from '~files/http/dto/upload-file.dto';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export class UploadSelfAssessmentTranslationsDto extends UploadFileDto {
    @ApiProperty({ example: faker.datatype.uuid(), required: true })
    @IsUUID()
    @IsNotEmpty()
    @Exists(RoleEntity, 'id', false, [], {
        message: 'invalid_role_id'
    })
    roleId: string;
}
