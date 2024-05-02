import { HttpBaseService } from '~http-client/services/http-base.service';
import { env } from '~config/env.config';

export class RapidApiBaseService extends HttpBaseService {
    public constructor(private resourceBaseUrl: string, private resourceApiHost) {
        super();
        this.configBaseURL(resourceBaseUrl);
        this.configHeaders({
            /* eslint-disable @typescript-eslint/naming-convention */
            'x-rapidapi-key': env.RAPID_API.API_KEY,
            'x-rapidapi-host': resourceApiHost
            /* eslint-enable @typescript-eslint/naming-convention */
        });
    }
}
