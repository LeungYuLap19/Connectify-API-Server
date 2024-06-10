const fbAdmin = require('../config/firebase');

async function uploadImage(image64, rootFolderName, folderName, fileName) {
    const matches = image64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid image format');
    }

    const mimeType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from (base64, 'base64');

    const blob = fbAdmin.storage.file(`${rootFolderName}/${folderName}/${fileName}`);
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
            const publicUrl = `${blob.name}`;
            res(publicUrl);
        });

        blobStream.end(buffer);
    });
}

async function getImage(filePath) {
  const file = fbAdmin.storage.file(filePath);

  return new Promise((resolve, reject) => {
    file.download((err, contents) => {
      if (err) {
        reject(err);
      } else {
        const base64 = contents.toString('base64');
        const mimeType = 'image/jpeg'; 

        const dataUrl = `data:${mimeType};base64,${base64}`;
        resolve(dataUrl);
      }
    });
  });
}

module.exports = {
    uploadImage,
    getImage
}