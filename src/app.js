const api = require('./api');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.set('trust proxy', 1);

app.use(morgan(process.env.NODE_ENV === 'production' ? ':remote-addr >> :method :url\t:status :response-time ms' : 'dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', api);

app.use((req, res, next) => {
    res.status(404);
    const error = new Error(`Not found - ${req.originalUrl}`);
    next(error);
})

app.use((err, req, res, next) => {
    const status = res.statusCode != 200 ? res.statusCode : 500;
    res.status(status);
    res.json({
        message: err.message
    })
})

module.exports = app;