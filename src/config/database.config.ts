import { TypeOrmHelperModule } from '@diginexhk/typeorm-helper';
import config from './orm.config';

export const databaseConfig = TypeOrmHelperModule.forRoot(config);
