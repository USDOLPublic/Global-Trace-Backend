import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';
import { env } from '~config/env.config';
import { I18nHelper } from '~core/helpers/i18n.helper';
import { makeAToken } from '~core/helpers/string.helper';
import { FacilityService } from '~facilities/services/facility.service';
import { OrderTraceService } from '~order/services/order-trace.service';
import { OrderService } from '~order/services/order.service';
import {
    DEFAULT_TOKEN_PDF,
    DEFAULT_TOKEN_SUPPLIER_DETAIL_PDF
} from '~pdf-exports/constants/default-token-pdf.constant';
import { TTL } from '~pdf-exports/constants/pdf-export.constant';
import { PREVIEW_PDF, SUPPLIER_DETAIL_PREVIEW_PDF } from '~pdf-exports/constants/pdf-preview.constant';
import { HomePageData } from '~pdf-exports/types/homepage-data';
import { SupplierMappingData } from '~pdf-exports/types/supplier-mapping-data.type';
import { UserEntity } from '~users/entities/user.entity';
import { PdfExportTracingObjectService } from './pdf-export-tracing-object.service';
import { FacilityRiskFilterDto } from '~risk-assessments/http/dto/facility-risk-filter.dto';
import { FacilityRiskFilerService } from '~facilities/services/facility-risk-filter.service';

@Injectable()
export class PdfExportService {
    constructor(
        private httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private orderService: OrderService,
        private orderTraceService: OrderTraceService,
        private pdfExportTracingObjectService: PdfExportTracingObjectService,
        private facilityService: FacilityService,
        private facilityRiskFilerService: FacilityRiskFilerService
    ) {}

    async getPdfData(token: string) {
        const data: string = await this.cacheManager.get(token);
        if (!data) {
            throw new NotFoundException({ translate: 'error.not_found.Token' });
        }

        return JSON.parse(data);
    }

    async generatePdf(orderId: string, timezone: string, user: UserEntity, language?: string): Promise<Buffer> {
        const token = env.APP_ENV === 'development' ? DEFAULT_TOKEN_PDF : makeAToken();
        const [homePage, order, supplierMapping, tracingObjects] = await Promise.all([
            this.generateHomePageData(user),
            this.orderService.getOrderById(user, orderId),
            this.generateSupplierMappingData(user, orderId),
            this.pdfExportTracingObjectService.generateTracingData(user, orderId)
        ]);

        const countByRiskLevel = this.pdfExportTracingObjectService.countFacilitiesByRiskLevel(tracingObjects);
        const topFiveIssues = await this.pdfExportTracingObjectService.getTopFiveIssues(tracingObjects);

        for (const tracingObject of tracingObjects) {
            if (tracingObject.supplier) {
                I18nHelper.translateFacilityLocation(tracingObject.supplier);
            }
        }

        const pdfData = {
            homePage,
            assessment: { order, countByRiskLevel, topFiveIssues },
            supplierMapping,
            tracingObjects,
            language
        };

        await this.cacheManager.set(token, JSON.stringify({ pdfData }), TTL);
        return this.getBufferFileWeb2Pdf(token, timezone, PREVIEW_PDF);
    }

    async generateSupplierDetailPdf(
        supplierId: string,
        filters: FacilityRiskFilterDto,
        timezone: string,
        language: string
    ): Promise<Buffer> {
        const token = env.APP_ENV === 'development' ? DEFAULT_TOKEN_SUPPLIER_DETAIL_PDF : makeAToken();
        const supplierDetail = await this.facilityService.findInformationSupplierById(supplierId, filters);
        const filterParams = await this.facilityRiskFilerService.getFilterParams(filters);

        const pdfData = {
            supplierDetail,
            filterParams,
            language
        };

        await this.cacheManager.set(token, JSON.stringify({ pdfData }), TTL);
        return this.getBufferFileWeb2Pdf(token, timezone, SUPPLIER_DETAIL_PREVIEW_PDF);
    }

    private async getBufferFileWeb2Pdf(token: string, timezone: string, pdfPreview: string) {
        try {
            const { data } = await this.convertWeb2Pdf(token, timezone, pdfPreview);
            return data;
        } finally {
            if (env.APP_ENV !== 'development') {
                await this.cacheManager.del(token);
            }
        }
    }

    private async convertWeb2Pdf(token: string, timezone: string, pdfPreview: string, attemptCount: number = 1) {
        try {
            let convertedPageUrl = `${env.WEB_URL}/${pdfPreview}?token=${token}`;

            return await lastValueFrom(
                this.httpService.post(
                    `${env.WEB_2_PDF_API_URL}/pdf/converts`,
                    {
                        url: convertedPageUrl,
                        waitFunction: 'window.isLoadPdfCompleted',
                        timezone
                    },
                    //eslint-disable-next-line @typescript-eslint/naming-convention
                    { headers: { 'api-key': env.WEB_2_PDF_API_KEY }, responseType: 'arraybuffer' }
                )
            );
        } catch (error) {
            console.error(error.response || error);
            if (attemptCount > 3) {
                throw error;
            }

            await this.convertWeb2Pdf(token, timezone, pdfPreview, attemptCount + 1);
        }
    }

    private generateHomePageData(requester: UserEntity): HomePageData {
        return { ...requester.currentFacility, phoneNumber: requester.phoneNumber };
    }

    private async generateSupplierMappingData(user: UserEntity, orderId: string): Promise<SupplierMappingData> {
        const [traceMappingSuppliers, traceResultList, orderSuppliers] = await Promise.all([
            this.orderTraceService.getTraceResultMapping(user, orderId),
            this.orderTraceService.getTraceResultList(user, orderId),
            this.orderTraceService.getSupplierList(user, orderId)
        ]);

        return { traceMappingSuppliers, traceResultList, orderSuppliers };
    }
}
