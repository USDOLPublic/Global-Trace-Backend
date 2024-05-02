export async function allSettled<T>(values: Promise<T>[]): Promise<T[]> {
    const results = await Promise.allSettled(values);

    const rejectedPromise = results.find((item) => item.status === 'rejected');
    if (rejectedPromise) {
        throw (rejectedPromise as any).reason;
    }

    return results.map((item: any) => item.value);
}
