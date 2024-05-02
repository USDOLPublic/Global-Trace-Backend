import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddBrandSupplierPartnerInversedSide1652846466788 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const brandSupplierPartners = await queryRunner.query(
            `SELECT "FP"."facilityId" as "baseFacilityId", "FP"."partnerId", "FP"."ownerFacilityId",
                          "F"."type" as "baseFacilityType", "U"."id" as "creatorId"
                    FROM "FacilityPartner" as "FP" 
                    INNER JOIN "Facility" as "F"  ON "FP"."facilityId" = "F"."id" 
                    INNER JOIN "FacilityUser" as "FU" ON "FU"."facilityId" = "F"."id"
                    INNER JOIN "User" as "U" ON "U"."id" = "FU"."userId"
                    WHERE "FP"."ownerFacilityId" <> "FP"."facilityId"`
        );

        for (const facilityPartner of brandSupplierPartners) {
            const { baseFacilityId, partnerId, ownerFacilityId, baseFacilityType, creatorId } = facilityPartner;
            const isExistedRelationShip = !!(
                await queryRunner.query(
                    `SELECT * FROM "FacilityPartner" WHERE "facilityId" = $1 AND "partnerId" = $2 AND "ownerFacilityId" = $3`,
                    [partnerId, baseFacilityId, ownerFacilityId]
                )
            )[0];
            if (!isExistedRelationShip) {
                await queryRunner.query(
                    `INSERT INTO "FacilityPartner" ("facilityId", "partnerId", "ownerFacilityId", "type", "creatorId") VALUES ($1, $2, $3, $4, $5)`,
                    [partnerId, baseFacilityId, ownerFacilityId, baseFacilityType, creatorId]
                );
            }
        }
    }
}
