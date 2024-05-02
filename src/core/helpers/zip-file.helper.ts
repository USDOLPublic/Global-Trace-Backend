import { Response } from 'express';

export const setHeaderDownloadZipFile = (res: Response, fileName: string) => {
    res.set({
        /* eslint-disable @typescript-eslint/naming-convention */
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}.zip"`
        /* eslint-enable @typescript-eslint/naming-convention */
    });
};
