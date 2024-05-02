import { SortMultipleParams } from '@diginexhk/nestjs-base-decorator';

export type GetAndSearchQrCodeBatchParamsType = {
    key?: string;
    isCompleted: boolean;
    sortParams: SortMultipleParams[];
};
