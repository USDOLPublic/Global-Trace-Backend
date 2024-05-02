import { ValueTransformer } from 'typeorm';
import { StorageService } from '@diginexhk/nestjs-storage';

export class ImageTransformer implements ValueTransformer {
    to(value) {
        if (!value) {
            return value;
        }
        return {
            origin: value.origin,
            thumbnail: value.thumbnail
        };
    }

    from(value) {
        if (value) {
            return {
                ...value,
                originUrl: StorageService.instance.getFileUrl(value.origin),
                thumbnailUrl: StorageService.instance.getFileUrl(value.thumbnail)
            };
        }
        return null;
    }
}
