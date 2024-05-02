import fs from 'fs';
import path from 'path';
import format from 'pg-format';
import { EntityManager, QueryRunner } from 'typeorm';
import { env } from '~config/env.config';
import { isArrayEmpty } from '~core/helpers/array.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';

export class ImportUtil {
    static async insertDataWithId(manager: EntityManager, data, table: string): Promise<string> {
        // const value = await manager
        //     .createQueryBuilder()
        //     .insert()
        //     .into(table, Object.keys(data))
        //     .values(data)
        //     // eslint-disable-next-line @typescript-eslint/naming-convention
        //     .orUpdate({ conflict_target: ['id'], overwrite: Object.keys(omit(data, 'id')) })
        //     .execute();
        // return get(value, 'identifiers[0].id', null);
        if (data.hasOwnProperty('id')) {
            await manager.query(`DELETE FROM "${table}" where "id" = '${data.id}'`);
        }

        const columns = Object.keys(data).join('", "');
        const values = Object.values(data);
        const sql = format(`INSERT INTO "${table}" ("${columns}") VALUES (%L) RETURNING "id"`, values);
        const [{ id }] = await manager.query(sql);
        return id;
    }

    static insertAssessmentTemplateWithId(
        manager: EntityManager,
        data: {
            id: string;
            name: string;
            riskScoreLevel: number[];
            isForWorkforce: boolean;
            forEnterpriseType: number[];
            forEnterpriseExtraType: number[];
        }
    ) {
        return this.insertDataWithId(manager, data, 'SelfAssessmentTemplate');
    }

    static insertAssessmentGroupWithId(
        manager: EntityManager,
        data: {
            id: string;
            title: string;
            order: number;
            forRole: UserRoleEnum;
        }
    ) {
        if (!data.id) {
            throw new Error(`Group "${data.title}" must have id`);
        }
        return this.insertDataWithId(manager, { ...data }, 'SelfAssessmentGroup');
    }

    static insertAssessmentQuestionWithId(
        manager: EntityManager,
        data: {
            id: string;
            groupId: string;
            title: string;
            order: number;
            type: SelfAssessmentQuestionTypesEnum;
            isRequired: boolean;
            conditions: any;
            metadata: any;
        }
    ) {
        if (!data.id) {
            throw new Error(`Question "${data.title}" must have id`);
        }
        return this.insertDataWithId(manager, data, 'SelfAssessmentQuestion');
    }

    static async addQuestionsToDB(manager: EntityManager, questions, groupId: string) {
        await Promise.all(
            questions.map(async (questionData) => {
                await this.insertAssessmentQuestionWithId(manager, {
                    groupId: groupId,
                    id: questionData.id,
                    title: questionData.title,
                    order: questionData.order,
                    type: questionData.type,
                    isRequired: questionData.isRequired,
                    conditions: questionData.conditions,
                    metadata: questionData.metadata
                });
            })
        );
    }

    static async addGroupsToDB(manager: EntityManager, group: NodeJS.Dict<any>) {
        const groupId = await this.insertAssessmentGroupWithId(manager, {
            id: group.id,
            title: group.groupTitle,
            forRole: group.forRole,
            order: group.order
        });

        if (!isArrayEmpty(group.questions)) {
            await this.addQuestionsToDB(manager, group.questions, groupId);
        }
    }

    static async addDataToDB(manager: EntityManager, part2) {
        await this.addGroupsToDB(manager, part2);
    }

    static async insertTerms(queryRunner: QueryRunner, saqTemplateId: string, termData: any[]) {
        await Promise.all(
            termData.map(async (data) => {
                data.selfAssessmentTemplateId = saqTemplateId;
                await this.insertDataWithId(queryRunner.manager, data, 'Term');
            })
        );
    }

    static getTemplateInfo(jsonPath: string) {
        const tempaltepart2Path = path.join(env.ROOT_PATH, jsonPath);
        if (fs.existsSync(tempaltepart2Path)) {
            return require(tempaltepart2Path);
        }

        return null;
    }

    static async addTemplates(queryRunner: QueryRunner, linkPath: string) {
        const templateInfo = await this.getTemplateInfo(linkPath);
        if (templateInfo) {
            await this.addDataToDB(queryRunner.manager, templateInfo);
        }
    }
}
