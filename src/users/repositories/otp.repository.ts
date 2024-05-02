import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { OtpEntity } from '../entities/otp.entity';

@CustomRepository(OtpEntity)
export class OtpRepository extends BaseRepository<OtpEntity> {}
