import { Id, Pagination, PaginationParams, SortMultipleParams, Sorts } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { PaginationCollection } from '@diginexhk/typeorm-helper';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, UploadedFiles, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RequireUploadFile } from '~core/decorators/require-upload-file.decorator';
import { BaseController } from '~core/http/controllers/base.controller';
import { DnaTestingEntity } from '~dna-testing/entities/dna-testing.entity';
import { DnaTestingService } from '~dna-testing/services/dna-testing.service';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityResponse } from '~facilities/http/response/facility.response';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { CreateDnaTestingDto } from '../dto/create-dna-testing.dto';
import { DnaTestingPaginationResponse } from '../response/dna-testing-pagination.response';

@Controller('dna-testings')
@ApiTags('DnaTesting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DnaTestingController extends BaseController {
    constructor(private dnaTestingService: DnaTestingService) {
        super();
    }

    @Post()
    @UseGuards(PermissionGuard(PermissionEnum.LOG_DNA_TEST_RESULTS))
    @ApiOperation({ description: 'Admin create dna testing' })
    @HttpCode(HttpStatus.CREATED)
    @RequireUploadFile({ fieldName: 'uploadProofs' })
    @ApiConsumes('multipart/form-data')
    createDnaTest(
        @CurrentUser() user: UserEntity,
        @Body() dto: CreateDnaTestingDto,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        return this.dnaTestingService.createDnaTest(user, dto, files);
    }

    @Get()
    @UseGuards(PermissionGuard(PermissionEnum.VIEW_DNA_TEST_RESULTS, PermissionEnum.LOG_DNA_TEST_RESULTS))
    @ResponseModel(DnaTestingPaginationResponse)
    @ApiOperation({ description: 'Get list dna testing' })
    getListDnaTest(
        @CurrentUser() user: UserEntity,
        @Pagination() paginationParams: PaginationParams,
        @Sorts({
            allowedFields: ['testedAt', 'productSupplier.name', 'status', 'createdAt'],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sort: SortMultipleParams[]
    ): Promise<PaginationCollection<DnaTestingEntity>> {
        return this.dnaTestingService.getListDnaTest(user, paginationParams, sort);
    }

    @Delete(':id')
    @ApiOperation({ description: 'Delete dna testing' })
    @UseGuards(PermissionGuard(PermissionEnum.LOG_DNA_TEST_RESULTS))
    @ApiParam({
        name: 'id',
        description: 'Dna testing id',
        type: 'string'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteDnaTest(@Id() id: string) {
        return this.dnaTestingService.deleteDnaTest(id);
    }

    @Get('requesting-facility')
    @ResponseModel(FacilityResponse, true)
    @UseGuards(PermissionGuard(PermissionEnum.LOG_DNA_TEST_RESULTS))
    @ApiOperation({ description: 'Get requesting facility' })
    async listRequestingFacility(): Promise<FacilityEntity[]> {
        return this.dnaTestingService.listRequestingFacility();
    }

    @Get('product-supplier')
    @ResponseModel(FacilityResponse, true)
    @UseGuards(PermissionGuard(PermissionEnum.LOG_DNA_TEST_RESULTS))
    @ApiOperation({ description: 'Get Product supplier' })
    async listProductSupplier(): Promise<FacilityEntity[]> {
        return this.dnaTestingService.listProductSupplier();
    }
}
