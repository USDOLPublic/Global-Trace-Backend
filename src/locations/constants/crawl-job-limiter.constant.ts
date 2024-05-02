import { env } from '~config/env.config';

export const CRAWL_LOCATIONS_LIMITER = {
    max: env.RAPID_API.MAX_REQUEST_PER_SECOND,
    duration: 1000
};
