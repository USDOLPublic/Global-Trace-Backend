import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { ProvinceEntity } from '~locations/entities/province.entity';
import { ProvinceItemInterface } from '~locations/interfaces/province-item.interface';
import { CustomRepository } from '@diginexhk/typeorm-helper';

@CustomRepository(ProvinceEntity)
export class ProvinceRepository extends BaseRepository<ProvinceEntity> {
    searchByKeyWord(countryId: string, key: string) {
        let query = this.createQueryBuilder('province').where({ countryId });

        if (key) {
            query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(key))
            });
        }

        return query.orderBy({ province: 'ASC' }).getMany();
    }

    async insertOrIgnore(province: ProvinceItemInterface) {
        return this.createQueryBuilder().insert().into(ProvinceEntity).values(province).orIgnore(true).execute();
    }
}
