const fbAdmin = require('../config/firebase');
const { uploadImage } = require('./storageServices');

const postsCollection = fbAdmin.db.collection('posts');

async function createPost(postData) {
    try {
        const postRef = postsCollection.doc();
        const folderName = postRef.id;

        const imageUrls = await Promise.all(postData.photo.map((image, index) => {
            const fileName = `${index}.jpg`;
            return uploadImage(image, folderName, fileName);
        }));

        await postRef.set({...postData, photo: imageUrls});
        return true;
    } catch (error) {
        console.error('Error creating post', error);
        throw error;
    }
}

module.exports = {
    createPost,
}