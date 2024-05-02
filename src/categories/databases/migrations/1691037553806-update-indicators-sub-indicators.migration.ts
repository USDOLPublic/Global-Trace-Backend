import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';

export class UpdateIndicatorsSubIndicators1691037553806 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const updatedSubIndicators = this.getUpdatedSubIndicators();
        for (const { oldName, newName } of updatedSubIndicators) {
            const items = await queryRunner.query(`SELECT "id" FROM "Category" WHERE "name" = $1`, [oldName]);
            if (!items.length) {
                throw new Error('Sub indicator not found');
            }

            await queryRunner.query('UPDATE "Category" SET "name" = $1 WHERE "name" = $2', [newName, oldName]);
        }

        const deletedSubIndicators = this.getDeletedSubIndicators();
        const sql = format('DELETE FROM "Category" WHERE "name" IN (%L)', deletedSubIndicators);
        await queryRunner.query(sql);
    }

    // eslint-disable-next-line max-lines-per-function
    private getUpdatedSubIndicators() {
        return [
            {
                oldName:
                    'No awareness raising around worker rights, risks related to child labor, or the risk of forced, compulsory, and bonded labour at the ASM site',
                newName:
                    'No awareness raising around worker rights, risks related to child labor, or the risk of forced, compulsory, and bonded labour at the site'
            },
            {
                oldName: 'Workers working underground not using or maintain appropriate, basic PPE',
                newName: 'Workers not using or maintaining appropriate, basic PPE'
            },
            {
                oldName:
                    'AMP found to be linked to committing war crimes or other serious violations of international humanitarian law, crimes against humanity, or genocide',
                newName:
                    'Site found to be linked to committing war crimes or other serious violations of international humanitarian law, crimes against humanity, or genocide'
            },
            {
                oldName: 'Mine site and transportation routes are  illegally controlled by non-state armed groups',
                newName: 'Site and transportation routes are illegally controlled by non-state armed groups'
            },
            {
                oldName:
                    'Pollution of  air (e.g. dust) and soil at the mine site and surrounding communities, including air and soil pollution risks to the mine site and surrounding communities',
                newName: 'Pollution of air (e.g. dust) and soil at the site and surrounding communities'
            },
            {
                oldName:
                    'Tunnels lack adequate ventilation or access to air to enable workers to breathe freely and without danger to their respiratory health',
                newName:
                    'Site lack adequate ventilation or access to air to enable workers to breath freely and without danger to their respiratory health'
            },
            {
                oldName:
                    "Staff wages of salaried employees shall be at or above the minimum wage or are at or above the sector's comparable wages in the country and are paid regularly and on time",
                newName: 'Payment below minimum wage'
            },
            {
                oldName: 'No publicly available minerals sourcing policy',
                newName: 'No publicly available sourcing policy'
            },
            {
                oldName:
                    'Does not require suppliers to exercise due diligence over the minerals supply chain in accordance with the OECD Due Diligence Guidance',
                newName:
                    'Does not require suppliers to exercise due diligence over supply chain in accordance with the OECD Due Diligence Guidance'
            },
            {
                oldName:
                    'No information captured or provided during assessment related to the form, type, weight and physical description of minerals/metals',
                newName:
                    'No information captured or provided during assessment related to the form, type, weight and physical description of products'
            },
            {
                oldName:
                    'Failure to require that suppliers source minerals from mines/traders/smelters whose due diligence practices have been validated by an independent third party audit or assessment program',
                newName:
                    'Failure to require that suppliers whose due diligence practices have been validated by an independent third party audit or assessment program'
            },
            {
                oldName: 'Company does not conduct a supply chain survey(s) of your relevant supplier(s)',
                newName: 'Company does not conduct a supply chain survey of relevant suppliers'
            },
            {
                oldName:
                    "Failure to review due diligence information received from  suppliers against the company's expectations",
                newName: 'Failure to review due diligence information received from suppliers'
            }
        ];
    }

    private getDeletedSubIndicators() {
        return [
            'Non compliance with the legal maximum depth of 30m for the development of excavation tunnels. The organisation will take appropriate measures, including roping off, marking with signposts, prohibiting entry, temporarily closing tunnels at risk of collapse, and implementing a moratorium on furthering non-compliant tunnel depth',
            'Persons under the age of 18 (children) perform any of the following work classified as a worst forms of child labour in the internal supply chain of the AMP: work underground or underwater, work with dangerous machinery and tools, carrying heavy loads, and work that exposes them to hazardous substances'
        ];
    }
}
