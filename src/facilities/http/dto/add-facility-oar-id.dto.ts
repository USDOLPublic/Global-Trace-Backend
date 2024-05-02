import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RequestDto } from '~core/http/dto/request.dto';
import { Unique } from '~core/http/validators/unique.validator';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class AddFacilityOarIdDto extends RequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Unique(
        FacilityEntity,
        'oarId',
        false,
        [{ column: 'id', exclude: true, value: (obj: AddFacilityOarIdDto) => obj.requestDto.user.currentFacility.id }],
        { message: 'duplicated_oar_id' }
    )
    oarId: string;
}
