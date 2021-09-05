const express = require('express');
const app = express();

// GraphQL
const { graphqlHTTP } = require('express-graphql');
const querySchema = require('./graphql/querySchema');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

const { PORT, DATABASE_URL } = require('./config');

const mongoose = require('mongoose');

// Setup Mongoose connection
mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error(err));

const db = mongoose.connection;
db.on('error', err => console.error.bind(console, "database connection error: "));
db.once('open', () => console.log("Database connection established"));

// Setup express middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/auth', authRouter.router);
app.use('/user', userRouter.router);
app.use(express.static(path.resolve(__dirname, "../frontend/build")));

// GraphQL
app.use('/graphql', graphqlHTTP(async req => ({
    schema: querySchema,
    context: () => {
        const token = jwt.decode(req.cookies["accessToken"], process.env.ACCESS_TOKEN_SECRET);
        return { user: token ? token.username : null };
    },
    graphiql: true
})));

// app.use(function(req, res, next) {
//     res.set("Content-Security-Policy", "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:4000");
//     return next();
// });

// Main file send
app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT ? PORT : 4000, () => {
    console.log(`Server listening on port: ${PORT ? PORT : 4000}`);
});