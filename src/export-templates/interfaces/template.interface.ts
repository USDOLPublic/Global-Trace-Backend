import { SelectableCell } from '~export-templates/interfaces/selectable-cell.interface';

export interface TemplateInterface<T> {
    businessName: T;
    businessRegisterNumber: T;
    oarId: T;
    firstName: T;
    lastName: T;
    email: T;
    selectableCells?: SelectableCell[];
    isBlankRow: boolean;
    type?: T;
    typeId?: T;
}
