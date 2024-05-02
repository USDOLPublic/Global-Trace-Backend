import { Body, Controller, Post, UploadedFiles, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from '../../services/upload.service';
import { UploadFilesDto } from '../dto/upload-files.dto';
import { JwtAuthGuard } from '~users/http/guards/jwt-auth.guard';
import { RequireUploadFile } from '~core/decorators/require-upload-file.decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { UploadFilesResponse } from '../response/upload.response';

@Controller('upload')
@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UploadController extends BaseController {
    constructor(private uploadService: UploadService) {
        super();
    }

    @Post('files')
    @ResponseModel(UploadFilesResponse, true)
    @ApiOperation({ description: 'Upload multiple files' })
    @ApiConsumes('multipart/form-data')
    @RequireUploadFile({ fieldName: 'files' })
    uploadFiles(
        @Body() dto: UploadFilesDto,
        @UploadedFiles() files?: Express.Multer.File[]
    ): Promise<{ blobName: string; url: string }[]> {
        return this.uploadService.uploadFiles(files);
    }
}
