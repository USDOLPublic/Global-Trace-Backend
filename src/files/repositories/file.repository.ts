import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { FileEntity } from '../entities/file.entity';

@CustomRepository(FileEntity)
export class FileRepository extends BaseRepository<FileEntity> {}
