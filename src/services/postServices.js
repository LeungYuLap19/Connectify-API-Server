const fbAdmin = require('../config/firebase');
const { uploadImage, getImage } = require('./storageServices');

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

async function getPostsByUserId(userid) {
    try {
        const querySnapshot = await postsCollection.where('userid', '==', userid).get();
    
        const posts = [];
        for (const doc of querySnapshot.docs) {
            const postData = doc.data();

            // Retrieve base64-encoded images for each photo path
            const images64 = await Promise.all(postData.photo.map(imagePath => {
                return getImage(imagePath);
            }));

            // Replace photo paths with base64-encoded images
            postData.photo = images64;

            posts.push(postData);
        }
    
        return posts;
    } catch (error) {
      console.error('Error retrieving posts', error);
      throw error;
    }
  }

module.exports = {
    createPost,
    getPostsByUserId
}