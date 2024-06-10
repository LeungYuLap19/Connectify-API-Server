const fuzzysort = require('fuzzysort');
const fbAdmin = require('../config/firebase');
const { uploadImage, getImage } = require('./storageServices');
const usersCollection = fbAdmin.db.collection('users');
const rootFolderName = 'users';

async function searchUsernames(input) {
    try {
        const querySnapshot = await usersCollection.get();
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const results = fuzzysort.go(input, users, { key: 'username' });

        const searchResults = await Promise.all(results.map(async result => {
            delete result.obj.password;

            const icon = result.obj.icon ? await getImage(result.obj.icon) : null;
            const background = result.obj.background ? await getImage(result.obj.background) : null;
            return { ...result.obj, icon: icon, background: background };
        }));
        return searchResults;
    } catch (error) {
        console.error('Error searching usernames:', error);
        throw error;
    }
}

async function getUser(userid) {
    try {
        const userRef = usersCollection.doc(userid);
        const userSnapshot = await userRef.get();
        if (!userSnapshot.exists) {
            throw new Error('User not found');
        }

        const userData = userSnapshot.data();
        delete userData.password;

        const icon = userData.icon ? await getImage(userData.icon) : null;
        const background = userData.background ? await getImage(userData.background) : null;
        return {id: userRef.id, ...userData, icon: icon, background: background};
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}

async function toggleFollowUser(userid, followerid) {
    try {  
        const userRef = usersCollection.doc(userid);
        const followerRef = usersCollection.doc(followerid);
        const userSnapshot = await userRef.get();
        const followerSnapshot = await followerRef.get();

        if (!userSnapshot.exists || !followerSnapshot.exists) {
            throw new Error('User not found');
        }

        const userData = userSnapshot.data();
        const followerData = followerSnapshot.data();

        const userFollowerIndex = userData.followers.indexOf(followerid);
        const followerFollowingIndex = followerData.followings.indexOf(userid);

        let updatedFollowers;
        let updatedFollowings;
        if (userFollowerIndex === -1 && followerFollowingIndex === -1) {
            updatedFollowers = [...userData.followers, followerid];
            updatedFollowings = [...followerData.followings, userid];
        }
        else {
            updatedFollowers = [...userData.followers];
            updatedFollowings = [...followerData.followings];
            updatedFollowers.splice(userFollowerIndex, 1);
            updatedFollowings.splice(followerFollowingIndex, 1);
        }

        await userRef.update({ followers: updatedFollowers });
        await followerRef.update({ followings: updatedFollowings });

        return { updatedFollowers, updatedFollowings };
        
    } catch (error) {
        console.error('Error toggling follow:', error);
        throw error;
    }
}

async function getListUsers(list) {
    try {
        const userPromises = list.map(async userid => {
            return await getUser(userid);
        });
        const users = await Promise.all(userPromises);
    
        return users;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}

async function setIcon(userid, image) {
    try {
        const userRef = usersCollection.doc(userid);
        const userSnapshot = await userRef.get();
        const userData = userSnapshot.data();
        const fileName = 'icon';

        const imageUrl = await uploadImage(image, rootFolderName, userid, fileName);

        await userRef.set({ ...userData, icon: imageUrl });
        return true;
    } catch (error) {
        console.error('Error setting icon', error);
        throw error;
    }
}

async function setBackground(userid, image) {
    try {
        const userRef = usersCollection.doc(userid);
        const userSnapshot = await userRef.get();
        const userData = userSnapshot.data();
        const fileName = 'background';

        const imageUrl = await uploadImage(image, rootFolderName, userid, fileName);

        await userRef.set({ ...userData, background: imageUrl });
        return true;
    } catch (error) {
        console.error('Error setting background', error);
        throw error;
    }
}

module.exports = {
    searchUsernames,
    getUser,
    toggleFollowUser,
    getListUsers,
    setIcon,
    setBackground
}