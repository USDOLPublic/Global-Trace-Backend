import { CategoryEntity } from '~categories/entities/category.entity';
import { ReportRiskCommentType } from './report-risk-comment.type';

export type ReportRiskType = {
    indicator: CategoryEntity;
    subIndicator: CategoryEntity;
    comments: ReportRiskCommentType[];
};
