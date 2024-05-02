import crypto from 'crypto';
import { isString, trim } from 'lodash';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import moment from 'moment';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export function makeAToken() {
    return crypto.createHash('md5').update(randomStringGenerator()).digest('hex');
}

export function replaceSpace(value: string) {
    return value.replace(/\s+/g, '');
}

export function isUuidV4(value: string): boolean {
    return isString(value) && value.length && uuidValidate(value) && uuidVersion(value) === 4;
}

export function convertStringToBoolean(value: string | string[]): boolean | boolean[] {
    if (typeof value === 'object') {
        return value.map((str) => JSON.parse(str));
    }
    return JSON.parse(value);
}

export function convertStringFullTextSearch(keyWord: string): string {
    return keyWord
        .split(' ')
        .filter((el) => el)
        .map((item) => `${item}:*`)
        .join(' & ');
}

export function buildTsVector(fields: string[]) {
    return fields.join(` || ' ' || `);
}

export function replaceSpecialCharactersIfExist(text: string, specialCharacters: RegExp = /[`!&()':|<]/g): string {
    if (specialCharacters.test(text)) {
        return text.replace(specialCharacters, '');
    }
    return text;
}

export function toPercentage(number: number) {
    return `${(number || 0) * 100}%`;
}

export function generalStringCode(prefix: string = '') {
    const randomNumber = crypto.randomInt(100, 999);
    const timestamp = moment().unix();
    return `${prefix}${timestamp}${randomNumber}`;
}

export function transformToNullIfEmpty(value: string): string {
    if (typeof value == 'string' && trim(value) === '') {
        return null;
    }
    return value;
}

export function trimValue(value: string): string {
    value = trim(value);
    if (value === '') {
        return null;
    }
    return value;
}

export function fileNameFromBlob(blobName: string): string {
    return blobName.replace(/\b[a-f\d-]{37}\b/, '');
}

export function transformToArrayIfString<T>(value: T): string[] | T {
    if (typeof value == 'string') {
        return value.split(',');
    }
    return value;
}

export function isArrayContained(firstArr: string[], secondArray: string[]) {
    return firstArr.every((element) => secondArray.includes(element));
}

export function convertStringToSearch(text: string): string {
    const regex = /([`!&()':|<%])/g;
    return regex.test(text) ? text.replace(regex, '\\$1') : text;
}

export function capitalizeFirstWord(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
