const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const secretKey = 'My Secret Key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256'],
});

let users = [
    {
        id: 1,
        username: 'Bharath',
        password: '2000'
    },
    {
        id: 2,
        username: 'Raj',
        password: '2000'
    },
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
        return;
    }

    if (password === user.password) {
        let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: 180 }); 
        res.json({
            success: true,
            err: null,
            token
        });
    } else {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

app.get('/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged-in people can see'
    });
});

app.get('/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the settings page'
        
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect'
        });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
