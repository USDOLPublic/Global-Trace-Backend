import Joi from 'joi';
import { SaqAnswerSchemaObject } from '~self-assessments/types/saq-answer-schema-object.type';
import { AnswerValueDto } from '~self-assessments/http/dto/answer-assessment.dto';

export type ValidateAnswerParams = {
    schema: Joi.ObjectSchema<SaqAnswerSchemaObject>;
    answer: AnswerValueDto;
    questionId: string;
    answerIndex: number;
};
