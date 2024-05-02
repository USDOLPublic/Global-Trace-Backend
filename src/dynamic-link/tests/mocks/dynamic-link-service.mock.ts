import { DynamicLinkService } from '~dynamic-link/services/dynamic-link.service';
import { ShortDynamicLinkType } from '~dynamic-link/types/short-dynamic-link.type';

export class MockDynamicLinkService extends DynamicLinkService {
    async createShortDynamicLink(link: string): Promise<ShortDynamicLinkType> {
        return { url: link };
    }
}
