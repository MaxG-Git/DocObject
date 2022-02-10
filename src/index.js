
const express = require('express')
const app = express.Router();
app.use(express.static(__dirname));
module.exports = app;
