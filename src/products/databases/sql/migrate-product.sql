DO $$
DECLARE 
    cottonProductionDefinitionId UUID := (SELECT id FROM "ProductDefinition" WHERE name = 'Raw Cotton'); 
    lotProductionDefinitionId UUID := (SELECT id FROM "ProductDefinition" WHERE name = 'Lot'); 
    yarnProductionDefinitionId UUID := (SELECT id FROM "ProductDefinition" WHERE name = 'Yarn'); 
    fabricProductionDefinitionId UUID := (SELECT id FROM "ProductDefinition" WHERE name = 'Fabric'); 

    trashContentAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Trash Content'); 
    moistureLevelAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Moisture Level'); 
    cottonCertificationAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Cotton Certification'); 
    seedCottonGradeAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Grade'); 
    lintCottonGradeAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Lint Grade'); 
    totalWeightAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Total Weight'); 
    priceAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Price'); 
    productIdAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Product ID'); 
    attachmentsAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Attachments'); 
    originAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Product Origin'); 
    descriptionAtrId UUID := (SELECT id FROM "Attribute" WHERE name = 'Description'); 
BEGIN
    ALTER TABLE "Product" ALTER "createdFacilityId" DROP NOT NULL;

    INSERT INTO "Product" (
        "id", "productDefinitionId", "isTransformed", "createdAt", "updatedAt", "isManualAdded", "quantity", "quantityUnit", "certifications", "additionalAttributes"
    )
    SELECT "id", cottonProductionDefinitionId, "isTransformed", "createdAt", "updatedAt", true, "totalWeight", "weightUnit", null, json_build_array(
            json_build_object(
                'attributeId', trashContentAtrId,
                'value', "trashContent"
            ), 
            json_build_object(
                'attributeId', moistureLevelAtrId,
                'value', "moistureLevel"
            ), 
            json_build_object(
                'attributeId', cottonCertificationAtrId,
                'value', "cottonCertification"
            ),
            json_build_object(
                'attributeId', lintCottonGradeAtrId,
                'value', "grade"
            ),
            json_build_object(
                'attributeId', totalWeightAtrId,
                'value', "totalWeight",
                'quantityUnit', "weightUnit"
            )
    )
    FROM "RawCotton";

    UPDATE "Product"
    SET "createdFacilityId" = "toFacilityId", "certifications" = "uploadProofs"
    FROM (
        SELECT "tsi"."entityId", "tst"."toFacilityId", "tst"."uploadProofs"
        FROM "TransactionItem" "tsi" 
        INNER JOIN "Transaction" "tst" ON tst.id = "tsi"."transactionId"
        INNER JOIN "RawCotton" "rct" ON rct.id = "tsi"."entityId"
        WHERE "tst"."type" = 1 AND "uploadProofs" <> '{}'
    ) "rawCottonTransaction"
    WHERE "Product"."id" = "rawCottonTransaction"."entityId";

    INSERT INTO "Product" (
        "id", "productDefinitionId", "code", "dnaIdentifier", "verifiedPercentage", "notVerifiedPercentage", "isPurchased", "isSold", "isTransformed", 
        "isTransported", "createdFacilityId", "createdAt", "updatedAt", "isManualAdded", "quantity", "quantityUnit", "certifications", "additionalAttributes"
    )
    SELECT "id", lotProductionDefinitionId, "lotCode", "dnaIdentifier", "verifiedPercentage", "notVerifiedPercentage",
        "isPurchased", "isSold", "isTransformed", "isTransported", "createdFacilityId", "createdAt", "updatedAt", "isManualAdded", 
        "totalWeight", "weightUnit", 
        CASE 
            WHEN "uploadProofs"->>0 IS NOT NULL 
            THEN json_build_array(json_build_object(
                    'fileName', 'fileName',
                    'blobName', "uploadProofs"->>0
            ))
        END,
        json_build_array(
            json_build_object(
                'attributeId', productIdAtrId,
                'value', "lotCode"
            ),
            json_build_object(
                'attributeId', trashContentAtrId,
                'value', "trashContent"
            ), json_build_object(
                'attributeId', moistureLevelAtrId,
                'value', "moistureLevel"
            ), 
            json_build_object(
                'attributeId', cottonCertificationAtrId,
                'value', "cottonCertification"
            ),
            json_build_object(
                'attributeId', seedCottonGradeAtrId,
                'value', "grade"
            ),
            json_build_object(
                'attributeId', totalWeightAtrId,
                'value', "totalWeight",
                'quantityUnit', "weightUnit"
            ),
            json_build_object(
                'attributeId', priceAtrId,
                'value', "price",
                'quantityUnit', "currency"
            ),
            json_build_object(
                'attributeId', originAtrId,
                'value', json_build_object(
                    'countryId', "countryId",
                    'provinceId', "provinceId",
                    'districtId', "districtId"
            ))
        )
    FROM "Lot";

    INSERT INTO "Product" (
        "id", "productDefinitionId", "code", "dnaIdentifier", "verifiedPercentage", "notVerifiedPercentage", "isPurchased", "isSold", "isTransformed", 
        "isTransported", "createdFacilityId", "createdAt", "updatedAt", "isManualAdded", "quantity", "quantityUnit", "certifications","additionalAttributes"
    )
    SELECT "id", yarnProductionDefinitionId, "code", "dnaIdentifier", "verifiedPercentage", "notVerifiedPercentage", "isPurchased", "isSold", "isTransformed", 
        "isTransported", "createdFacilityId", "createdAt", "updatedAt", false, "totalWeight", "weightUnit", 
        CASE 
            WHEN "uploadProofs"->>0 IS NOT NULL 
            THEN json_build_array(json_build_object(
                    'fileName', 'fileName',
                    'blobName', "uploadProofs"->>0
            ))
        END,
        json_build_array(
            json_build_object(
                'attributeId', productIdAtrId,
                'value', "code"
            ), 
            json_build_object(
                'attributeId', totalWeightAtrId,
                'value', "totalWeight",
                'quantityUnit', "weightUnit"
            ), 
            json_build_object(
                'attributeId', descriptionAtrId,
                'value', "description"
            )
        ) 
    FROM "Yarn";

    INSERT INTO "Product" (
        "id", "productDefinitionId", "code", "dnaIdentifier", "verifiedPercentage", "notVerifiedPercentage", "isPurchased", "isSold", "isTransformed", 
        "isTransported", "createdFacilityId", "createdAt", "updatedAt", "isManualAdded", "quantity", "quantityUnit", "certifications","additionalAttributes"
    )
    SELECT "id", fabricProductionDefinitionId, "code", "dnaIdentifier", "verifiedPercentage", "notVerifiedPercentage", "isPurchased", "isSold", "isTransformed", 
        "isTransported", "createdFacilityId", "createdAt", "updatedAt", false, "totalWeight", "weightUnit", 
        CASE 
            WHEN "uploadProofs"->>0 IS NOT NULL 
            THEN json_build_array(json_build_object(
                    'fileName', 'fileName',
                    'blobName', "uploadProofs"->>0
            ))
        END,
        json_build_array(
            json_build_object(
                'attributeId', productIdAtrId,
                'value', "code"
            ), 
            json_build_object(
                'attributeId', totalWeightAtrId,
                'value', "totalWeight",
                'quantityUnit', "weightUnit"
            ), 
            json_build_object(
                'attributeId', descriptionAtrId,
                'value', "description"
            )
        )
    FROM "Fabric";

    UPDATE "Product"
    SET "additionalAttributes" = "additionalAttributes"::jsonb || json_build_object(
                'attributeId', attachmentsAtrId,
                'value', "certifications"
            )::jsonb
    WHERE "certifications" IS NOT NULL;

    ALTER TABLE "Product" ALTER "createdFacilityId" SET NOT NULL;
END
$$;