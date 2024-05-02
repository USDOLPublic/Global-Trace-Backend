export function getFileName(existingFiles: string[], originalFileName: string): string {
    let fileName: string = originalFileName;
    let i: number = 0;
    while (true) {
        if (!existingFiles.includes(fileName)) {
            existingFiles.push(fileName);
            return fileName;
        }

        fileName = appendToFilename(originalFileName, ` (${i + 1})`);
        i++;
    }
}

export function appendToFilename(fileName: string, suffix: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex == -1) {
        return fileName + suffix;
    }
    return fileName.substring(0, dotIndex) + suffix + fileName.substring(dotIndex);
}
