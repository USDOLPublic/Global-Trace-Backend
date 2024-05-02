import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class MigrateDataEventTable1649238267661 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `INSERT INTO "Event" ("facilityId", "type", "recordedAt", "entityId", "entityType")
            SELECT "facilityId", "type", "transactedAt", "id", 'TransactionEntity' FROM "Transaction"`
        );

        await queryRunner.query(
            `INSERT INTO "Event" ("facilityId", "type", "recordedAt", "entityId", "entityType")
            SELECT "facilityId", 4, "createdAt", "id", 'TransformationEntity' FROM "Transformation"`
        );
    }
}
