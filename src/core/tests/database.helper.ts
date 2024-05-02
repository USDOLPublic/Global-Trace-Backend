import { Pool } from 'pg';
import { env } from '~config/env.config';
import config from '~config/orm.config';

export class DatabaseHelper {
    private pool: Pool;

    async createDatabase() {
        this.pool = new Pool({
            user: env.DATABASE.USER,
            host: env.DATABASE.HOST,
            password: env.DATABASE.PASSWORD,
            port: env.DATABASE.PORT,
            database: 'postgres'
        });
        await this.pool.query(`CREATE DATABASE "${config.database}"`);
    }

    async removeAndClose() {
        await this.pool.query(`DROP DATABASE "${config.database}"`);
        await this.pool.end();
    }
}
