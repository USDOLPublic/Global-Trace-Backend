import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Request, UseGuards } from '@nestjs/common';
import { BaseController } from '~core/http/controllers/base.controller';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../../services/auth.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ExtractJwt } from 'passport-jwt';
import { ApiSetValue } from '~swaggers/decorators/api-set-value.decorator';
import { RefreshTokenDto } from '~users/http/dto/refresh-token.dto';
import { SignUpUserDto } from '../dto/sign-up-user.dto';
import { CurrentUser } from '~users/decorators/current-user.decorator';
import { ResponseModel } from '@diginexhk/nestjs-response';
import { LoginResponse } from '../response/login.response';
import { GetInviteInformationResponse } from '../response/get-invite-information.response';
import { SignUpResponse } from '../response/sign-up.response';
import { CreateShortTokenResponse } from '../response/create-short-token.response';
import { LoginResponseType } from '~users/types/login-response.type';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController extends BaseController {
    constructor(private authService: AuthService) {
        super();
    }

    @Post('login')
    @ResponseModel(LoginResponse)
    @ApiSetValue('token', 'token')
    @HttpCode(HttpStatus.OK)
    async login(@Body() request: LoginDto): Promise<LoginResponseType> {
        return this.authService.login(request.email, request.password);
    }

    @Post('refresh-token')
    @ResponseModel(LoginResponse)
    @HttpCode(HttpStatus.OK)
    refresh(@Body() payload: RefreshTokenDto): Promise<LoginResponseType> {
        return this.authService.refreshToken(payload.refreshToken);
    }

    @Delete('logout')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async logout(@Request() request) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        return this.authService.logout(token);
    }

    @Get('invite/:token')
    @ResponseModel(GetInviteInformationResponse)
    @ApiOperation({
        description: 'Get user information from invite token'
    })
    @ApiParam({ name: 'token' })
    async getInviteInformation(@Param('token') token: string): Promise<GetInviteInformationResponse> {
        return this.authService.getInviteInformation(token);
    }

    @Post('signup')
    @ResponseModel(SignUpResponse)
    @ApiOperation({
        description: 'User sign up from invitation'
    })
    async signup(@Body() request: SignUpUserDto): Promise<SignUpResponse> {
        return this.authService.signup(request);
    }

    @Post('short-token')
    @ResponseModel(CreateShortTokenResponse)
    @ApiOperation({ description: 'Get short token' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    createShortToken(@CurrentUser('id') userId: string): Promise<CreateShortTokenResponse> {
        return this.authService.createShortToken(userId);
    }
}
