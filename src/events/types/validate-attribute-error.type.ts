import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';

export type ValidateAttributeErrorType = {
    index: number;
    attributeIndex: number;
    attributeName: string;
    property?: string;
    attributeType?: FieldTypeEnum | string;
    attributeValue?: any;
    message?: string;
};
