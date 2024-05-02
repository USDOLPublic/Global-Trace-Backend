import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelfAssessmentUploadFileRepository } from '../repositories/self-assessment-upload-file.repository';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SelfAssessmentUploadFileEntity } from '~self-assessments/entities/self-assessment-upload-file.entity';
import { DeleteResult, FindOneOptions, FindOptionsWhere } from 'typeorm';

@Injectable()
export class SelfAssessmentUploadFileService {
    public constructor(
        @InjectRepository(SelfAssessmentUploadFileRepository)
        private selfAssessmentUploadFileRepo: SelfAssessmentUploadFileRepository
    ) {}

    create(data: QueryDeepPartialEntity<SelfAssessmentUploadFileEntity>): Promise<SelfAssessmentUploadFileEntity> {
        return this.selfAssessmentUploadFileRepo.createOne(data);
    }

    delete(options: FindOptionsWhere<SelfAssessmentUploadFileEntity>): Promise<DeleteResult> {
        return this.selfAssessmentUploadFileRepo.delete(options);
    }

    findOne(options: FindOneOptions<SelfAssessmentUploadFileEntity>): Promise<SelfAssessmentUploadFileEntity> {
        return this.selfAssessmentUploadFileRepo.findOne(options);
    }
}
