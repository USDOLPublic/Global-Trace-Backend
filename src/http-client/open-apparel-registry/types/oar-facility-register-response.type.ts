import { RegisterOarIdStatusEnum } from '~http-client/open-apparel-registry/enums/register-oar-id-status.enum';
import { OarFacilitySearchResponseType } from '~http-client/open-apparel-registry/types/oar-facility-search-response.type';

export type OarFacilityRegisterResponseType = OarFacilitySearchResponseType & {
    status: RegisterOarIdStatusEnum.NEW_FACILITY;
};
