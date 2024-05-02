const lat = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
const long = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/;

const latDMS = /^(([1-8]?\d)\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|90\D+0\D+0)\D+[NSns]?$/i;
const longDMS = /^\s*([1-7]?\d{1,2}\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|180\D+0\D+0)\D+[EWew]?$/i;

/**
 * This function is taken from validator lib
 * @param latLong: String
 * @param options: { checkDMS? : boolean }
 */
export function isLatLong(latLong: string, options: { checkDMS?: boolean } = {}) {
    if (!latLong.includes(',')) return false;

    const pair = latLong.split(',');
    if (
        (pair[0].startsWith('(') && !pair[1].endsWith(')')) ||
        (pair[1].endsWith(')') && !pair[0].startsWith('(')) ||
        !isValidLatitude(Number(pair[0])) ||
        !isValidLatitude(Number(pair[1]))
    )
        return false;

    if (options.checkDMS) {
        return latDMS.test(pair[0]) && longDMS.test(pair[1]);
    }

    return lat.test(pair[0]) && long.test(pair[1]);
}

export function isValidLatitude(latitude: number): boolean {
    return latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(longitude: number): boolean {
    return longitude >= -180 && longitude <= 180;
}
