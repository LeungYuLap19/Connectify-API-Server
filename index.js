const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRouters = require('./src/routers/authRouters');
const postRouters = require('./src/routers/postRouters');
const userRouters = require('./src/routers/userRouters');
const notificationRouters = require('./src/routers/notificationRouters');
const messageRouters = require('./src/routers/messageRouters');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());

app.use('/auth', authRouters);
app.use('/post', postRouters);
app.use('/user', userRouters);
app.use('/notification', notificationRouters);
app.use('/message', messageRouters);

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
