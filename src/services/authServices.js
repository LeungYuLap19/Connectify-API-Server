const db = require('../config/firebase');
const bcrypt = require('bcrypt'); 

const usersCollection = db.collection('users');

async function createUser(userData) {
    try {
        const { password, ...userDataWithoutPassword } = userData;

        await checkEmailUsed(userDataWithoutPassword.email);
        await checkUsernameUsed(userDataWithoutPassword.username);

        const hashedPassword = await bcrypt.hash(password, 10);
        const userDataWithHashedPassword  = { ...userDataWithoutPassword, password: hashedPassword };

        const userRef = usersCollection.doc(); 
        await userRef.set(userDataWithHashedPassword);
        console.log('User added successfully');

        return { id: userRef.id, ...userDataWithoutPassword };
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

async function checkEmailUsed(email) {
    const existingUserWithEmail = await usersCollection.where('email', '==', email).get();
    if (!existingUserWithEmail.empty) {
        throw new Error('Email already in use');
    }
}

async function checkUsernameUsed(username) {
    const existingUserWithUsername = await usersCollection.where('username', '==', username).get();
    if (!existingUserWithUsername.empty) {
        throw new Error('Username already in use');
    }
}

async function userLogin(identifier, password) {
    try {
        let userDoc = await findUserByIdentifier(identifier);

        if (userDoc) {
            const userData = userDoc.data(); // Access the document data
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                delete userData.password;
                return {id: userDoc.id, ...userData};
            } else {
                throw new Error('Incorrect password');
            }
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}

async function findUserByIdentifier(identifier) {
    let userDoc;

    if (identifier.includes('@')) {
        const querySnapshot = await usersCollection.where('email', '==', identifier).get();
        userDoc = querySnapshot.docs[0];
        
    } else {
        const querySnapshot = await usersCollection.where('username', '==', identifier).get();
        userDoc = querySnapshot.docs[0];
    }

    return userDoc;
}


module.exports = {
    createUser,
    userLogin,
}