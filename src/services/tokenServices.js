const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION;
const REFRESH_TOKEN_EXPIRATION_SHORT = process.env.REFRESH_TOKEN_EXPIRATION_SHORT;
const REFRESH_TOKEN_EXPIRATION_LONG = process.env.REFRESH_TOKEN_EXPIRATION_LONG;

function generateAccessToken(userid) {
    return jwt.sign({userid}, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
}

function generateRefreshToken(userid, rememberMe) {
    const expiresIn = rememberMe ? REFRESH_TOKEN_EXPIRATION_LONG : REFRESH_TOKEN_EXPIRATION_SHORT;
    return jwt.sign({userid}, REFRESH_TOKEN_SECRET, { expiresIn });
}

function verifyAccessToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};