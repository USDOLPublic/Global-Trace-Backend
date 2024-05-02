import { CountryEntity } from '~locations/entities/country.entity';

export function trimDistrictName(name: string): string {
    if (name) {
        return name.replace(' District', '').replace(' district', '');
    }
    return name;
}

export function trimProvinceName(name: string): string {
    if (name) {
        return name.replace(' Province', '').replace(' province', '');
    }
    return name;
}

export function sortCountries(countries: CountryEntity[]): CountryEntity[] {
    return countries.sort((a, b) => {
        if (a.country === 'Pakistan') {
            return -1;
        } else if (b.country === 'Pakistan') {
            return 1;
        }
        if (a.country === 'Other') {
            return 1;
        } else if (b.country === 'Other') {
            return -1;
        }
        return 0;
    });
}
