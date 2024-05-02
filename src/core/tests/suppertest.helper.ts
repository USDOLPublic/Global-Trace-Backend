import request from 'supertest';
import superagent from 'superagent';
import { get, has } from 'lodash';
import { HttpStatus } from '@nestjs/common';

const test = (request as any).Test;
declare module 'supertest' {
    interface Test extends superagent.SuperAgentRequest {
        authenticate(token: string): this;

        setHeader(key: string, value: string): this;

        has(keys: string | string[]): this;

        notHas(keys: string | string[]): this;

        assertValue(key: string, value): this;

        isOk(): this;

        isAuthError(): this;

        isValidateError(): this;

        isForbiddenError(): this;

        isBadRequestError(): this;

        isNoContent(): this;

        isNotFound(): this;

        isCreated(): this;

        isPagination(dataKey?: string): this;
    }
}

test.prototype.authenticate = function (token) {
    return this.set('Authorization', `Bearer ${token}`);
};

test.prototype.setHeader = function (key, value) {
    return this.set(key, value);
};

test.prototype.isOk = function () {
    return this.expect(HttpStatus.OK);
};

test.prototype.isNotFound = function () {
    return this.expect(HttpStatus.NOT_FOUND);
};

test.prototype.isAuthError = function () {
    return this.expect(HttpStatus.UNAUTHORIZED);
};

test.prototype.isValidateError = function () {
    return this.expect(HttpStatus.UNPROCESSABLE_ENTITY);
};

test.prototype.isForbiddenError = function () {
    return this.expect(HttpStatus.FORBIDDEN);
};

test.prototype.isBadRequestError = function () {
    return this.expect(HttpStatus.BAD_REQUEST);
};

test.prototype.isNoContent = function () {
    return this.expect(HttpStatus.NO_CONTENT);
};

test.prototype.isCreated = function () {
    return this.expect(HttpStatus.CREATED);
};

test.prototype.isPagination = function (dataKey?: string) {
    const paginationKeys = ['total', 'lastPage', 'perPage', 'currentPage'];
    if (dataKey) {
        return this.expect(function (res) {
            for (let key of paginationKeys) {
                if (!has(res.body[dataKey], key)) {
                    throw new Error('Response do not contains key ' + key);
                }
            }
        });
    } else {
        return this.has(paginationKeys);
    }
};

test.prototype.has = function (keys: string | string[]) {
    return this.expect(function (res) {
        if (typeof keys === 'string') {
            if (!has(res.body, keys)) {
                throw new Error('Response do not contains key ' + keys);
            }
        } else {
            for (let key of keys) {
                if (!has(res.body, key)) {
                    throw new Error('Response do not contains key ' + key);
                }
            }
        }
    });
};

test.prototype.notHas = function (keys: string | string[]) {
    return this.expect(function (res) {
        if (typeof keys === 'string') {
            if (has(res.body, keys)) {
                throw new Error('Response contains key ' + keys);
            }
        } else {
            for (let key of keys) {
                if (has(res.body, key)) {
                    throw new Error('Response contains key ' + key);
                }
            }
        }
    });
};

test.prototype.assertValue = function (key: string, value: any) {
    return this.expect(function (res) {
        let body = res.body;
        if (get(body, key) !== value) {
            throw new Error(`${key} not equal ${value}. Value is ${get(body, key)}`);
        }
    });
};
