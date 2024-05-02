import { CoordinateType } from '~facilities/types/coordinates.type';

export type InstructionExcelType = {
    farmGroupId: string;
    farmGroupName: string;
    country: string;
    province: string;
    district: string;
    areas: CoordinateType[];
};
