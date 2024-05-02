import { SupplierMapElementType } from './supplier-map-element.type';

export type TypeMapElementType = {
    type: string;
    roleId: string;
    suppliers: SupplierMapElementType[];
};
