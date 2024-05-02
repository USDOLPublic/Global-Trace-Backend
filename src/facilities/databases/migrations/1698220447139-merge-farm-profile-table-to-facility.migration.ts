import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class MergeFarmProfileTableToFacility1698220447139 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.uuid('facilityGroupFileId').index().nullable().foreign('File');
            table.string('farmId').nullable();
            table.timestamp('certificationExpiredDate').nullable();
            table.jsonb('additionalInformation').default("'{}'::jsonb");
        });

        const farmGroups = await queryRunner.query('SELECT * FROM "FarmGroupProfile"');
        for (const farmGroup of farmGroups) {
            await queryRunner.query(
                `UPDATE "Facility" SET "facilityGroupFileId" = $1, "farmId" = $2, "additionalInformation" = $3 WHERE "id" = '${farmGroup.facilityId}'`,
                [farmGroup.fileId, farmGroup.farmGroupId, JSON.stringify({ areas: farmGroup.areas })]
            );
        }

        const farms = await queryRunner.query(
            `SELECT "FP".*, "FGP"."farmGroupId"
            FROM "FarmProfile" "FP"
            JOIN "Facility" "F" ON "FP"."farmId" = "F"."id"
            JOIN "FarmGroupProfile" "FGP" ON "F"."farmGroupId" = "FGP"."facilityId"`
        );
        for (const farm of farms) {
            await queryRunner.query(
                `UPDATE "Facility" SET "farmId" = $1, "certificationExpiredDate" = $2, "additionalInformation" = $3 WHERE "id" = '${farm.farmId}'`,
                [
                    `${farm.farmGroupId}-${farm.farmProfileId}`,
                    farm.certificationExpiredDate,
                    JSON.stringify({
                        tehsil: farm.tehsil,
                        latitude: farm.latitude,
                        longitude: farm.longitude,
                        firstNameContactor: farm.firstNameContactor,
                        lastNameContactor: farm.lastNameContactor,
                        contactPhoneNumber: farm.contactPhoneNumber,
                        farmSize: farm.farmSize
                    })
                ]
            );
        }
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('facilityGroupFileId');
            table.dropColumn('farmId');
            table.dropColumn('certificationExpiredDate');
            table.dropColumn('additionalInformation');
        });
    }
}
