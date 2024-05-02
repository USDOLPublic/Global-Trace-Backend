import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { DistrictEntity } from '~locations/entities/district.entity';
import { CustomRepository } from '@diginexhk/typeorm-helper';

@CustomRepository(DistrictEntity)
export class DistrictRepository extends BaseRepository<DistrictEntity> {
    searchByKeyWord(provinceId: string, key: string) {
        let query = this.createQueryBuilder('district').where({ provinceId });

        if (key) {
            query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(key))
            });
        }

        return query.orderBy({ district: 'ASC' }).getMany();
    }
}
