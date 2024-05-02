import { HttpBaseService } from '~http-client/services/http-base.service';
import { env } from '~config/env.config';
import { BadRequestException, forwardRef, Global, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RegisterOarIdDto } from '~facilities/http/dto/register-oar-id.dto';
import { FacilityService } from '~facilities/services/facility.service';
import { CheckOarIdDto } from '~facilities/http/dto/check-oar-id.dto';
import { OarFacilitySearchResponseType } from '~http-client/open-apparel-registry/types/oar-facility-search-response.type';
import { RegisterOarIdStatusEnum } from '~http-client/open-apparel-registry/enums/register-oar-id-status.enum';
import { RegisterOarIdConfirmMatchResponseType } from '~http-client/open-apparel-registry/types/register-oar-id-confirm-match-response.type';
import { GoogleMapApiService } from '~http-client/google-map/services/google-map-api.service';
import {
    OarIdConfirmMatchResponseType,
    RejectMatchOarIdStatusEnum
} from '~http-client/open-apparel-registry/types/oar-id-reject-response.type';
import { CheckOarIdResponse } from '~http-client/open-apparel-registry/types/check-oar-id-respone.type';
import { extractLocation } from '~http-client/google-map/helpers/extract-province-and-district.helper';
import CHECK_OAR_ID_RESPONSE from '../mock-data/check-oar-id-response.json';
import REGISTER_OAR_ID_NEW_FACILITY_RESPONSE from '../mock-data/regist-oar-id-new-facility-respone.json';
import REGISTER_OAR_ID_POTENTIAL_RESPONSE from '../mock-data/regist-oar-id-potentional-match-respone.json';
import REGISTER_OAR_ID_MATCH_RESPONSE from '../mock-data/regist-oar-id-match-respone.json';
import REGISTER_OAR_ID_ERROR_MATCH_RESPONSE from '../mock-data/regist-oar-id-error-match-respone.json';
import FACILITY_MATCH_CONFIRM_RESPONSE from '../mock-data/facility-match-confirm.json';
import FACILITY_MATCH_REJECT_RESPONSE from '../mock-data/facility-match-reject.json';
import { generalStringCode } from '~core/helpers/string.helper';
import { LocationService } from '~locations/services/location.service';

@Global()
@Injectable()
export class OpenApparelRegistryService extends HttpBaseService {
    public constructor(
        @Inject(forwardRef(() => FacilityService))
        private facilityService: FacilityService,
        private locationService: LocationService,
        private googleMapApiService: GoogleMapApiService
    ) {
        super();
        this.configBaseURL(env.OPEN_APPAREL_REGISTRY_API.BASE_URL);
        this.configHeaders({ Authorization: `Token ${env.OPEN_APPAREL_REGISTRY_API.API_KEY}` });
    }

    get isDevelopment() {
        return process.env.NODE_ENV === 'development';
    }

    async checkOarId(dto: CheckOarIdDto) {
        try {
            let response: CheckOarIdResponse;
            if (this.isDevelopment) {
                response = CHECK_OAR_ID_RESPONSE as unknown as CheckOarIdResponse;
            } else {
                const { oarId, page, pageSize } = dto;
                response = (await this.get('/api/facilities', {
                    params: {
                        q: oarId,
                        page,
                        pageSize
                    }
                })) as CheckOarIdResponse;
            }

            const matchedOarId = response.features.find(({ id }) => id === dto.oarId);
            if (!matchedOarId) {
                return { isMatched: false };
            }

            const { name, address, countryName } = matchedOarId.properties;

            const locationResponse = await this.googleMapApiService.getLocation({
                lat: +matchedOarId.geometry.coordinates[1],
                lng: +matchedOarId.geometry.coordinates[0]
            });
            const { province, district } = extractLocation(locationResponse.results[0]);
            const {
                country: countryEntity,
                province: provinceEntity,
                district: districtEntity
            } = await this.locationService.findLocation(countryName, province, district);

            return {
                isMatched: true,
                name,
                address,
                countryId: countryEntity?.id,
                provinceId: provinceEntity?.id,
                districtId: districtEntity?.id,
                country: countryEntity,
                province: provinceEntity,
                district: districtEntity
            };
        } catch (err) {
            console.log(err);
            throw new BadRequestException({ translate: 'error.check_oar_id_fail' });
        }
    }

    private extractFacilityMatchId(url: string) {
        return +url.split('/').find((item) => !isNaN(+item) && item !== '');
    }

    async handleRegisterOarIdResponse(response: OarFacilitySearchResponseType) {
        const { matches, status } = response;
        const dataResponse: any = {
            matches,
            status,
            oarId: response.osId
        };
        if ([RegisterOarIdStatusEnum.POTENTIAL_MATCH, RegisterOarIdStatusEnum.MATCHED].includes(status)) {
            dataResponse.matches = await Promise.all(
                matches.map(async (facility) => {
                    const {
                        properties: { name, address, osId, countryName },
                        confirmMatchUrl,
                        geometry: { coordinates }
                    } = facility;

                    const locationResponse = await this.googleMapApiService.getLocation({
                        lat: coordinates[1],
                        lng: coordinates[0]
                    });
                    const { province, district } = extractLocation(locationResponse.results[0]);
                    const {
                        country: countryEntity,
                        province: provinceEntity,
                        district: districtEntity
                    } = await this.locationService.findLocation(countryName, province, district);
                    const data: RegisterOarIdConfirmMatchResponseType = {
                        name,
                        address,
                        oarId: osId,
                        countryId: countryEntity?.id,
                        provinceId: provinceEntity?.id,
                        districtId: districtEntity?.id,
                        country: countryEntity,
                        province: provinceEntity,
                        district: districtEntity
                    };
                    if (status === RegisterOarIdStatusEnum.POTENTIAL_MATCH) {
                        const facilityMatchId = this.extractFacilityMatchId(confirmMatchUrl);
                        data.facilityMatchId = facilityMatchId;
                        data.isConfirmed = await this.checkIsFacilityMatchConfirmed(facilityMatchId);
                    }

                    return data;
                })
            );
        }
        return dataResponse;
    }

    async registerOarId(dto: RegisterOarIdDto) {
        try {
            let response;
            if (this.isDevelopment) {
                switch (Math.floor(Math.random() * 4)) {
                    case 1:
                        response = { ...REGISTER_OAR_ID_NEW_FACILITY_RESPONSE, osId: generalStringCode('OAR_ID_') };
                        break;
                    case 2:
                        response = { ...REGISTER_OAR_ID_POTENTIAL_RESPONSE, osId: generalStringCode('OAR_ID_') };
                        break;
                    case 3:
                        response = { ...REGISTER_OAR_ID_MATCH_RESPONSE, osId: generalStringCode('OAR_ID_') };
                        break;
                    default:
                        response = REGISTER_OAR_ID_ERROR_MATCH_RESPONSE;
                }
            } else {
                const country = await this.locationService.findCountryById(dto.countryId);
                response = (await this.post('/api/facilities/', {
                    data: { country: country.country, name: dto.name, address: dto.address },
                    params: { create: true, public: true, textonlyfallback: true }
                })) as OarFacilitySearchResponseType;
            }

            return this.handleRegisterOarIdResponse(response);
        } catch (err) {
            console.log(err);
            throw new BadRequestException({ translate: 'error.request_oar_id_fail' });
        }
    }

    async handleConfirmMatchFacilityResponse(
        response: OarIdConfirmMatchResponseType
    ): Promise<RegisterOarIdConfirmMatchResponseType> {
        const { matchedFacility, countryName, processingErrors } = response;
        if (processingErrors && processingErrors.length) {
            throw new BadRequestException({ translate: 'error.can_not_create_oar_id' });
        }

        const result = await this.googleMapApiService.getLocation({
            lat: matchedFacility.location.lat,
            lng: matchedFacility.location.lng
        });
        const extractedResult = extractLocation(result.results[0]);
        const { country, province, district } = await this.locationService.findLocation(
            countryName,
            extractedResult.province,
            extractedResult.district
        );

        return {
            oarId: matchedFacility.osId,
            name: matchedFacility.name,
            address: matchedFacility.address,
            countryId: country?.id,
            provinceId: province?.id,
            districtId: district?.id,
            country,
            province,
            district
        };
    }

    async checkIsFacilityMatchConfirmed(id: number): Promise<boolean> {
        try {
            if (this.isDevelopment) {
                return Math.floor(Math.random() * 10) >= 5;
            }

            await this.get(`/api/facility-matches/${id}/`);
            return false;
        } catch (err) {
            console.log(err);
            if (err.response.status === HttpStatus.BAD_REQUEST) {
                return true;
            }
        }
    }

    async confirmMatchOarId(id: string): Promise<RegisterOarIdConfirmMatchResponseType> {
        try {
            if (this.isDevelopment) {
                return this.handleConfirmMatchFacilityResponse(FACILITY_MATCH_CONFIRM_RESPONSE as any);
            }

            const response = (await this.post(`/api/facility-matches/${id}/confirm/`)) as OarIdConfirmMatchResponseType;
            return this.handleConfirmMatchFacilityResponse(response);
        } catch (err) {
            console.log(err);
            throw new BadRequestException({ translate: 'error.confirm_oar_id_fail' });
        }
    }

    private async requestRejectMatchOarId(ids: string[]): Promise<OarIdConfirmMatchResponseType> {
        if (this.isDevelopment) {
            let response;
            let random = Math.floor(Math.random() * 10);
            let isMatched = false;

            for (const id of ids) {
                console.log('Reject facility match: ', id, random);
                if (random < 5) {
                    response = FACILITY_MATCH_CONFIRM_RESPONSE;
                    isMatched = true;
                    break;
                } else {
                    response = FACILITY_MATCH_REJECT_RESPONSE;
                }
            }

            if (!isMatched) {
                return this.requestRejectMatchOarId(ids);
            }

            return response;
        }

        for (const id of ids) {
            const response = (await this.post(`/api/facility-matches/${id}/reject/`)) as OarIdConfirmMatchResponseType;
            if (response.status === RejectMatchOarIdStatusEnum.CONFIRMED_MATCH) {
                return response;
            }

            if (response.processingErrors && response.processingErrors.length) {
                throw new BadRequestException({ translate: 'error.can_not_create_oar_id' });
            }
        }

        throw new BadRequestException({ translate: 'error.confirm_oar_id_fail' });
    }

    async rejectMatchOarIds(ids: string[]): Promise<RegisterOarIdConfirmMatchResponseType> {
        try {
            const response = await this.requestRejectMatchOarId(ids);
            if (this.isDevelopment) {
                return this.handleConfirmMatchFacilityResponse({
                    ...response,
                    matchedFacility: { ...response.matchedFacility, osId: generalStringCode('OAR_ID_') }
                });
            }

            return this.handleConfirmMatchFacilityResponse(response);
        } catch (err) {
            console.log(err);
            if (err instanceof BadRequestException) {
                throw err;
            }
            throw new BadRequestException({ translate: 'error.reject_oar_id_fail' });
        }
    }
}
