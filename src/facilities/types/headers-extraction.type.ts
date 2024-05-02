import { Column } from 'exceljs';

export type HeadersExtractionType = {
    communityLevelHeaders: Partial<Column>[];
    farmLevelHeaders: Partial<Column>[];
};
