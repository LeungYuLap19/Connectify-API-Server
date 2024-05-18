const fbAdmin = require('../config/firebase');
const { uploadImage, getImage } = require('./storageServices');

const postsCollection = fbAdmin.db.collection('posts');
const usersCollection = fbAdmin.db.collection('users');

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

            for (const comment of postData.comments) {
                const userSnapshot = await usersCollection.doc(comment.userid).get();
                comment.user = {
                    username: userSnapshot.data().username,
                    icon: userSnapshot.data().icon,
                    userid: userSnapshot.id
                };
            }

            postData.comments.sort((a, b) => new Date(b.commentTime) - new Date(a.commentTime));

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

async function addComment(comment, postid) {
    try {   
        const postRef = postsCollection.doc(postid);
        const querySnapshot = await postRef.get();

        if (!querySnapshot.exists) {
            throw new Error('Post not found');
        } 

        const postData = querySnapshot.data();
        let updatedComments = [...postData.comments, comment];

        const userSnapshot = await usersCollection.doc(comment.userid).get();
        comment.user = {
            username: userSnapshot.data().username,
            icon: userSnapshot.data().icon,
            userid: userSnapshot.id
        };
        await postRef.update({ comments: updatedComments });

        updatedComments.sort((a, b) => new Date(b.commentTime) - new Date(a.commentTime));
        return updatedComments;
    } catch (error) {
        console.error('Error adding comment', error);
        throw error;
    }
}

module.exports = {
    createPost,
    getPostsByUserId,
    toggleLikeOnPost,
    addComment,
}