import { CoordinateType } from './coordinates.type';

export type FacilityAdditionalInformationType = {
    areas?: CoordinateType[];
    tehsil?: string;
    latitude?: string;
    longitude?: string;
    firstNameContactor?: string;
    lastNameContactor?: string;
    contactPhoneNumber?: string;
};
