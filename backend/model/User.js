const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    accountType: {
        type: String,
        required: true,
        default: "player"
    }
});

module.exports = mongoose.model("User", userSchema);