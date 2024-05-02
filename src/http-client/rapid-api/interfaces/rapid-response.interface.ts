interface RapidResponseLinkInterface {
    ref: string;
    href: string;
}

export interface RapidResponseInterface {
    links: RapidResponseLinkInterface[];
    metadata: {
        currentOffset: number;
        totalCount: number;
    };
}
