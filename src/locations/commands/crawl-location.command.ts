import { LocationCrawlService } from '~locations/services/location-crawl.service';
import { Injectable } from '@nestjs/common';
import { BaseCommand, Command } from '@diginexhk/nestjs-command';

@Command({
    signature: 'crawl-location',
    description: 'Crawl location'
})
@Injectable()
export class CrawlLocationCommand extends BaseCommand {
    constructor(private locationCrawlService: LocationCrawlService) {
        super();
    }

    public async handle() {
        await this.locationCrawlService.crawlLocations();
        this.success('Crawl locations successfully!');
    }
}
