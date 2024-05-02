import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpBaseService } from '~http-client/services/http-base.service';
import { env } from '~config/env.config';

@Injectable()
export class GoogleMapApiService extends HttpBaseService {
    public constructor() {
        super();
    }

    async getLocation({ lat, lng }: { lat: number; lng: number }) {
        try {
            return await this.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    latlng: `${lat},${lng}`,
                    key: env.GOOGLE_MAPS.API_KEY
                }
            });
        } catch (err) {
            console.log(err);
            throw new BadRequestException({ translate: 'error.get_location_failed' });
        }
    }
}
