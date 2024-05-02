import { PromisePropType } from '~core/types/promise-prop.type';
import { PromisePropResultType } from '~core/types/promise-prop-result.type';

export function promiseProps<T>(obj: PromisePropType<T>): Promise<PromisePropResultType<T>> {
    const keys = Object.keys(obj);
    const promises = Object.values(obj);

    return Promise.all(promises).then((results: T[]) =>
        keys.reduce(
            (acc: PromisePropResultType<T>, key: string, index: number) => ({ ...acc, [key]: results[index] }),
            {}
        )
    );
}
