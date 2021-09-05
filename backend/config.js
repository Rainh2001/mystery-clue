const result = require('dotenv').config();

const { parsed: envs } = result;
module.exports = envs;