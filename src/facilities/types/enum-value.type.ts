export type EnumValueType<E, K extends keyof E> = {
    id: string;
    name: E[K];
};
