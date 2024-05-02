import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Workbook } from 'exceljs';

export function fileName(file: Express.Multer.File) {
    const fileExtName = extname(file.originalname);
    return `${uuidv4()}${fileExtName}`;
}

export async function initWorkbook(fileOrStream: Express.Multer.File | NodeJS.ReadableStream) {
    const workbook = new Workbook();
    const isFileStream = !(fileOrStream as Express.Multer.File).originalname;

    if (isFileStream) {
        await workbook.xlsx.read(fileOrStream as NodeJS.ReadableStream);
    } else {
        await workbook.xlsx.load((fileOrStream as Express.Multer.File).buffer);
    }

    return workbook;
}
