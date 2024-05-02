import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelfAssessmentQuestionResponseRepository } from '../repositories/self-assessment-question-response.repository';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { FindManyOptions, UpdateResult } from 'typeorm';

@Injectable()
export class SelfAssessmentQuestionResponseService {
    public constructor(
        @InjectRepository(SelfAssessmentQuestionResponseRepository)
        private selfAssessmentQuestionResponseRepo: SelfAssessmentQuestionResponseRepository
    ) {}

    create(
        data: QueryDeepPartialEntity<SelfAssessmentQuestionResponseEntity>
    ): Promise<SelfAssessmentQuestionResponseEntity> {
        return this.selfAssessmentQuestionResponseRepo.createOne(data);
    }

    async update(
        id: string,
        data: QueryDeepPartialEntity<SelfAssessmentQuestionResponseEntity>
    ): Promise<UpdateResult> {
        return this.selfAssessmentQuestionResponseRepo.update(id, data);
    }

    find(
        options: FindManyOptions<SelfAssessmentQuestionResponseEntity>
    ): Promise<SelfAssessmentQuestionResponseEntity[]> {
        return this.selfAssessmentQuestionResponseRepo.find(options);
    }

    saveMany(data: Partial<SelfAssessmentQuestionResponseEntity>[]): Promise<SelfAssessmentQuestionResponseEntity[]> {
        return this.selfAssessmentQuestionResponseRepo.save(data);
    }
}
