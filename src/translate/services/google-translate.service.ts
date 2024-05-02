import { v2 } from '@google-cloud/translate/';
import { Global, Injectable } from '@nestjs/common';
import { env } from '~config/env.config';

@Global()
@Injectable()
export class GoogleTranslateService {
    private readonly translate: v2.Translate;
    private readonly credentials = this.getCredential();

    public constructor() {
        this.translate = new v2.Translate({ credentials: this.credentials });
    }

    private getCredential() {
        return JSON.parse(env.GOOGLE_TRANSLATE.API_KEY);
    }

    async translateText(text: string, targetLanguage: string) {
        try {
            let [response] = await this.translate.translate(text, { from: 'en', to: targetLanguage, format: 'text' });

            return response;
        } catch (error) {
            return text;
        }
    }
}
