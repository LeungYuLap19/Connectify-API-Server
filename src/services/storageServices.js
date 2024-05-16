const fbAdmin = require('../config/firebase');

async function uploadImage(image64, folderName, fileName) {
    const matches = image64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid image format');
    }

    const mimeType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from (base64, 'base64');

    const blob = fbAdmin.storage.file(`${folderName}/${fileName}`);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: mimeType,
        },
    });

    return new Promise((res, rej) => {
        blobStream.on('error', (err) => {
            rej(err);
        });

        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${fbAdmin.storage.name}/${blob.name}`;
            res(publicUrl);
        });

        blobStream.end(buffer);
    });
}

module.exports = {
    uploadImage,
}