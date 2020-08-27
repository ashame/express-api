const express = require('express');

const tera = require('./tera')

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: "API v1"
    });
});

router.use('/tera', tera)

module.exports = router;