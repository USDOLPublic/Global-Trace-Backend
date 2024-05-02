import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterChainOfCustodyFieldToFacilityTable1698226780429 extends BaseMigration {
    async run(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "Facility" SET "chainOfCustody" = (SELECT r."chainOfCustody" FROM "Role" AS r WHERE "typeId" = r.id) WHERE "chainOfCustody" IS NULL`
        );
    }
}
