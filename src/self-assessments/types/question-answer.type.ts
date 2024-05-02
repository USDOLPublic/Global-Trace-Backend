import { SingleChoiceAnswer } from '~self-assessments/saq-extra-types/single-choice-answer';
import { MultipleChoiceAnswer } from '~self-assessments/saq-extra-types/multiple-choice-answer';
import { ShortTextAnswer } from '~self-assessments/saq-extra-types/short-text-answer';

export type QuestionAnswerType = SingleChoiceAnswer | MultipleChoiceAnswer | ShortTextAnswer;
