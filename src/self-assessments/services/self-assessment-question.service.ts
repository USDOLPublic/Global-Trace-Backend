/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { trans } from '@diginexhk/nestjs-cls-translation';
import { StorageService } from '@diginexhk/nestjs-storage';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import Joi from 'joi';
import { keyBy } from 'lodash';
import { In } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AVAILABLE_LANGUAGES } from '~core/constants/default-language.constant';
import { addMissingTranslations } from '~core/helpers/translation.helper';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentTranslationFileEntity } from '~self-assessments/entities/self-assessment-translation-file.entity';
import { SelfAssessmentQuestionRepository } from '~self-assessments/repositories/self-assessment-question.repository';
import { MapExistedQuestionGroup } from '~self-assessments/types/map-existed-question-group.type';
import {
    SelfAssessmentTranslationValidationError,
    TranslationValidationError
} from '~self-assessments/types/self-assessment-translation-validation-error.type';
import {
    QuestionResponseTranslation,
    SelfAssessmentTranslation
} from '~self-assessments/types/self-assessment-translations.type';
import { ValidateAndPrepareAssessmentTranslations } from '~self-assessments/types/validate-and-prepare-assessment-translations.type';
import { ValidateResponseTranslationParams } from '~self-assessments/types/validate-response-translation-params.type';
import { SelfAssessmentGroupService } from './self-assessment-group.service';
import { SelfAssessmentQuestionResponseService } from './self-assessment-question-response.service';
import { SelfAssessmentTranslationFileService } from './self-assessment-translation-file.service';

@Injectable()
export class SelfAssessmentQuestionService extends TransactionService {
    public constructor(
        private storageService: StorageService,
        private selfAssessmentQuestionRepo: SelfAssessmentQuestionRepository,
        private selfAssessmentQuestionResponseService: SelfAssessmentQuestionResponseService,
        private selfAssessmentTranslationFileService: SelfAssessmentTranslationFileService,
        @Inject(forwardRef(() => SelfAssessmentGroupService))
        private selfAssessmentGroupService: SelfAssessmentGroupService
    ) {
        super();
    }

    findOneOrFail(id: string): Promise<SelfAssessmentQuestionEntity> {
        return this.selfAssessmentQuestionRepo.findById(id);
    }

    findQuestionsIn(ids: string[]): Promise<SelfAssessmentQuestionEntity[]> {
        return this.selfAssessmentQuestionRepo.find({
            where: { id: In(ids) },
            order: { order: 'ASC' }
        });
    }

    create(data: QueryDeepPartialEntity<SelfAssessmentQuestionEntity>): Promise<SelfAssessmentQuestionEntity> {
        return this.selfAssessmentQuestionRepo.createOne(data);
    }

    async getSelfAssessmentTranslations(roleId: string): Promise<SelfAssessmentTranslation[]> {
        const selfAssessmentQuestions = await this.selfAssessmentQuestionRepo.findSelfAssessmentQuestionByRoleId(
            roleId
        );

        const selfAssessmentTranslations = selfAssessmentQuestions.map(({ id, title, questionResponses }, index) => {
            const item: SelfAssessmentTranslation = {
                title,
                questionId: id,
                index: index + 1
            };
            const hasResponse = questionResponses.some(({ option }) => option);
            if (hasResponse) {
                item.questionResponses = this.getQuestionResponsesTranslations(questionResponses);
            }
            return item;
        });

        return addMissingTranslations(selfAssessmentTranslations, 'title');
    }

    private getQuestionResponsesTranslations(
        questionResponses: SelfAssessmentQuestionResponseEntity[]
    ): QuestionResponseTranslation[] {
        return questionResponses.map(({ id, option, translation }) => {
            for (const language of AVAILABLE_LANGUAGES) {
                if (!translation.hasOwnProperty(language)) {
                    translation[language] = '';
                }
            }

            return { option, translation, questionResponseId: id };
        });
    }

    async translateSelfAssessments(file: Express.Multer.File, roleId: string) {
        const selfAssessmentTranslations = this.readSelfAssessmentsTranslationJsonFile(file);
        if (!selfAssessmentTranslations?.length) {
            throw new BadRequestException({ translate: 'error.invalid_self_assessment_translation_file' });
        }
        await this.upsertFile(roleId, file);

        const { validationErrors, preparedQuestionTranslations, preparedQuestionResponseTranslations } =
            await this.validateAndPrepareAssessmentTranslations(selfAssessmentTranslations, roleId);

        const updatedQuestionTranslations = await this.selfAssessmentQuestionRepo.save(preparedQuestionTranslations);
        const updatedQuestionResponseTranslations = await this.selfAssessmentQuestionResponseService.saveMany(
            preparedQuestionResponseTranslations
        );

        return { validationErrors, updatedQuestionTranslations, updatedQuestionResponseTranslations };
    }

    private readSelfAssessmentsTranslationJsonFile(file: Express.Multer.File): SelfAssessmentTranslation[] {
        try {
            return JSON.parse(file.buffer.toString('utf8'));
        } catch (error) {
            throw new BadRequestException({ translate: 'error.invalid_self_assessment_translation_file' });
        }
    }

    private async validateAndPrepareAssessmentTranslations(
        selfAssessmentTranslations: SelfAssessmentTranslation[],
        roleId: string
    ): Promise<ValidateAndPrepareAssessmentTranslations> {
        const validationErrors: SelfAssessmentTranslationValidationError[] = [];
        const preparedQuestionTranslations: Partial<SelfAssessmentQuestionEntity>[] = [];
        const preparedQuestionResponseTranslations: Partial<SelfAssessmentQuestionResponseEntity>[] = [];

        const { mappedExistedQuestions, mappedExistedQuestionResponses } = await this.findAndMapExistedQuestionGroup(
            roleId
        );

        for (const question of selfAssessmentTranslations) {
            let errors: TranslationValidationError[] = [];
            const existedQuestion = mappedExistedQuestions[question.questionId];
            const { error } = this.questionTranslationSchema.validate(question, {
                abortEarly: false
            });

            if (error) {
                errors = errors.concat(this.getErrorsFromMessage(error.message));
            }

            if (!existedQuestion) {
                errors.push({
                    key: 'questionId',
                    error: trans('validation.The $property does not exist.', { args: { property: 'questionId' } }),
                    isShowKey: false
                });
            }

            if (!error && existedQuestion) {
                preparedQuestionTranslations.push({ ...existedQuestion, title: question.title });
            }

            this.validateQuestionResponseTranslations({
                error,
                errors,
                mappedExistedQuestionResponses,
                preparedQuestionResponseTranslations,
                questionResponses: question.questionResponses
            });

            this.addValidationErrors(validationErrors, errors, question?.index);
        }

        return { validationErrors, preparedQuestionTranslations, preparedQuestionResponseTranslations };
    }

    private addValidationErrors(
        validationErrors: SelfAssessmentTranslationValidationError[],
        errors: TranslationValidationError[],
        index: number
    ): void {
        if (!errors.length) {
            return;
        }

        validationErrors.push({
            errors,
            index
        });
    }

    private async findAndMapExistedQuestionGroup(roleId: string): Promise<MapExistedQuestionGroup> {
        const groups = await this.selfAssessmentGroupService.find({ select: ['id'], where: { roleId } });
        const groupIds = groups.map(({ id }) => id);
        const existedQuestions = await this.selfAssessmentQuestionRepo.find({ where: { groupId: In(groupIds) } });

        const existedQuestionIds = existedQuestions.map(({ id }) => id);
        const existedQuestionResponses = await this.selfAssessmentQuestionResponseService.find({
            where: { selfAssessmentQuestionId: In(existedQuestionIds) }
        });

        return {
            mappedExistedQuestions: keyBy(existedQuestions, 'id'),
            mappedExistedQuestionResponses: keyBy(existedQuestionResponses, 'id')
        };
    }

    private validateQuestionResponseTranslations({
        error,
        errors,
        questionResponses,
        mappedExistedQuestionResponses,
        preparedQuestionResponseTranslations
    }: ValidateResponseTranslationParams): void {
        for (const index in questionResponses) {
            const questionResponse = questionResponses[index];
            const existedQuestionResponse = mappedExistedQuestionResponses[questionResponse.questionResponseId];

            if (!existedQuestionResponse) {
                errors.push({
                    key: `questionResponses[${index}].questionResponseId`,
                    error: trans('validation.The $property does not exist.', {
                        args: { property: `questionResponses[${index}]` }
                    }),
                    isShowKey: false
                });
            }

            if (!error && existedQuestionResponse) {
                preparedQuestionResponseTranslations.push({
                    ...existedQuestionResponse,
                    translation: questionResponse.translation
                });
            }
        }
    }

    private get questionTranslationSchema() {
        return Joi.object({
            questionId: Joi.string()
                .required()
                .guid()
                .messages({
                    'any.base': trans('import.invalid_id_in_object'),
                    'any.required': trans('import.require_id_in_object'),
                    'string.guid': trans('import.id_must_be_uuid')
                }),
            index: Joi.number()
                .required()
                .messages({
                    'any.base': trans('import.invalid_index'),
                    'any.required': trans('import.require_index'),
                    'number.base': trans('import.index_must_be_number')
                }),
            title: Joi.object()
                .pattern(
                    Joi.string()
                        .pattern(/^[a-z]+$/)
                        .max(255)
                        .required(),
                    Joi.string()
                        .required()
                        .messages({
                            'string.base': trans('import.invalid_language_translation', {
                                args: { languageTranslation: '{{#label}}' }
                            })
                        })
                )
                .messages({
                    'object.base': trans('import.invalid_name_translation')
                }),
            questionResponses: Joi.array().items(
                Joi.object({
                    questionResponseId: Joi.string()
                        .required()
                        .guid()
                        .messages({
                            'any.base': trans('import.invalid_id_in_object'),
                            'any.required': trans('import.require_id_in_object'),
                            'string.guid': trans('import.id_must_be_uuid')
                        }),
                    option: Joi.string()
                        .max(255)
                        .required()
                        .messages({
                            'any.base': trans('import.invalid_name_in_object'),
                            'any.required': trans('import.require_name_in_object')
                        }),
                    translation: Joi.object()
                        .pattern(
                            Joi.string()
                                .pattern(/^[a-z]+$/)
                                .max(255)
                                .required(),
                            Joi.string()
                                .required()
                                .messages({
                                    'string.base': trans('import.invalid_language_translation', {
                                        args: { languageTranslation: '{{#label}}' }
                                    })
                                })
                        )
                        .messages({
                            'object.base': trans('import.invalid_name_translation')
                        })
                })
            )
        });
    }

    private getErrorsFromMessage(message: string): TranslationValidationError[] {
        return message.split('. ').map((message) => ({
            key: message.match(/\\?"(.*?)(?<!\\)"/gm)[0].replace(/\"/g, ''),
            error: message.trim().replace(/\"/g, ''),
            isShowKey: false
        }));
    }

    private async upsertFile(roleId: string, file: Express.Multer.File): Promise<SelfAssessmentTranslationFileEntity> {
        const { blobName } = await this.storageService.uploadFile({ file });

        const fileUpload = {
            fileName: file.originalname,
            blobName
        };

        return this.selfAssessmentTranslationFileService.upsertByRoleId(roleId, fileUpload);
    }
}
