const express = require('express');

const router = express.Router();

router.use('/broker-search', require('./broker-search'))

module.exports = router;