import { HeaderResolver, QueryResolver } from 'nestjs-i18n';
import path from 'path';
import { env } from './env.config';
import { RequestResolver, TranslationModule } from '@diginexhk/nestjs-cls-translation';

export const i18nConfig = TranslationModule.forRoot({
    fallbackLanguage: 'en',
    loaderOptions: {
        path: path.join(env.ROOT_PATH, 'i18n/'),
        watch: true
    },
    resolvers: [new HeaderResolver(['language']), new QueryResolver(['language'])],
    defaultLanguageKey: 'language',
    clsResolvers: [
        new RequestResolver([
            { key: 'language', type: 'query' },
            { key: 'language', type: 'headers' }
        ])
    ]
});
