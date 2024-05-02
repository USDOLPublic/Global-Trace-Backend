export const assessmentDocumentFilter = (req, file, fileTypes, callback) => {
    const splitFileName = file.originalname.split('.');
    if (splitFileName.length < 2 || !fileTypes.includes(splitFileName.pop().toLowerCase())) {
        req.fileValidationError = true;
        return callback(null, false);
    }
    callback(null, true);
};
