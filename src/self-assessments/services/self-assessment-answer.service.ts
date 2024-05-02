import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentAnswerRepository } from '../repositories/self-assessment-answer.repository';

@Injectable()
export class SelfAssessmentAnswerService extends TransactionService {
    constructor(private selfAssessmentAnswerRepo: SelfAssessmentAnswerRepository) {
        super();
    }

    getBySelfAssessment(selfAssessmentId: string) {
        return this.selfAssessmentAnswerRepo.listUniqueAnswers(selfAssessmentId);
    }

    async removeBySelfAssessmentId(selfAssessmentId: string): Promise<void> {
        await this.selfAssessmentAnswerRepo.delete({ selfAssessmentId });
    }

    async removeAnswersBySelfAssessment(selfAssessmentIds: string[]) {
        await this.selfAssessmentAnswerRepo.delete({ selfAssessmentId: In(selfAssessmentIds) });
    }

    listCompleteAnswersUniqueByQuestion(selfAssessmentId: string): Promise<SelfAssessmentAnswerEntity[]> {
        return this.selfAssessmentAnswerRepo.listCompleteAnswersUniqueByQuestion(selfAssessmentId);
    }

    createMany(data: Partial<SelfAssessmentAnswerEntity>[]): Promise<SelfAssessmentAnswerEntity[]> {
        return this.selfAssessmentAnswerRepo.save(data);
    }
}
