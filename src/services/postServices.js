const fbAdmin = require('../config/firebase');
const { uploadImage, getImage } = require('./storageServices');

const postsCollection = fbAdmin.db.collection('posts');
const usersCollection = fbAdmin.db.collection('users');
const postidsCollection = fbAdmin.db.collection('postids');

async function createPost(postData) {
    try {
        const postRef = postsCollection.doc();
        const folderName = postRef.id;

        const imageUrls = await Promise.all(postData.photo.map((image, index) => {
            const fileName = `${index}.jpg`;
            return uploadImage(image, folderName, fileName);
        }));

        await postRef.set({...postData, photo: imageUrls});
        await postidsCollection.doc(postRef.id).set({userid: postData.userid});
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
            const postData = await processPostData(doc, true);
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

async function getPostsFromFollowing(userid, lastPostTime = null) {
    try {
        const userRef = usersCollection.doc(userid);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            throw new Error('User not found');
        }

        const userData = userSnapshot.data();
        const followings = userData.followings;

        if (followings.length === 0) {
            return [];
        }

        let query = postsCollection
            .where('userid', 'in', followings)
            .orderBy('postTime', 'desc');

        if (lastPostTime) {
            query = query.startAfter(lastPostTime);
        }

        const querySnapshot = await query.limit(10).get();

        const posts = [];
        for (const doc of querySnapshot.docs) {
            const postData = await processPostData(doc, true);
            posts.push(postData);
        }

        return posts;
    } catch (error) {
        console.error('Error getting posts', error);
        throw error;
    }
}

async function processPostData(doc, feedPost) {
    const postData = {
        id: doc.id,
        ...doc.data()
    };

    if (feedPost) {
        const userSnapshot = await usersCollection.doc(postData.userid).get();
        postData.user = {
            id: userSnapshot.id,
            ...userSnapshot.data(),
        };
        delete postData.user.password;
    }

    const images64 = await Promise.all(postData.photo.map(imagePath => getImage(imagePath)));

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

    return postData;
}

async function getPostByPostid(postid) {
    try {
        const postRef = postsCollection.doc(postid);
        const querySnapshot = await postRef.get();

        if (!querySnapshot.exists) {
            throw new Error('Post not found');
        }

        const postData = await processPostData(querySnapshot, true);
        return postData;
    } catch (error) {
        console.error('Error getting post by ID', error);
        throw error;
    }
}

module.exports = {
    createPost,
    getPostsByUserId,
    toggleLikeOnPost,
    addComment,
    getPostsFromFollowing,
    getPostByPostid,
    processPostData,
}
