const tokenServices = require('../services/tokenServices');
const userServices = require('../services/userServices');
const jwt = require('jsonwebtoken');

function accessTokenAuthentication(req, res, next) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).send('Access token missing');
    }

    try {
        const userid = tokenServices.verifyAccessToken(accessToken);
        if (!userid) {
            return res.status(403).send('Invalid access token');
        }
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).send('Access token expired');
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(403).send('Invalid access token');
        }
        return res.status(500).send('Internal server error');
    }
}

// use when app on init
async function refreshAccessToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).send('Refresh token missing');
    }

    try {
        const userid = tokenServices.verifyRefreshToken(refreshToken);
        if (!userid) {
            return res.status(403).send('Invalid refresh token');
        }
        const newAccessToken = tokenServices.generateAccessToken(userid);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            sameSite: 'Strict'
        });
        const userData = await userServices.getUser(userid.userid);
        res.status(200).json({ data: userData });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).send('Refresh token expired, please log in again');
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(403).send('Invalid refresh token');
        } else {
            console.error(err)
            return res.status(500).send('Internal server error');
        }
    }
}

function cleanTokens(req, res) {
    res.cookie('accessToken', '', { 
        httpOnly: true, 
        sameSite: 'Strict',
        expires: new Date(0) 
    });
    res.cookie('refreshToken', '', { 
        httpOnly: true, 
        sameSite: 'Strict',
        expires: new Date(0) 
    });

    res.status(200).send('Logged out successfully');
}

module.exports = {
    refreshAccessToken,
    accessTokenAuthentication,
    cleanTokens,
}