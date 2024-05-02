import { OarIdLocation } from './oar-id-location.type';

export type FacilityMatchStatusType = {
    id: string;
    status: string;
    confidence: string;
    results: any;
    osId: string;
    name: string;
    address: string;
    location: OarIdLocation;
    isActive: boolean;
};
