import { Sort, SortParams } from '@diginexhk/nestjs-base-decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Header,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    StreamableFile,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Connection, EntityManager } from 'typeorm';
import { RequireUploadTemplateFile } from '~core/decorators/require-upload-file.decorator';
import { assessmentDocumentFilter } from '~core/filters/assessment-document.filter';
import { BaseController } from '~core/http/controllers/base.controller';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { FILE_SIZE } from '~self-assessments/constants/file-size.constant';
import { FILE_TYPES } from '~self-assessments/constants/file-types.constant';
import { ImportSelfAssessmentFileDto } from '~self-assessments/http/dto/import-self-assessment-file.dto';
import { ImportSelfAssessmentService } from '~self-assessments/services/import/import-self-assessment.service';
import { ValidateSelfAssessmentService } from '~self-assessments/services/import/validate-self-assessment.service';
import { SelfAssessmentQuestionService } from '~self-assessments/services/self-assessment-question.service';
import { SelfAssessmentService } from '~self-assessments/services/self-assessment.service';
import { ValidationError } from '~self-assessments/types/answer-validation-error.type';
import { ImportFilesSelfAssessmentType } from '~self-assessments/types/import-files-self-assessment.type';
import { ValidateImportFileType } from '~self-assessments/types/validate-import-file.type';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { UserEntity } from '~users/entities/user.entity';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { PermissionGuard } from '~users/http/guards/permission.guard';
import { RoleGuard } from '~users/http/guards/role.guard';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';
import { AnswerSelfAssessmentDto } from '../dto/answer-self-assessment.dto';
import { UploadSelfAssessmentTranslationsDto } from '../dto/upload-self-assessment-translations.dto';
import { GetSelfAssessmentListResponse } from '../response/get-self-assessment-list.response';
import { ListTemplateFileResponse } from '../response/list-template-file.response';
import { SelfAssessmentAnswerResponse } from '../response/self-assessment-answer.response';
import { SelfAssessmentTranslationResponse } from '../response/self-assessment-translation.response';

@Controller('self-assessments')
@ApiTags('SelfAssessments')
@ApiBearerAuth()
export class SelfAssessmentController extends BaseController {
    constructor(
        private selfAssessmentsService: SelfAssessmentService,
        private importSelfAssessmentService: ImportSelfAssessmentService,
        private validateSelfAssessmentService: ValidateSelfAssessmentService,
        private selfAssessmentQuestionService: SelfAssessmentQuestionService,
        private connection: Connection
    ) {
        super();
    }

    @Get('list-role-with-file')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ResponseModel(ListTemplateFileResponse, true)
    @ApiOperation({ description: 'Get list role with file' })
    @ApiQuery({
        name: 'key',
        required: false,
        type: String
    })
    getSelfAssessmentFileOfRoles(
        @Query('key') key: string,
        @Sort({
            allowedFields: ['name'],
            default: { sortField: 'createdAt', sortDirection: 'DESC' }
        })
        sort: SortParams
    ): Promise<ListTemplateFileResponse[]> {
        return this.selfAssessmentsService.getSelfAssessmentFileOfRoles(key, sort);
    }

    @Get('download-template')
    @UseGuards(ShortTokenGuard)
    @ApiOperation({ description: 'Download template' })
    @ApiQuery({
        name: 'roleId',
        required: true,
        type: String
    })
    downloadTemplate(@Query('roleId') roleId: string, @Res() res: Response) {
        return this.selfAssessmentsService.downloadTemplate(roleId, res);
    }

    @Get('translations')
    @UseGuards(ShortTokenGuard)
    @Header('Access-Control-Allow-Headers', 'X-Requested-With')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="Self-assessment-translations.json"')
    @ApiOperation({ description: 'Download self assessment translations' })
    @ApiQuery({
        name: 'roleId',
        required: true,
        type: String
    })
    async getSelfAssessmentTranslations(@Query('roleId') roleId: string, @Res() res: Response) {
        const data = await this.selfAssessmentQuestionService.getSelfAssessmentTranslations(roleId);
        const buffer = Buffer.from(JSON.stringify(data, null, 4), 'utf8');
        new StreamableFile(buffer).getStream().pipe(res);
    }

    @Post('translations')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ResponseModel(SelfAssessmentTranslationResponse)
    @ApiOperation({ description: 'Upload self assessment translation file' })
    @ApiConsumes('multipart/form-data')
    @RequireUploadTemplateFile({ fieldName: 'file', maxCount: 1 })
    translateSelfAssessments(
        @Body() dto: UploadSelfAssessmentTranslationsDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.connection.transaction((manager: EntityManager) => {
            return this.selfAssessmentQuestionService
                .withTransaction(manager)
                .translateSelfAssessments(file, dto.roleId);
        });
    }

    @Get()
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.COMPLETE_OWN_SAQ))
    @ResponseModel(GetSelfAssessmentListResponse)
    @ApiOperation({ description: 'Get list self assessments' })
    listSelfAssessments(@CurrentUser() user: UserEntity): Promise<GetSelfAssessmentListResponse> {
        return this.selfAssessmentsService.listSelfAssessmentsGroups(user);
    }

    @Post('answers')
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.COMPLETE_OWN_SAQ))
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        description: 'Answer assessment'
    })
    answerAssessment(
        @CurrentUser() user: UserEntity,
        @Body() data: AnswerSelfAssessmentDto
    ): Promise<ValidationError[]> {
        return this.connection.transaction((manager) =>
            this.selfAssessmentsService.withTransaction(manager).answerAssessment(user, data)
        );
    }

    @Get('answers')
    @UseGuards(JwtAuthGuard, PermissionGuard(PermissionEnum.COMPLETE_OWN_SAQ))
    @ResponseModel(SelfAssessmentAnswerResponse, true)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        description: 'Get answer assessment'
    })
    async getAnswer(@CurrentUser() user: UserEntity): Promise<SelfAssessmentAnswerResponse[]> {
        return this.connection.transaction((manager) =>
            this.selfAssessmentsService.withTransaction(manager).getAnswers(user)
        );
    }

    @Post('import')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Import self assessment' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'fileSaq', maxCount: 1 },
                { name: 'fileFacilityGroupTemplate', maxCount: 1 }
            ],
            {
                fileFilter: (req, file, callback) => assessmentDocumentFilter(req, file, FILE_TYPES, callback),
                limits: { fileSize: FILE_SIZE }
            }
        )
    )
    import(
        @Body() dto: ImportSelfAssessmentFileDto,
        @UploadedFiles() files: ImportFilesSelfAssessmentType,
        @Req() req: any
    ): Promise<{ result: boolean }> {
        if (req.fileValidationError) {
            throw new BadRequestException({ translate: 'error.excel_file_has_the_wrong_format' });
        }
        return this.connection.transaction((manager: EntityManager) => {
            return this.importSelfAssessmentService.withTransaction(manager).import(dto, files);
        });
    }

    @Post('import/validate')
    @UseGuards(JwtAuthGuard, RoleGuard(UserRoleEnum.SUPER_ADMIN))
    @ApiOperation({ description: 'Validate import self assessment' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'fileSaq', maxCount: 1 },
                { name: 'fileFacilityGroupTemplate', maxCount: 1 }
            ],
            {
                fileFilter: (req, file, callback) => assessmentDocumentFilter(req, file, FILE_TYPES, callback),
                limits: { fileSize: FILE_SIZE }
            }
        )
    )
    validateImport(
        @Body() dto: ImportSelfAssessmentFileDto,
        @UploadedFiles() files: ImportFilesSelfAssessmentType,
        @Req() req: any
    ): Promise<ValidateImportFileType[]> {
        if (req.fileValidationError) {
            throw new BadRequestException({ translate: 'error.excel_file_has_the_wrong_format' });
        }
        return this.validateSelfAssessmentService.validateImport(dto, files);
    }
}
