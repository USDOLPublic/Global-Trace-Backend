import Joi from 'joi';

export type SaqAnswerSchemaObject = {
    value?: Joi.SchemaLike | Joi.SchemaLike[];
    code?: Joi.SchemaLike | Joi.SchemaLike[];
    traceabilityRiskLevel?: any;
    laborRiskLevel?: Joi.StringSchema;
    laborRiskType?: Joi.StringSchema;
};
