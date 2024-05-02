import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProductService } from '~products/services/product.service';
import { Id } from '@diginexhk/nestjs-base-decorator';
import { Response } from 'express';
import { ShortTokenGuard } from '~users/http/guards/short-token.guard';

@Controller('products')
@ApiTags('Product')
@ApiBearerAuth()
export class ProductController extends BaseController {
    constructor(private productService: ProductService) {
        super();
    }

    @Get(':id/download-certifications')
    @UseGuards(ShortTokenGuard)
    @ApiOperation({ description: 'Download certifications' })
    @ApiParam({
        name: 'id',
        description: 'Product Id'
    })
    downloadCertifications(@Id() id: string, @Res() res: Response) {
        return this.productService.downloadCertifications(id, res);
    }
}
