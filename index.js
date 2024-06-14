require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authRouters = require('./src/routers/authRouters');
const postRouters = require('./src/routers/postRouters');
const userRouters = require('./src/routers/userRouters');
const notificationRouters = require('./src/routers/notificationRouters');
const messageRouters = require('./src/routers/messageRouters');
const discoveryRouters = require('./src/routers/discoveryRouters');
const tokenRouters = require('./src/routers/tokenRouters');
const { accessTokenAuthentication } = require('./src/controllers/tokenControllers');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your actual frontend URL
    credentials: true, // Allows cookies to be sent with requests
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
    if (req.url.startsWith('/auth') || req.url.startsWith('/token')) {
        return next()
    }
    accessTokenAuthentication(req, res, next);
});
app.use('/auth', authRouters);
app.use('/post', postRouters);
app.use('/user', userRouters);
app.use('/notification', notificationRouters);
app.use('/message', messageRouters);
app.use('/discovery', discoveryRouters);
app.use('/token', tokenRouters);

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
