import {
    InjectQueue,
    OnQueueActive,
    OnQueueCompleted,
    OnQueueError,
    OnQueueFailed,
    OnQueueWaiting,
    Process,
    Processor
} from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { Connection } from 'typeorm';
import { LocationCrawlService } from '../services/location-crawl.service';

import { CRAWL_LOCATIONS, PREPARE_CRAWL_DISTRICTS } from '~locations/constants/crawl-location-queue.constant';

@Processor(CRAWL_LOCATIONS)
export class CrawlLocationsProcessor {
    private logger = new Logger(this.constructor.name);

    constructor(
        private readonly locationCrawlService: LocationCrawlService,
        private readonly connection: Connection,
        @InjectQueue(CRAWL_LOCATIONS) private crawlLocationsQueue: Queue
    ) {}

    @Process({ name: PREPARE_CRAWL_DISTRICTS })
    async prepareCrawlDistricts(job: Job<string>) {
        await this.locationCrawlService.handleCrawlDistricts(job.data);
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.debug(`Processing crawl locations job ${job.id}.`);
    }

    @OnQueueCompleted()
    onComplete(job: Job) {
        this.logger.debug(`Completed crawl locations job ${job.id}.`);
    }

    @OnQueueFailed()
    onError(job: Job, error: any) {
        this.logger.error(`Failed crawl locations job ${job.id}: ${error.message}`, error.stack);
    }

    @OnQueueError()
    onA(error: Error) {
        this.logger.error(`Failed crawl locations job`, error.stack);
    }

    @OnQueueWaiting()
    onWaiting(jobId: number | string) {
        this.logger.debug(`Completed crawl locations job ${jobId}.`);
    }
}
