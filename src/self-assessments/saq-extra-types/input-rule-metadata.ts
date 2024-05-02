import { InputRuleEnum } from '~self-assessments/enums/input-rule.enum';

export interface InputRuleMetadata {
    rule: InputRuleEnum;
    args?: (string | number | boolean)[];
}
