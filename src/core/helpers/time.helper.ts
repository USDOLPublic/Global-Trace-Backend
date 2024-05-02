import moment from 'moment';

export function isExpire(timestamp: number | Date) {
    return moment().isBefore(moment(timestamp));
}

export function isTimestamp(timestamp: number) {
    return moment.unix(timestamp).isValid();
}

export function now(): Date {
    return new Date();
}

export function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function delayAndExecute<T>(milliseconds: number, fn: T): Promise<T> {
    return new Promise((resolve, reject) => {
        return setTimeout(() => {
            resolve(fn);
        }, milliseconds);
    });
}

export function convertDateToTimestamp(date: Date): number {
    return Math.floor(moment(date, 'DD/MM/YYYY').valueOf() / 1000);
}
