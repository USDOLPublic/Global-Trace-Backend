export type FileValidationError = {
    key: string;
    error: string;
    currentValue: any;
    isBlankRow: boolean;
    isShowKey?: boolean;
};

export type FileDataValidationType = {
    index: number;
    errors: FileValidationError[];
    sheet?: string;
    isShowRow: boolean;
};
