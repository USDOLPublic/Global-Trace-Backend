import { OmitType } from '@nestjs/swagger';
import { AddOrderSupplierDto } from './add-order-supplier.dto';

export class EditOrderSupplierDto extends OmitType(AddOrderSupplierDto, ['parentId']) {}
