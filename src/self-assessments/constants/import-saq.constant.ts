import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';

export const PRODUCT_SHEET_NAME = 'Product';
export const COMMUNITY_SHEET_NAME = 'Community';
export const LABOR_SHEET_NAME = 'Labor';

export const SHEET_IMPORT_SAQ_NAMES = [PRODUCT_SHEET_NAME, LABOR_SHEET_NAME];
export const SHEET_IMPORT_FACILITY_GROUP_SAQ_NAMES = [COMMUNITY_SHEET_NAME, LABOR_SHEET_NAME];

export const MULTIPLE_SELECT_RESPONSE_TYPE = 'Multi select';
export const SINGLE_SELECT_RESPONSE_TYPE = 'Single select';
export const BOOLEAN_RESPONSE_TYPE = 'Boolean';
export const INTEGER_RESPONSE_TYPE = 'Integer';
export const FREE_TEXT_RESPONSE_TYPE = 'Free text';

export const RESPONSE_TYPES = [
    BOOLEAN_RESPONSE_TYPE,
    MULTIPLE_SELECT_RESPONSE_TYPE,
    SINGLE_SELECT_RESPONSE_TYPE,
    FREE_TEXT_RESPONSE_TYPE,
    INTEGER_RESPONSE_TYPE
];

export const RESPONSE_TYPE_MAPPING: { [key: string]: SelfAssessmentQuestionTypesEnum } = {
    [BOOLEAN_RESPONSE_TYPE]: SelfAssessmentQuestionTypesEnum.YES_NO,
    [MULTIPLE_SELECT_RESPONSE_TYPE]: SelfAssessmentQuestionTypesEnum.MULTI_CHOICE,
    [SINGLE_SELECT_RESPONSE_TYPE]: SelfAssessmentQuestionTypesEnum.ONE_CHOICE,
    [FREE_TEXT_RESPONSE_TYPE]: SelfAssessmentQuestionTypesEnum.FREE_TEXT,
    [INTEGER_RESPONSE_TYPE]: SelfAssessmentQuestionTypesEnum.NUMBER
};

export const GROUP_QUESTION_COLUMN_NAMES = [
    'Index',
    'Question',
    'Method of Collecting data',
    'Conditional question',
    'Response Type',
    'Response Options',
    'Option Type',
    'Go to',
    'Risk category/weight',
    'Indicator',
    'Sub indicator'
];
