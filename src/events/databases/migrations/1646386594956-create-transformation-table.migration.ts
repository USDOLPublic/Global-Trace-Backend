import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTransformationTable1646386594956 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Transformation', (table) => {
            table.primaryUuid('id');
            table.uuid('facilityId').index().foreign('Facility');
            table.string('dnaIdentifier').unique().nullable();
            table.jsonb('uploadCertifications').default("'{}'::jsonb");
            table.uuid('creatorId');
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Transformation');
    }
}
