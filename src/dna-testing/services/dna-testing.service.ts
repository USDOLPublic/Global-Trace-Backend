import { PaginationParams, SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { StorageService } from '@diginexhk/nestjs-storage';
import { Injectable } from '@nestjs/common';
import { StatusDnaTestingEnum } from '~dna-testing/enums/status-dna-testing.enum';
import { CreateDnaTestingDto } from '~dna-testing/http/dto/create-dna-testing.dto';
import { GetListDnaTestQuery } from '~dna-testing/queries/get-list-dna-test.query';
import { DnaTestingRepository } from '~dna-testing/repositories/dna-testing.repository';
import { FileUploadType } from '~core/types/file-upload.type';
import { FacilityService } from '~facilities/services/facility.service';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { QrCodeService } from '~qr-codes/services/qr-code.service';
import { ProductService } from '~products/services/product.service';
import { UserEntity } from '~users/entities/user.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { FacilityQueueService } from '~facilities/services/facility-queue.service';
import { ProductEntity } from '~products/entities/product.entity';
import { isEmpty } from 'lodash';

@Injectable()
export class DnaTestingService {
    constructor(
        private dnaTestingRepo: DnaTestingRepository,
        private facilityService: FacilityService,
        private storageService: StorageService,
        private qrCodeService: QrCodeService,
        private productService: ProductService,
        private rolePermissionService: RolePermissionService,
        private facilityQueueService: FacilityQueueService
    ) {}

    async createDnaTest(
        user: UserEntity,
        data: CreateDnaTestingDto,
        files: Array<Express.Multer.File>
    ): Promise<boolean> {
        const status = await this.validateResults(data);

        const uploadProofs = await this.dataFiles(files);
        await this.dnaTestingRepo.createOne({
            requestFacilityId: data.requestFacilityId,
            productId: data.productId,
            productSupplierId: data.productSupplierId,
            isDetected: data.isDetected,
            dnaIdentifiers: data.dnaIdentifiers,
            testedAt: data.testedAt,
            status: status ? StatusDnaTestingEnum.PASSED : StatusDnaTestingEnum.FAILED,
            uploadProofs,
            creatorId: user.id
        });
        await this.facilityQueueService.addFacilityRiskCalculation(data.productSupplierId);

        return status;
    }

    async getListDnaTest(user: UserEntity, paginationParams: PaginationParams, sortParams: SortMultipleParams[]) {
        const canViewDnaResults = await this.rolePermissionService.hasPermission(
            user,
            PermissionEnum.VIEW_DNA_TEST_RESULTS
        );
        const query = new GetListDnaTestQuery(sortParams, !canViewDnaResults ? user.id : undefined);
        return this.dnaTestingRepo.pagination(query, paginationParams);
    }

    async deleteDnaTest(id: string) {
        return this.dnaTestingRepo.deleteOrFail({ id });
    }

    private async validateResults({
        productId,
        isDetected,
        dnaIdentifiers,
        productSupplierId
    }: CreateDnaTestingDto): Promise<boolean> {
        let product: ProductEntity;
        const qrCode = await this.qrCodeService.getQRCodeByCode(productId);
        if (qrCode) {
            product = await this.productService.findOne({
                where: { id: qrCode.productId, createdFacilityId: productSupplierId }
            });
        } else {
            product = await this.productService.findOne({
                where: { code: productId, createdFacilityId: productSupplierId }
            });
        }

        if (!product) {
            return false;
        }

        if (isDetected) {
            return dnaIdentifiers.includes(product.dnaIdentifier);
        }
        return isEmpty(product.dnaIdentifier);
    }

    listRequestingFacility(): Promise<FacilityEntity[]> {
        return this.facilityService.getRequestingFacilityForDna();
    }

    listProductSupplier(): Promise<FacilityEntity[]> {
        return this.facilityService.getProductSupplierForDna();
    }

    private dataFiles(files: Array<Express.Multer.File>): Promise<FileUploadType[]> {
        return Promise.all(
            files.map(async (uploadProof) => {
                const { blobName } = await this.storageService.uploadFile({ file: uploadProof });
                return {
                    fileName: uploadProof.originalname,
                    blobName: blobName
                };
            })
        );
    }
}
