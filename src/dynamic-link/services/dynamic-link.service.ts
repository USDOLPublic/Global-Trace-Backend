import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { env } from '~config/env.config';
import { camelCaseToSnakeCase } from '~core/helpers/object-helper';
import { DYNAMIC_LINKS_API_URL } from '~dynamic-link/constants/dynamic-link.constant';
import { ShortDynamicLinkType } from '~dynamic-link/types/short-dynamic-link.type';

@Injectable()
export class DynamicLinkService {
    constructor(private httpService: HttpService) {}

    async createShortDynamicLink(link: string): Promise<ShortDynamicLinkType> {
        const { data } = await lastValueFrom(
            this.httpService.post(
                DYNAMIC_LINKS_API_URL,
                camelCaseToSnakeCase({
                    branchKey: env.BRANCH_DYNAMIC_LINK.API_KEY,
                    data: { $fallbackUrl: link }
                })
            )
        );
        return data;
    }
}
