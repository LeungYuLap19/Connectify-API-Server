const authServices = require('../services/authServices');

async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;
        const userData = {
            username,
            email,
            password,
            icon: null,
            background: null,
            followers: [],
            followings: []
        }
        const userDataWithoutPassword = await authServices.createUser(userData);
        const { refreshToken, accessToken } = userDataWithoutPassword.tokens;
        delete userDataWithoutPassword.tokens;

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'Strict'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'Strict'
        });
        res.status(201).json({ 
            message: 'User created successfully',
            data: userDataWithoutPassword
        });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.message === 'Email already in use') {
            return res.status(400).json({ error: 'Email already in use' });
        }
        if (error.message === 'Username already in use') {
            return res.status(400).json({ error: 'Username already in use' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function userLogin(req, res) {
    try {
        const { identifier, password, rememberMe } = req.body;
        const userData = await authServices.userLogin(identifier, password, rememberMe);
        const { refreshToken, accessToken } = userData.tokens;
        delete userData.tokens;

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'Strict'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'Strict'
        });
        res.status(200).json({ 
            message: 'User login successfully',
            data: userData
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        if (error.message === 'Incorrect password') {
            return res.status(400).json({ error: 'Incorrect password' });
        }
        if (error.message === 'User not found') {
            return res.status(400).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createUser,
    userLogin,
}