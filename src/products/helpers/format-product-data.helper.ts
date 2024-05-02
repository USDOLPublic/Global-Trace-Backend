import { ProductEntity } from '~products/entities/product.entity';

export function formatProductData(product: ProductEntity): ProductEntity {
    if (!product) {
        return;
    }

    for (const additionalAttribute of product.additionalAttributes) {
        const attributeId = additionalAttribute.attributeId;
        const productDefinitionAttribute = product.productDefinition.productDefinitionAttributes.find(
            (item) => item.attributeId === attributeId
        );

        if (productDefinitionAttribute) {
            additionalAttribute['attribute'] = productDefinitionAttribute.attribute;
        }
    }

    product.isHavingCertification = !!product?.certifications?.length;
    product.certifications = Array.isArray(product.certifications) ? product.certifications : null;

    return product;
}
