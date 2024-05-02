import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTransformationItemTable1646386677711 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('TransformationItem', (table) => {
            table.primaryUuid('id');
            table.uuid('transformationId').index().foreign('Transformation');
            table.uuid('entityId');
            table.string('entityType');
            table.boolean('isInput');
            table.createdAt();
            table.updatedAt();
        });

        await queryRunner.manager.query(
            'CREATE INDEX "TransformationItem_Index_entityId_entityType" ON "TransformationItem" ("entityId", "entityType");'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('TransformationItem');
    }
}
