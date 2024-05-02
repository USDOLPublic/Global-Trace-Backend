import { Body, Controller, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckResetTokenDto } from '../dto/check-reset-token.dto';
import { RequestNewTokenDto } from '../dto/request-new-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ResetPasswordService } from '../../services/reset-password.service';
import { OtpService } from '~users/services/otp.service';

@Controller('reset-password')
@ApiTags('Reset password')
export class ResetPasswordController extends BaseController {
    constructor(private resetPasswordService: ResetPasswordService, private otpService: OtpService) {
        super();
    }

    @Post('check-token')
    @ApiOperation({ description: 'Check a token is valid' })
    @HttpCode(HttpStatus.NO_CONTENT)
    checkToken(@Body() body: CheckResetTokenDto) {
        return this.otpService.checkToken(body.token);
    }

    @Post()
    @ApiOperation({ description: 'Request a email contains forgot password link' })
    @HttpCode(HttpStatus.NO_CONTENT)
    requestNewToken(@Body() body: RequestNewTokenDto) {
        return this.resetPasswordService.requestNewToken(body.email);
    }

    @Put()
    @ApiOperation({ description: 'Change new password' })
    @HttpCode(HttpStatus.NO_CONTENT)
    resetPassword(@Body() body: ResetPasswordDto) {
        return this.resetPasswordService.resetPassword(body.password, body.token);
    }
}
