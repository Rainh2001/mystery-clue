const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RefreshToken = require('../model/RefreshToken');
const User = require('../model/User');


// Register
router.post('/register', async (req, res) => {
    if(req.body.code !== "Holloway") return res.status(400).send({ error: "invalid code"});

    // Check no other users with req.body.username
    try {
        const user = await User.findOne({ username: req.body.username });
        if(user) return res.status(400).send({ error: "username taken" });
    } catch(err){
        console.log(err);
    }

    if(!req.body.password){
        return res.status(400).send({ error: "missing fields" });
    }

    const body = Object.assign({}, req.body);
    body.password = await bcrypt.hash(body.password, 10);

    if(body.accountType) return res.status(400).send({ error: "cannot set account type at this time" });

    const user = new User(body);

    console.log(`${body.username} registered`);

    await user.save().then(() => {
        res.status(200).send({ message: "success" });
    }).catch(err => {
        res.status(400).send({ error: "information validation failure" });
    });

});

// Login
router.post('/login', async (req, res) => {

    if(!(req.body.password && req.body.username)){
        return res.status(400).send({ error: "bad request" });
    }

    try {
        const user = await User.findOne({ username: req.body.username });
        if(!user) return res.status(400).send({ error: "user does not exist" });
        if(!(await bcrypt.compare(req.body.password, user.password))) return res.status(400).send({ error: "invalid login "});
    } catch(err){
        return res.status(400).send({ error: "failed to login"});
    }

    const accessToken = generateAccessToken(req.body.username);
    const refreshToken = generateRefreshToken(req.body.username);

    console.log(`${req.body.username} logged in`);

    const refresh = new RefreshToken({ token: refreshToken, username: req.body.username });
    await refresh.save().then(() => {
        res.cookie("accessToken", accessToken, { httpOnly: true, expires: new Date(Date.now() + Number(process.env.ACCESS_TOKEN_MINUTES) * 60000) });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, expires: new Date(Date.now() + Number(process.env.REFRESH_TOKEN_DAYS) * 24 * 60 * 60 * 1000) });
        res.status(200).send({ message: "success" });
    }).catch(err => {
        res.status(400).send({ error: "failed to generate tokens" });
    });

    // const tokens = await RefreshToken.find((err, tokens) => {
    //     if(err) return console.log(err)
    // })
    // console.log(tokens)
});

// Get AccessToken with RefreshToken
router.get('/token', async (req, res) => {
    const refreshToken = req.cookies["refreshToken"];
    if(!refreshToken) return res.status(400).send({ error: "invalid refresh token" });

    try {
        const refresh = await RefreshToken.findOne({ token: refreshToken });
        if(!refresh) return res.status(400).send({ error: "invalid refresh token" });
    }catch(err){
        return res.status(400).send({ error: "invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(400).send({ error: "invalid refresh token" });
        const accessToken = generateAccessToken(user.username);
        res.cookie("accessToken", accessToken, { httpOnly: true, expires: new Date(Date.now() + Number(process.env.ACCESS_TOKEN_MINUTES) * 60000) });
        res.status(200).send({ message: "success" });
    });
});


// Logout
router.delete('/logout', async (req, res) => {
    const refreshToken = req.cookies["refreshToken"];
    if(refreshToken == null) return res.sendStatus(400);

    try {

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            await RefreshToken.deleteMany({ username: user.username });
            // const tokens = await RefreshToken.find((err, tokens) => {
            //     if(err) return console.log(err)
            // })
            // console.log(tokens)
            console.log(`${user.username} logged out`);
        });

        // await RefreshToken.deleteOne({ token: refreshToken })
    } catch(err){
        return console.log(err);
    }

    res.cookie("accessToken", "", { expires: new Date(0) });
    res.cookie("refreshToken", "", { expires: new Date(0) });
    res.status(200).send();
});

// Delete user (User chosen to delete account)
router.delete('/delete-account', async (req, res) => {
    const refreshToken = req.cookies["refreshToken"];
    if(!refreshToken) return res.status(400).send({ error: "invalid refresh token" });

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            await User.deleteOne({ username: user.username });
            res.status(200).send({ message: "success" });
        })
    } catch(err){
        return res.status(400).send({ error: "no such user" });
    }
});


// Middleware for authenticating the access token in httpOnly cookie
function authenticateTokenMiddleware(req, res, next){
    const token = req.cookies["accessToken"];
    if(!token) return res.status(400).send({ error: "no access token" });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(400).send({ error: "invalid access token" });
        req.user = user.username;
        next();
    });
}

// Supplementary Functions
function generateAccessToken(username){
    return jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${process.env.ACCESS_TOKEN_MINUTES}m` });
}

function generateRefreshToken(username){
    return jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: `${process.env.REFRESH_TOKEN_DAYS}d` });
}

module.exports = {router};
