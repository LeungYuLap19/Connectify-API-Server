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
            const postData = {
                id: doc.id,
                ...doc.data()
            };

            const images64 = await Promise.all(postData.photo.map(imagePath => {
                return getImage(imagePath);
            }));

            postData.photo = images64;

            posts.push(postData);
        }
        posts.sort((a, b) => new Date(b.postTime) - new Date(a.postTime));
        return posts;
    } catch (error) {
      console.error('Error retrieving posts', error);
      throw error;
    }
}

async function toggleLikeOnPost(postid, userid) {
    try {
        const postRef = postsCollection.doc(postid);
        const querySnapshot = await postRef.get();

        if (!querySnapshot.exists) {
            throw new Error('Post not found');
        } 

        const postData = querySnapshot.data();
        const userLikedIndex = postData.likes.indexOf(userid);

        let updatedLikes;
        if (userLikedIndex === -1) {
            updatedLikes = [...postData.likes, userid];
        }
        else {
            updatedLikes = [...postData.likes];
            updatedLikes.splice(userLikedIndex, 1);
        }

        await postRef.update({ likes: updatedLikes });
        return updatedLikes;

    } catch (error) {
        console.error('Error toggling like on post', error);
        throw error;
    }
}

module.exports = {
    createPost,
    getPostsByUserId,
    toggleLikeOnPost,
}